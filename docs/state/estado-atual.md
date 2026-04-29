# Estado atual do projeto — Films Dutra Dashboard

Documento de referência do que já foi implementado até aqui (ambiente, Supabase e código de integração). Atualizar quando avançar fases ou mudar infraestrutura.

**Última revisão:** abril de 2026.

---

## Visão rápida

| Área | Situação |
|------|----------|
| Next.js 14 (App Router) | Repositório ativo; build e testes passando |
| Variáveis Supabase | `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em `.env.local` |
| Projeto Supabase | **films_dutra_bd** no ambiente **main / PRODUCTION** |
| Schema `public` | Tabelas, enums, RLS, Storage e triggers conforme PRD §5 e plano Fase 2 |
| Dados | Tabelas criadas; **sem registros de negócio** ainda (ex.: `lessons` vazia) |
| **Fase 3 (auth)** | **Implementada:** middleware, login, áreas `/admin` e `/student`, callback de recuperação de senha; favicon em `public/favicon.ico` |
| **Fase 4 (onboarding)** | **Implementada no código:** `/onboarding/[token]`, Zod, service role no servidor, tabela `onboarding_tokens` — detalhes em [relatório Fase 4 e RLS](./relatorio-fase-4-e-pendencia-rls-fase-2.md) |
| **Fase 5 (admin)** | **Parcial:** layout com sidebar + tema; home com métricas; `/admin/students` e `/admin/students/[id]` (leitura); painel para gerar/copiar link de onboarding (`SUPABASE_SERVICE_ROLE_KEY`). Detalhe do que foi entregue: [relatório Fase 5 (shell, alunos, convite)](./relatorio-fase-5-admin-shell-alunos-e-convite.md). Pendências: paginação/filtros avançados, edição admin no perfil, cards quando Agenda/Financeiro/Trips existirem. |

---

## 1. Plano de implementação (contexto)

O trabalho segue o [plano de implementação](../implementation/plano-de-implementacao.md), derivado do [PRD](../films_dutra_PRD.md).

- **Fase 0** (fundação do repo) e **Fase 1** (design system / shell) — alinhadas ao plano.
- **Fase 2** (Supabase: schema, RLS, Storage, tipos) — **executada** no banco e com tipos versionados. **Pendente (critério do plano):** [validação manual RLS com admin + aluno](./relatorio-fase-4-e-pendencia-rls-fase-2.md#3-fase-2--o-que-já-existe-vs-o-que-falta-rls).
- **Fase 3** (autenticação, middleware, `/login`, proteção de rotas) — **executada no código** (ver seções 4 e [§8](#8-fase-3--como-funciona-na-prática)).
- **Fase 4** (onboarding público) — **executada no código**; ver [relatório](./relatorio-fase-4-e-pendencia-rls-fase-2.md).

A **Fase 5** está **em curso**: já há shell admin, lista/detalhe de alunos e geração de link de onboarding na home; seguem refinamentos do PRD (cards enriquecidos, CRUD perfil, etc.).

---

## 2. Configuração de ambiente (local)

- Arquivo de segredos: **`.env.local`** (não versionado; ver `.gitignore`).
- Variáveis usadas pelo app:
  - `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto (ex.: `https://<ref>.supabase.co`).
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave anônima / publishable (o código também aceita `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` como alias).
  - **`NEXT_PUBLIC_SITE_URL`** (recomendado em produção) — base usada em links de e-mail (recuperação de senha). Em dev costuma ser `http://localhost:3000`. Na Vercel pode omitir se `VERCEL_URL` atender.
- **Supabase Auth — Redirect URLs** (Dashboard → Authentication → URL Configuration): incluir `http://localhost:3000/auth/callback` e o equivalente em produção; sem isso, magic link / PKCE após o e-mail pode falhar.
- Modelo documentado: **`.env.example`** (inclui lembrete das Redirect URLs), comentários para **Supabase CLI** (`SUPABASE_ACCESS_TOKEN`, senha do banco) para `link` e `db push`, sem commitar valores reais.

---

## 3. Banco de dados (Supabase)

### 3.1 Projeto e confirmação visual

No **Table Editor** do Supabase, o schema **`public`** contém as tabelas abaixo (confirmado na interface; exemplo inspecionado: `lessons` existe, com colunas e tipos esperados, **RLS** com políticas — badge numérico no editor — e **0 registros**).

### 3.2 Tabelas criadas

| Tabela | Finalidade (resumo PRD) |
|--------|-------------------------|
| `profiles` | Perfil ligado a `auth.users` (`role`, dados cadastrais, `is_active`, `lgpd_accepted_at`, etc.) |
| `student_details` | Surf, saúde, preferências (1:1 com aluno) |
| `lessons` | Aulas agendadas / status / anotações |
| `evolution_entries` | Evolução do aluno (texto, skills, mídia URLs) |
| `financials` | Lançamentos financeiros por aluno |
| `surf_trips` | Surf trips |
| `trip_registrations` | Inscrições em trips |

### 3.3 Tipos enumerados (Postgres)

Definidos na migração inicial, alinhados ao PRD: `user_role`, `lesson_status`, `financial_type`, `financial_status`, `trip_registration_status`, `surf_level`, `weekly_frequency`.

### 3.4 Funções e triggers

- **`handle_new_user`** — após insert em `auth.users`, cria linha em `profiles` (papel padrão `student`).
- **`set_updated_at`** — mantém `updated_at` em `profiles` e `student_details`.
- **`is_admin()`** — função `SECURITY DEFINER` para políticas RLS (evita recursão ao ler `profiles`).
- **`profiles_guard_student_updates`** — em `UPDATE` de `profiles`, usuários não admin não alteram `role` nem `is_active` (valores forçados a permanecer como antes da linha).

### 3.5 Row Level Security (RLS)

RLS **habilitado** nas tabelas acima. Resumo da intenção:

- **Admin** (`profiles.role = 'admin'`) — acesso amplo onde as políticas permitem escrita/leitura global.
- **Aluno** — em geral só **próprios** dados em `profiles`, `lessons`, `evolution_entries`, `trip_registrations` (conforme políticas por tabela).
- **`student_details`** e **`financials`** — restritos a **admin** no modelo atual (onboarding público na Fase 4 pode exigir RPC `SECURITY DEFINER` ou fluxo com **service role**).
- **`surf_trips`** — leitura para usuários autenticados; escrita administrativa.

Detalhes estão na migração SQL versionada no repositório.

### 3.6 Storage

Buckets previstos na migração:

- **`avatars`** — uploads por pasta do usuário (`<user_id>/...`); leitura para autenticados; escrita no próprio folder ou admin.
- **`trip-covers`** — leitura para autenticados; escrita apenas admin.

### 3.7 Migração versionada

- Arquivo: **`supabase/migrations/20260428100000_initial_schema.sql`**
- **`supabase init`** gerou **`supabase/config.toml`** (desenvolvimento local / CLI).
- Script **`npm run db:push`** aplica migrações ao projeto **linkado** via Supabase CLI.

---

## 4. Código no repositório (integração Supabase e Fase 3)

### 4.1 Clientes e ambiente

| Caminho | Descrição |
|---------|-----------|
| `lib/supabase/env.ts` | `getSupabaseEnv()`, `getSiteUrl()` — URL/chave e origem para redirects de auth |
| `lib/supabase/client.ts` | `createBrowserSupabaseClient()` — uso no browser (login recovery, update password) |
| `lib/supabase/server.ts` | `createServerSupabaseClient()` — Server Actions, Route Handlers, RSC (`@supabase/ssr` + cookies) |
| `lib/supabase/middleware.ts` | `updateSession()` — refresh de sessão + regras de rota por `profiles.role` |
| `middleware.ts` (raiz) | Chama `updateSession`; matcher exclui estáticos conhecidos |

### 4.2 Autenticação e rotas

| Caminho | Descrição |
|---------|-----------|
| `lib/auth/actions.ts` | Server Actions: `loginAction`, `logoutAction`, `requestPasswordResetAction` |
| `lib/validations/auth.ts` | Zod `loginSchema` |
| `app/login/page.tsx` | Página de login; query `next`, `error`; bloco “esqueci a senha” |
| `components/auth/login-form.tsx` | Formulário cliente com `useFormState` |
| `components/auth/logout-button.tsx` | Botão “Sair” (server action) |
| `app/auth/callback/route.ts` | Troca `code` PKCE por sessão (pós-clique no e-mail) |
| `app/auth/update-password/page.tsx` | Define nova senha após link de recuperação |
| `app/admin/layout.tsx` / `app/admin/page.tsx` | Shell admin; bloqueia `is_active === false` |
| `app/student/layout.tsx` / `app/student/page.tsx` | Shell aluno; mesma regra de conta inativa |
| `app/page.tsx` | Link para `/login` |

### 4.3 Tipos

| Caminho | Descrição |
|---------|-----------|
| `types/database.ts` | Schema `public`; `Views`/`CompositeTypes` no formato compatível com supabase-js; tipo exportado **`ProfileRow`** |
| `types/index.ts` | Reexporta `Database`, `Json`, `PublicEnums`, `ProfileRow` |

Onde o inferidor do client ainda produz `never` em algumas chains, o código usa **cast explícito** para `ProfileRow` (revisar após `npm run db:types` com CLI atual).

### 4.4 Dependências e scripts relevantes

- **`@supabase/ssr`** — cookies no servidor/middleware.
- `package.json`: `db:push`, `db:types`, `dev`, `build`, `test`.

### 4.5 Assets

- **Favicon:** `public/favicon.ico` (servido como estático em `/favicon.ico`; evita rota metadata que gerava erro em dev no Windows com cache `.next` inconsistente).
- **`app/layout.tsx`:** `metadata.icons.icon` → `/favicon.ico`.

---

## 5. O que ainda não existe (deliberado ou próximas fases)

- Dados reais de negócio nas tabelas (aulas, financeiro, trips, etc.).
- **Fase 5** — admin: layout com sidebar, home, módulo Alunos, **geração de link de onboarding** no painel (hoje o token pode ser inserido via SQL; ver [relatório Fase 4](./relatorio-fase-4-e-pendencia-rls-fase-2.md)).
- Testes automatizados E2E ou integração para login e redirects (Fase 12 ou incremental).
- Validação manual RLS com **dois usuários** (admin + aluno), item pendente desde o critério da Fase 2 no plano — [roteiro sugerido](./relatorio-fase-4-e-pendencia-rls-fase-2.md#33-o-que-significa-validar-rls-na-prática-roteiro-sugerido).

---

## 6. Checklist rápido pós-deploy / novo dev

1. Copiar `.env.example` → `.env.local` e preencher URL + chave anon do projeto correto; para onboarding, também **`SUPABASE_SERVICE_ROLE_KEY`** (servidor) — ver [.env.example](../../.env.example).
2. Configurar **Redirect URLs** no Supabase para **`/auth/callback`** (localhost + produção).
3. Confirmar no dashboard que as **7 tabelas** existem em `public` e que **RLS** está ativo onde esperado.
4. Promover o primeiro **admin** manualmente (`UPDATE profiles SET role = 'admin' WHERE id = '<uuid>'`) após criar o usuário em Authentication.
5. Rodar `npm run dev` e `npm run build` antes de abrir PR.
6. Se o dev server acusar erro estranho em rotas ou favicon: apagar pasta **`.next`** e subir de novo (`npm run dev`).

---

## 7. Referências

- [PRD — modelagem §5 e segurança §9](../films_dutra_PRD.md)
- [Plano de implementação](../implementation/plano-de-implementacao.md) — [Progresso por fase](../implementation/plano-de-implementacao.md#progresso-por-fase)
- [Relatório — Fase 4 e pendência RLS (Fase 2)](./relatorio-fase-4-e-pendencia-rls-fase-2.md)
- Migrações: `supabase/migrations/20260428100000_initial_schema.sql`, `supabase/migrations/20260429100000_onboarding_tokens.sql`

---

## 8. Fase 3 — como funciona na prática

Resumo para quem vai **usar** ou **testar** o sistema no dia a dia.

### 8.1 Primeiro acesso e papéis

1. Todo usuário criado no **Authentication** do Supabase recebe, via trigger, uma linha em **`profiles`** com `role = student` por padrão.
2. O **primeiro administrador** da escola é promovido **manualmente** no SQL:  
   `UPDATE profiles SET role = 'admin' WHERE id = '<uuid do auth.users>';`
3. Quem entra com **admin** é sempre direcionado para **`/admin`**; quem entra com **student**, para **`/student`**. Tentar abrir a área errada redireciona para a correta.

### 8.2 Fluxo de login (e-mail + senha)

1. O usuário abre **`/login`** (ou clica “Entrar” na home).
2. Submete e-mail e senha → **Server Action** valida com Zod, chama `signInWithPassword`, lê **`profiles`** (`role`, `is_active`).
3. Se a conta estiver **inativa** (`is_active = false`), a sessão é encerrada e aparece mensagem de erro.
4. Após sucesso, o redirect vai para **`/admin`** ou **`/student`**, ou para o path interno em **`?next=`** (se for `/admin` ou `/student`).

### 8.3 Middleware (o que acontece “por baixo”)

A cada requisição coberta pelo matcher, o middleware:

1. Atualiza cookies de sessão Supabase (**refresh**).
2. Identifica o usuário e carrega **`profiles.role`**.
3. **Sem login** e URL começando com `/admin` ou `/student` → redireciona para **`/login?next=...`**.
4. **Com login** em **`/login`** → redireciona para o painel certo (não fica preso na tela de login).
5. **Admin** em rota `/student` → manda para **`/admin`**; **aluno** em `/admin` → manda para **`/student`**.
6. Usuário autenticado mas **sem linha em `profiles`** (caso raro) → **`/login?error=profile`**.

Os layouts de **`/admin`** e **`/student`** conferem de novo **`is_active`**; se inativo, fazem **sign out** e mandam para login com **`?error=inactive`**.

### 8.4 Recuperação de senha (magic link)

1. Em **`/login`**, bloco “Esqueceu a senha?” envia e-mail via **`resetPasswordForEmail`**, com redirect para **`/auth/callback?next=/auth/update-password`** (origem via `getSiteUrl()`).
2. O usuário clica no link do e-mail → **`/auth/callback`** executa **`exchangeCodeForSession`** e redireciona para **`/auth/update-password`**.
3. Na página de nova senha, o browser usa **`createBrowserSupabaseClient`** e **`updateUser({ password })`**.
4. É obrigatório ter as **Redirect URLs** corretas no painel Supabase e **`NEXT_PUBLIC_SITE_URL`** coerente em produção.

### 8.5 Logout

O botão **Sair** dispara **`logoutAction`** (sign out no servidor) e redireciona para **`/login`**.

---

*Este arquivo substitui notas dispersas sobre “o que já foi feito”; mantê-lo sincronizado com o repositório e o dashboard Supabase reduz retrabalho na equipe.*
