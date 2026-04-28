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

---

## 1. Plano de implementação (contexto)

O trabalho segue o [plano de implementação](../implementation/plano-de-implementacao.md), derivado do [PRD](../films_dutra_PRD.md).

- **Fase 0** (fundação do repo) e **Fase 1** (design system / shell) — consideradas alinhadas ao plano (home, tema, etc., conforme evolução do repositório).
- **Fase 2 (Supabase: schema, RLS, Storage, tipos)** — **executada** no banco: migração aplicada; integração no app com cliente browser e tipos.

A **Fase 3** (autenticação, middleware, `/login`, proteção de rotas) é o próximo bloco lógico.

---

## 2. Configuração de ambiente (local)

- Arquivo de segredos: **`.env.local`** (não versionado; ver `.gitignore`).
- Variáveis usadas pelo app:
  - `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto (ex.: `https://<ref>.supabase.co`).
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave anônima / publishable (o código também aceita `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` como alias).
- Modelo documentado: **`.env.example`**, incluindo comentários para **Supabase CLI** (`SUPABASE_ACCESS_TOKEN`, senha do banco) usados em `link` e `db push`, sem commitar valores reais.

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

## 4. Código no repositório (integração Supabase)

| Caminho | Descrição |
|---------|-----------|
| `lib/supabase/client.ts` | `createBrowserSupabaseClient()` usando `@supabase/supabase-js` e tipo genérico `Database` |
| `types/database.ts` | Tipagem do schema `public` (Enums + `Tables`); pode ser **regenerada** com `npm run db:types` após `supabase login` + `supabase link` |
| `types/index.ts` | Reexporta `Database`, `Json`, `PublicEnums` |
| `package.json` | Scripts `db:push` e `db:types` |

---

## 5. O que ainda não existe (deliberado ou próximas fases)

- Dados reais de negócio nas tabelas (aulas, financeiro, trips, etc.).
- **`lib/supabase/server.ts`**, **middleware** e rotas **`/login`** — Fase 3.
- Fluxo de **onboarding** com token e escrita em `student_details` sem quebrar RLS — Fase 4.
- Testes automatizados específicos do schema/RLS (o plano prevê validação manual com dois usuários — admin e aluno).

---

## 6. Checklist rápido pós-deploy / novo dev

1. Copiar `.env.example` → `.env.local` e preencher URL + chave anon do projeto correto.
2. Confirmar no dashboard que as **7 tabelas** existem em `public` e que **RLS** está ativo onde esperado.
3. Promover o primeiro **admin** manualmente (`UPDATE profiles SET role = 'admin' WHERE id = '<uuid>'`) após criar o usuário em Authentication.
4. Rodar `npm run dev` e `npm run build` antes de abrir PR.

---

## 7. Referências

- [PRD — modelagem §5 e segurança §9](../films_dutra_PRD.md)
- [Plano de implementação — Fase 2](../implementation/plano-de-implementacao.md)
- Migração: `supabase/migrations/20260428100000_initial_schema.sql`

---

*Este arquivo substitui notas dispersas sobre “o que já foi feito”; mantê-lo sincronizado com o repositório e o dashboard Supabase reduz retrabalho na equipe.*
