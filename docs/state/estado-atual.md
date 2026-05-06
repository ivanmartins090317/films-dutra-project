# Estado atual do projeto — Films Dutra Dashboard

Documento de referência do que já foi implementado até aqui (ambiente, Supabase e código de integração). Atualizar quando avançar fases ou mudar infraestrutura.

**Última revisão:** maio de 2026 — inclui **Fase 9 (Surf trips admin)**; a secção “Fase 3 na prática” está em **§13**.

---

## Visão rápida

| Área | Situação |
|------|----------|
| Next.js 14 (App Router) | Repositório ativo; build e testes passando |
| Variáveis Supabase | `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em `.env.local` |
| Projeto Supabase | **films_dutra_bd** no ambiente **main / PRODUCTION** |
| Schema `public` | Tabelas, enums, RLS, Storage e triggers conforme PRD §5 e plano Fase 2 |
| Dados | Tabelas criadas; registros dependem do uso (ex.: **`lessons`** na Agenda; **`evolution_entries`** no módulo Evolução) |
| **Fase 3 (auth)** | **Implementada:** middleware, login, áreas `/admin` e `/student`, callback de recuperação de senha; favicon em `public/favicon.ico` |
| **Fase 4 (onboarding)** | **Implementada no código:** `/onboarding/[token]`, Zod, service role no servidor, tabela `onboarding_tokens` — detalhes em [relatório Fase 4 e RLS](./relatorio-fase-4-e-pendencia-rls-fase-2.md) |
| **Fase 5 (admin)** | **Concluída no código** (maio/2026): layout + tema; **home** com cards, feed (próximas aulas, inadimplência, aniversariantes), **atalhos**; lista de alunos com busca, filtros, ordenação, paginação; **avatar** por URL ou **upload admin** para o bucket Storage **`avatars`** (migração `20260504140000_storage_avatars_admin_insert_public.sql`); **última aula** e **resumo financeiro** na linha; detalhe + edição admin de perfil e surf/saúde; convite de onboarding na home. Docs: [relatório Fase 5](./relatorio-fase-5-admin-shell-alunos-e-convite.md), [implementação lista/paginação/edição](./implementacao-fase-5-alunos-paginacao-edicao-admin.md). **Ressalvas:** ver [§5.2](#52-ressalvas-pós-fase-5-prd--operações) (aniversariantes/última aula; RLS manual; E2E na Fase 12). **Fuso “aulas hoje” / horários de aula no feed** — alinhados a **America/São_Paulo** a partir da [Fase 6 — §6](#6-fase-6--agenda--calendário). |
| **Fase 6 (agenda)** | **Concluída no código** (maio/2026): `/admin/agenda` (grade mensal + painel do dia), CRUD **`lessons`**, validação de **conflito de horário por aluno**, histórico no perfil do aluno, `lib/school-timezone.ts` + **`date-fns-tz`**. Detalhes em [§6](#6-fase-6--agenda--calendário). **Opcional:** visão **semana** na UI. |
| **Fase 7 (evolução)** | **Concluída no código** (maio/2026): `/admin/evolution` (filtro por aluno, timeline, CRUD **`evolution_entries`**, tags de habilidade, vínculo opcional a **`lesson_id`** com validação de pertencimento ao aluno), gráfico **Recharts** por frequência de tags, atalho no perfil do aluno. Detalhes em [§7](#7-fase-7--evolução-admin). **v1:** sem upload de mídia (coluna `media_urls` preparada no schema). |
| **Fase 8 (financeiro)** | **Concluída no código** (maio/2026): `/admin/financeiro` — CRUD **`financials`** por aluno, cards (receita no mês, inadimplência, a receber, total histórico), gráfico **Recharts** dos últimos 12 meses, navegação `year`/`month`, entrada na sidebar e atalho na home. Detalhes em [§8](#8-fase-8--financeiro-admin). **Critério RLS:** tabela só para admin; validar manualmente que aluno não lê linhas (`/student` não lista financeiro). |
| **Fase 9 (surf trips)** | **Concluída no código** (maio/2026): `/admin/surf-trips` — CRUD **`surf_trips`**, inscrições **`trip_registrations`** (interessado / confirmado / cancelado), **`spots_taken`** alinhado aos confirmados com regras de vagas, upload de capa no Storage **`trip-covers`** ou URL manual (migração pública `20260506120000_storage_trip_covers_public.sql`). Listagem por ano civil com agrupamento mensal; sidebar, atalhos na home e card “Trips com vagas” no painel. Detalhes em [§9](#9-fase-9--surf-trips-admin). **Próximo:** interação do aluno em `/student` — [Fase 11](../implementation/plano-de-implementacao.md#fase-11--área-do-aluno-student). |

---

## 1. Plano de implementação (contexto)

O trabalho segue o [plano de implementação](../implementation/plano-de-implementacao.md), derivado do [PRD](../films_dutra_PRD.md).

- **Fase 0** (fundação do repo) e **Fase 1** (design system / shell) — alinhadas ao plano.
- **Fase 2** (Supabase: schema, RLS, Storage, tipos) — **executada** no banco e com tipos versionados. **Pendente (critério do plano):** [validação manual RLS com admin + aluno](./relatorio-fase-4-e-pendencia-rls-fase-2.md#3-fase-2--o-que-já-existe-vs-o-que-falta-rls).
- **Fase 3** (autenticação, middleware, `/login`, proteção de rotas) — **executada no código** (ver seções 4 e [§13](#13-fase-3--como-funciona-na-prática)).
- **Fase 4** (onboarding público) — **executada no código**; ver [relatório](./relatorio-fase-4-e-pendencia-rls-fase-2.md).

A **Fase 5** está **concluída no código** (incl. upload de avatar no Storage pela área admin) — detalhes e ressalvas em [§5](#5-fase-5-admin--implementação-e-pendências).

A **Fase 6** (Agenda / calendário de aulas) está **concluída no código** — detalhes em [§6](#6-fase-6--agenda--calendário); plano: [Fase 6 no plano de implementação](../implementation/plano-de-implementacao.md#fase-6--admin-agenda--calendário).

A **Fase 7** (Evolução no admin) está **concluída no código** — detalhes em [§7](#7-fase-7--evolução-admin); plano: [Fase 7 no plano de implementação](../implementation/plano-de-implementacao.md#fase-7--admin-evolução).

A **Fase 8** (Financeiro no admin) está **concluída no código** — detalhes em [§8](#8-fase-8--financeiro-admin); plano: [Fase 8 no plano de implementação](../implementation/plano-de-implementacao.md#fase-8--admin-financeiro).

A **Fase 9** (Surf trips no admin) está **concluída no código** — detalhes em [§9](#9-fase-9--surf-trips-admin); plano: [Fase 9 no plano de implementação](../implementation/plano-de-implementacao.md#fase-9--admin-surf-trips).

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

No **Table Editor** do Supabase, o schema **`public`** contém as tabelas abaixo (confirmado na interface; exemplo inspecionado: `lessons` existe, com colunas e tipos esperados e **RLS** com políticas — badge numérico no editor). O volume de linhas em `lessons` depende do uso da Agenda no app.

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
- **`trip-covers`** — após **`20260506120000_storage_trip_covers_public.sql`**, bucket **público** para URL estável das capas (`getPublicUrl`); escrita apenas **admin** (políticas na migração inicial + bucket update).

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
| `app/admin/layout.tsx` / `app/admin/page.tsx` | Shell admin; bloqueia `is_active === false`. Home (`page.tsx`): cards (**`fetchAdminDashboardCounts`** — “aulas hoje” no fuso da escola) + **`fetchAdminDashboardFeed`** (próximas aulas em horário de Brasília, inadimplência, aniversariantes) + atalhos + convite — ver [§5](#5-fase-5-admin--implementação-e-pendências). |
| `app/admin/agenda/page.tsx` | Agenda admin — ver [§6](#6-fase-6--agenda--calendário). |
| `app/admin/evolution/page.tsx` | Evolução admin — ver [§7](#7-fase-7--evolução-admin). |
| `app/admin/financeiro/page.tsx` | Financeiro admin — ver [§8](#8-fase-8--financeiro-admin). |
| `app/admin/surf-trips/page.tsx` | Surf trips admin — ver [§9](#9-fase-9--surf-trips-admin). |
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
- **`date-fns`** + **`date-fns-tz`** — calendário da Agenda e fuso **America/São_Paulo** (`lib/school-timezone.ts`).
- **`recharts`** — gráficos na Evolução admin ([§7](#7-fase-7--evolução-admin)) e no Financeiro admin ([§8](#8-fase-8--financeiro-admin)).
- `package.json`: `db:push`, `db:types`, `dev`, `build`, `test`.

### 4.5 Assets

- **Favicon:** `public/favicon.ico` (servido como estático em `/favicon.ico`; evita rota metadata que gerava erro em dev no Windows com cache `.next` inconsistente).
- **`app/layout.tsx`:** `metadata.icons.icon` → `/favicon.ico`.

---

## 5. Fase 5 admin — implementação e pendências

Esta secção resume o que entrou no repositório **após maio/2026** na área admin e o que ainda falta para considerar a **Fase 5 fechada** no sentido do [plano § Fase 5](../implementation/plano-de-implementacao.md#fase-5--admin-layout-dashboard-home-e-módulo-alunos) e do PRD §6.3.

### 5.1 Entregue no código (home e lista)

| Área | Descrição |
|------|-----------|
| **Home `/admin`** | Além dos quatro cards (`fetchAdminDashboardCounts` — contagem “aulas hoje” no **dia civil em America/São_Paulo**, excl. canceladas): **`fetchAdminDashboardFeed`** — próximas aulas futuras (exceto canceladas, horários em **Brasília**), lista de lançamentos **overdue** em `financials`, **aniversariantes** em janela de **7 dias** com base em `profiles.birth_date` (alunos ativos, cálculo em **UTC** — ressalva em [§5.2](#52-ressalvas-pós-fase-5-prd--operações)); secção **Atalhos** (Agenda, Financeiro, Surf trips, lista de alunos, login). Componente **`AdminDashboardHomeFeed`** + **`AdminDashboardShortcuts`**. Cards com âncoras para as secções correspondentes. |
| **Lista `/admin/students`** | Após paginar/filtrar, cada página enriquece linhas com **última aula**: maior `lessons.scheduled_at` **≤ agora** por aluno (varredura limitada); **resumo financeiro**: prioridade vencido → pendente → em dia → sem lançamentos (`rollupStudentFinancialStatuses`). Labels de status de aula em PT (`lesson-status-label`). |
| **Biblioteca** | `lib/admin/dashboard-feed-queries.ts`, `student-birthday-window.ts`, `student-financial-rollup.ts`, `lesson-status-label.ts`; testes Vitest em `student-birthday-window.test.ts`, `student-financial-rollup.test.ts`. |

Documentação histórica das fatias anteriores: [relatório Fase 5](./relatorio-fase-5-admin-shell-alunos-e-convite.md), [implementação lista/paginação/edição](./implementacao-fase-5-alunos-paginacao-edicao-admin.md).

### 5.2 Ressalvas pós–Fase 5 (PRD / operações)

Itens que **não impedem** considerar a Fase 5 **fechada no repositório**, mas permanecem no radar:

| Item | Notas |
|------|--------|
| **Fuso horário** | **Aulas** (home: contagem do dia, feed de próximas aulas, Agenda): **America/São_Paulo** — ver [§6](#6-fase-6--agenda--calendário). **Aniversariantes** na home ainda usam janela em **UTC** (melhoria futura: alinhar à escola). |
| **Home vs rotas dedicadas** | Atalhos incluem **`/admin/agenda`**, **`/admin/financeiro`**, **`/admin/evolution`** ([§7](#7-fase-7--evolução-admin)), **`/admin/surf-trips`** ([§9](#9-fase-9--surf-trips-admin)), lista de alunos e login. |
| **Última aula na lista — escala** | Varredura com **limite de linhas**; volume muito grande pode exigir **RPC/view** no Postgres. |
| **Aniversariantes** | Dependem de **`birth_date`** preenchido. |
| **RLS (Fase 2)** | Validação manual com **admin + aluno** continua recomendada antes de produção — [roteiro](./relatorio-fase-4-e-pendencia-rls-fase-2.md#33-o-que-significa-validar-rls-na-prática-roteiro-sugerido). **Conta aluno:** ver [§13.4](#134-conta-de-teste-aluno). |
| **Fase 12** | Testes **E2E** e hardening LGPD/deploy. |

---

## 6. Fase 6 — Agenda / calendário

Módulo alinhado ao [plano — Fase 6](../implementation/plano-de-implementacao.md#fase-6--admin-agenda--calendário) e ao PRD §6.3 (Agenda).

### 6.1 Entregue no código

| Área | Descrição |
|------|-----------|
| **Rota `/admin/agenda`** | Calendário **mensual** (grade) + painel do **dia** selecionado; navegação por mês (`?year=&month=`); dia inicial opcional (`?day=yyyy-MM-dd`). Sidebar admin com entrada **Agenda**. |
| **CRUD `lessons`** | Formulário (dialog): aluno, data e hora (**interpretadas em America/São_Paulo**), duração, `lesson_status`, motivo de cancelamento (obrigatório se cancelada), `notes`, `skills_noted` (tags separadas por vírgula). Server Actions em **`lib/admin/lesson-admin-actions.ts`**. |
| **Conflitos** | Duas aulas **não canceladas** do mesmo aluno não podem ter intervalos `[início, início+duração)` sobrepostos — `lib/admin/lesson-overlap.ts`. |
| **Fuso** | **`lib/school-timezone.ts`** — constante `SCHOOL_TIMEZONE = 'America/Sao_Paulo'` (MVP); **`date-fns-tz`** (`fromZonedTime` / `formatInTimeZone`). Home admin: **`lib/admin/dashboard-queries.ts`** (aulas hoje no dia civil da escola; desconsidera canceladas na contagem). |
| **Perfil do aluno** | Secção **Aulas** em `/admin/students/[id]` — histórico recente + links para a agenda (`fetchLessonsForStudent` em **`lib/admin/lessons-queries.ts`**). |
| **Validação** | Zod: **`lib/validations/lesson.ts`** (`adminLessonFormSchema`, `parseSkillsNoted`). |
| **Testes** | Vitest: `__tests__/lesson-overlap.test.ts`, `__tests__/lesson-validation.test.ts`. |

### 6.2 Arquivos principais (referência rápida)

`app/admin/agenda/page.tsx`, `components/admin/admin-agenda-client.tsx`, `components/admin/lesson-form-dialog.tsx`, `components/admin/admin-student-lessons-section.tsx`, `lib/admin/lessons-queries.ts`, `lib/admin/lesson-admin-actions.ts`, `lib/school-timezone.ts`.

### 6.3 Pendências opcionais de produto

- **Visão semana** na UI (o plano permite entrega progressiva mês + dia).
- **Fuso configurável** via Configurações da escola ([Fase 10](../implementation/plano-de-implementacao.md#fase-10--admin-configurações)) em vez de constante no código.

---

## 7. Fase 7 — Evolução admin

Módulo alinhado ao [plano — Fase 7](../implementation/plano-de-implementacao.md#fase-7--admin-evolução) e ao PRD (evolução em texto/tags no MVP).

### 7.1 Entregue no código

| Área | Descrição |
|------|-----------|
| **Rota `/admin/evolution`** | Seleção de aluno (`?student=<uuid>`; se ausente ou inválido, usa o primeiro aluno ativo na lista); timeline ordenada por data da entrada (+ `created_at`); entrada **Evolução** na sidebar admin. |
| **CRUD `evolution_entries`** | Dialog com data (`entry_date`), texto (`content`), tags (`skills`, campo livre com mesmo critério de parsing que `skills_noted` das aulas), **`lesson_id` opcional** — ação valida que a aula pertence ao mesmo aluno. Server Actions em **`lib/admin/evolution-admin-actions.ts`**. |
| **Gráfico** | **Recharts** — barras com contagem agregada de tags (lista vazia ou sem tags não quebra a página). Agregação em **`lib/admin/evolution-skill-stats.ts`**. |
| **Perfil do aluno** | Bloco com link para **`/admin/evolution?student=...`** (`admin-student-evolution-section.tsx`). |
| **Validação** | Zod: **`lib/validations/evolution.ts`** (`adminEvolutionFormSchema`). |
| **Testes** | Vitest: `__tests__/evolution-validation.test.ts`, `__tests__/evolution-skill-stats.test.ts`. |

### 7.2 Arquivos principais (referência rápida)

`app/admin/evolution/page.tsx`, `components/admin/admin-evolution-client.tsx`, `components/admin/evolution-form-dialog.tsx`, `components/admin/evolution-skills-chart.tsx`, `components/admin/admin-student-evolution-section.tsx`, `lib/admin/evolution-queries.ts`, `lib/admin/evolution-admin-actions.ts`, `lib/admin/evolution-skill-stats.ts`, `lib/validations/evolution.ts`.

### 7.3 Pendências / v2

- **Upload de mídia** em evolução (Storage) — previsto pós-MVP no plano; coluna `media_urls` já existe no schema.

---

## 8. Fase 8 — Financeiro admin

Módulo alinhado ao [plano — Fase 8](../implementation/plano-de-implementacao.md#fase-8--admin-financeiro) e à tabela **`financials`** (PRD §6.3).

### 8.1 Entregue no código

| Área | Descrição |
|------|-----------|
| **Rota `/admin/financeiro`** | Cards de **receita no mês** (soma dos pagamentos cuja **`paid_at`** cai no mês de referência), **inadimplência** (valor e quantidade com vencimento antes do dia atual na escola e sem `paid_at`), **a receber** em aberto, **total recebido histórico**; navegação **mês anterior / próximo** (`?year=&month=`); filtro **`?student=<uuid>`** alinhado à lista de alunos ativos. |
| **CRUD `financials`** | Dialog com tipo (`financial_type`), valor, vencimento, **pago em** (opcional), observações; **status** persistido conforme **`deriveFinancialStatus`** (`lib/admin/financial-status.ts`). Não permite trocar o aluno ao editar. Server Actions em **`lib/admin/financial-admin-actions.ts`**. |
| **Gráfico** | Barras **Recharts** dos recebidos por mês (últimos 12 meses terminando na referência) — **`financial-monthly-chart.tsx`**. |
| **Perfil do aluno** | Bloco com link para **`/admin/financeiro?student=...`** (`admin-student-finance-section.tsx`). |
| **Sidebar / home** | Entrada **Financeiro** (`admin-sidebar.tsx`); atalhos na **`AdminDashboardShortcuts`** (ver também **Surf trips** em [§9](#9-fase-9--surf-trips-admin)). |
| **Validação** | Zod: **`lib/validations/financial.ts`**. |
| **Testes** | Vitest: `__tests__/financial-status.test.ts`, `__tests__/financial-validation.test.ts`, `__tests__/financial-dashboard-stats.test.ts`. |

### 8.2 Arquivos principais (referência rápida)

`app/admin/financeiro/page.tsx`, `components/admin/admin-financeiro-client.tsx`, `components/admin/financial-form-dialog.tsx`, `components/admin/financial-monthly-chart.tsx`, `components/admin/admin-student-finance-section.tsx`, `lib/admin/financial-queries.ts`, `lib/admin/financial-dashboard-stats.ts`, `lib/admin/financial-admin-actions.ts`, `lib/admin/financial-status.ts`, `lib/validations/financial.ts`.

### 8.3 Pendências / operação

- **RLS:** confirmar em dev com conta **aluno** que **`select`/API não retorna linhas de `financials`** (critério do plano).

---

## 9. Fase 9 — Surf trips admin

Módulo alinhado ao [plano — Fase 9](../implementation/plano-de-implementacao.md#fase-9--admin-surf-trips) e às tabelas **`surf_trips`** / **`trip_registrations`** (PRD §5).

### 9.1 Entregue no código

| Área | Descrição |
|------|-----------|
| **Rota `/admin/surf-trips`** | Filtro por **ano civil** (`?year=`, padrão ano atual em **America/São_Paulo**); lista **agrupada por mês**; navegação ano anterior / seguinte. |
| **CRUD `surf_trips`** | Diálogo (criar/editar/excluir): título, destino, data, vagas totais, descrição, **URL de capa** opcional. |
| **`trip_registrations`** | Incluir aluno ativo ainda não inscrito na trip; alterar situação (**interessado**, **confirmado**, **cancelado**); remover inscrição. |
| **Vagas (`spots_taken`)** | Mantido **alinhado à contagem de confirmados** após mutações; impede confirmar além de **`spots_total`**; reduzir vagas abaixo do número de confirmados retorna erro coerente com o `CHECK` do Postgres. |
| **Capa** | **Upload** (JPEG/PNG/WebP até 2 MB) para o bucket **`trip-covers`** (`{tripId}/cover.ext`) ou URL colada no formulário. Migração **`20260506120000_storage_trip_covers_public.sql`** — bucket público para leitura via URL. |
| **Sidebar / home** | Item **Surf trips** (`admin-sidebar.tsx`); **atalhos** e card **“Trips com vagas”** apontando para **`/admin/surf-trips`**. |
| **Validação** | Zod: **`lib/validations/surf-trip.ts`**. |
| **Testes** | Vitest: **`__tests__/surf-trip-validation.test.ts`**. |

### 9.2 Arquivos principais (referência rápida)

`app/admin/surf-trips/page.tsx`, `components/admin/admin-surf-trips-client.tsx`, `components/admin/surf-trip-form-dialog.tsx`, `lib/admin/trip-queries.ts`, `lib/admin/trip-admin-actions.ts`, `lib/validations/surf-trip.ts`.

### 9.3 Pendências / próximas fases

- **Área do aluno** — listar trips, interesse e confirmação conforme [Fase 11](../implementation/plano-de-implementacao.md#fase-11--área-do-aluno-student).
- **Operação:** aplicar no projeto Supabase a migração **`trip-covers` público** se ainda não estiver deployada (URLs de capa após upload).

---

## 10. O que ainda não existe (deliberado ou próximas fases)

- Dados reais de negócio em **`surf_trips`** / **`trip_registrations`** dependem do uso do módulo admin; **Agenda**, **Evolução**, **Financeiro** e **Surf trips** persistem nas respectivas tabelas quando utilizados.
- **Fases 10–11** — Configurações da escola, área do aluno (`/student/*`) com paridade de leitura e trips, conforme [plano](../implementation/plano-de-implementacao.md).
- Testes automatizados **E2E** ou integração ampla para login e redirects (**Fase 12** ou incremental).
- Validação manual **RLS** com **dois usuários** (admin + aluno), item pendente desde o critério da **Fase 2** no plano — [roteiro sugerido](./relatorio-fase-4-e-pendencia-rls-fase-2.md#33-o-que-significa-validar-rls-na-prática-roteiro-sugerido).

---

## 11. Checklist rápido pós-deploy / novo dev

1. Copiar `.env.example` → `.env.local` e preencher URL + chave anon do projeto correto; para onboarding, também **`SUPABASE_SERVICE_ROLE_KEY`** (servidor) — ver [.env.example](../../.env.example).
2. Configurar **Redirect URLs** no Supabase para **`/auth/callback`** (localhost + produção).
3. Confirmar no dashboard que as **7 tabelas** existem em `public` e que **RLS** está ativo onde esperado.
4. Aplicar migrações (`npm run db:push` ou fluxo do time), incluindo Storage **`avatars`** (upload admin + bucket público — ver `supabase/migrations/20260504140000_storage_avatars_admin_insert_public.sql`) e **`trip-covers` público** para capas de surf trips (`supabase/migrations/20260506120000_storage_trip_covers_public.sql`).
5. Promover o primeiro **admin** manualmente (`UPDATE profiles SET role = 'admin' WHERE id = '<uuid>'`) após criar o usuário em Authentication.
6. Para testes **aluno + admin**, criar um segundo usuário em Authentication (não elevar a admin) — ver [§13.4](#134-conta-de-teste-aluno).
7. Rodar `npm run dev` e `npm run build` antes de abrir PR.
8. Se o dev server acusar erro estranho em rotas ou favicon: apagar pasta **`.next`** e subir de novo (`npm run dev`).

---

## 12. Referências

- [PRD — modelagem §5 e segurança §9](../films_dutra_PRD.md)
- [Plano de implementação](../implementation/plano-de-implementacao.md) — [Progresso por fase](../implementation/plano-de-implementacao.md#progresso-por-fase) — [Fase 6 resumida](../implementation/plano-de-implementacao.md#fase-6--admin-agenda--calendário) — [Fase 7 resumida](../implementation/plano-de-implementacao.md#fase-7--admin-evolução) — [Fase 8 resumida](../implementation/plano-de-implementacao.md#fase-8--admin-financeiro) — [Fase 9 resumida](../implementation/plano-de-implementacao.md#fase-9--admin-surf-trips)
- [Relatório — Fase 4 e pendência RLS (Fase 2)](./relatorio-fase-4-e-pendencia-rls-fase-2.md)
- [Relatório — Fase 5 (histórico + atualizações)](./relatorio-fase-5-admin-shell-alunos-e-convite.md)
- [Implementação — Fase 5 complementos](./implementacao-fase-5-alunos-paginacao-edicao-admin.md)
- Migrações: `supabase/migrations/20260428100000_initial_schema.sql`, `supabase/migrations/20260429100000_onboarding_tokens.sql`, `supabase/migrations/20260504140000_storage_avatars_admin_insert_public.sql`, `supabase/migrations/20260506120000_storage_trip_covers_public.sql`

---

## 13. Fase 3 — como funciona na prática

Resumo para quem vai **usar** ou **testar** o sistema no dia a dia.

### 13.1 Primeiro acesso e papéis

1. Todo usuário criado no **Authentication** do Supabase recebe, via trigger, uma linha em **`profiles`** com `role = student` por padrão.
2. O **primeiro administrador** da escola é promovido **manualmente** no SQL:  
   `UPDATE profiles SET role = 'admin' WHERE id = '<uuid do auth.users>';`
3. Quem entra com **admin** é sempre direcionado para **`/admin`**; quem entra com **student**, para **`/student`**. Tentar abrir a área errada redireciona para a correta.

### 13.2 Fluxo de login (e-mail + senha)

1. O usuário abre **`/login`** (ou clica “Entrar” na home).
2. Submete e-mail e senha → **Server Action** valida com Zod, chama `signInWithPassword`, lê **`profiles`** (`role`, `is_active`).
3. Se a conta estiver **inativa** (`is_active = false`), a sessão é encerrada e aparece mensagem de erro.
4. Após sucesso, o redirect vai para **`/admin`** ou **`/student`**, ou para o path interno em **`?next=`** (se for `/admin` ou `/student`).

### 13.3 Middleware (o que acontece “por baixo”)

A cada requisição coberta pelo matcher, o middleware:

1. Atualiza cookies de sessão Supabase (**refresh**).
2. Identifica o usuário e carrega **`profiles.role`**.
3. **Sem login** e URL começando com `/admin` ou `/student` → redireciona para **`/login?next=...`**.
4. **Com login** em **`/login`** → redireciona para o painel certo (não fica preso na tela de login).
5. **Admin** em rota `/student` → manda para **`/admin`**; **aluno** em `/admin` → manda para **`/student`**.
6. Usuário autenticado mas **sem linha em `profiles`** (caso raro) → **`/login?error=profile`**.

Os layouts de **`/admin`** e **`/student`** conferem de novo **`is_active`**; se inativo, fazem **sign out** e mandam para login com **`?error=inactive`**.

### 13.4 Conta de teste aluno

Para o roteiro **RLS** (admin vê tudo; aluno só o próprio) e para validar **`/student`**:

1. No **Supabase Dashboard** → **Authentication** → **Users** → **Add user** (ou “Invite” / “Create user”, conforme a UI), informe **e-mail** e **senha** distintos do admin.
2. O trigger **`handle_new_user`** cria automaticamente **`profiles`** com **`role = student`**. Não execute `UPDATE` promovendo essa conta a admin.
3. Se o projeto exigir **confirmação de e-mail**, confirme o usuário no painel ou desative temporariamente a confirmação em **Auth → Providers → Email** (apenas em dev).
4. Acesse **`/login`** com esse usuário → o app deve redirecionar para **`/student`**. O admin continua acessando **`/admin`**.

**Alternativa com dados completos de onboarding:** na home admin, use **Gerar link** de onboarding e conclua o fluxo em `/onboarding/<token>` com outro e-mail (cria perfil aluno com `student_details` preenchido).

### 13.5 Recuperação de senha (magic link)

1. Em **`/login`**, bloco “Esqueceu a senha?” envia e-mail via **`resetPasswordForEmail`**, com redirect para **`/auth/callback?next=/auth/update-password`** (origem via `getSiteUrl()`).
2. O usuário clica no link do e-mail → **`/auth/callback`** executa **`exchangeCodeForSession`** e redireciona para **`/auth/update-password`**.
3. Na página de nova senha, o browser usa **`createBrowserSupabaseClient`** e **`updateUser({ password })`**.
4. É obrigatório ter as **Redirect URLs** corretas no painel Supabase e **`NEXT_PUBLIC_SITE_URL`** coerente em produção.

### 13.6 Logout

O botão **Sair** dispara **`logoutAction`** (sign out no servidor) e redireciona para **`/login`**.

---

*Este arquivo substitui notas dispersas sobre “o que já foi feito”; mantê-lo sincronizado com o repositório e o dashboard Supabase reduz retrabalho na equipe.*
