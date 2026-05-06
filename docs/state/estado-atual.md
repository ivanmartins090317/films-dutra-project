# Estado atual do projeto — Films Dutra Dashboard

Documento de referência do que já foi implementado até aqui (ambiente, Supabase e código de integração). Atualizar quando avançar fases ou mudar infraestrutura.

**Última revisão:** maio de 2026 — inclui **Fase 12** (privacidade pública, E2E smoke, headers de segurança, testes `loginSchema`); [§12.1](#121-fase-12--entregue-no-código). A secção “Fase 3 na prática” está em **§16**.

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
| **Fase 5 (admin)** | **Concluída no código** (maio/2026): layout + tema; **home** com cards, feed (próximas aulas, inadimplência, aniversariantes), **atalhos**; lista de alunos com busca, filtros, ordenação, paginação; **avatar** por URL ou **upload admin** para o bucket Storage **`avatars`** (migração `20260504140000_storage_avatars_admin_insert_public.sql`); **última aula** e **resumo financeiro** na linha; detalhe + edição admin de perfil e surf/saúde; convite de onboarding na home. Docs: [relatório Fase 5](./relatorio-fase-5-admin-shell-alunos-e-convite.md), [implementação lista/paginação/edição](./implementacao-fase-5-alunos-paginacao-edicao-admin.md). **Ressalvas:** ver [§5.2](#52-ressalvas-pós-fase-5-prd--operações) (aniversariantes/última aula; RLS manual). **Fuso “aulas hoje” / horários de aula no feed** — alinhados a **America/São_Paulo** a partir da [Fase 6 — §6](#6-fase-6--agenda--calendário). |
| **Fase 6 (agenda)** | **Concluída no código** (maio/2026): `/admin/agenda` (grade mensal + painel do dia), CRUD **`lessons`**, validação de **conflito de horário por aluno**, histórico no perfil do aluno, `lib/school-timezone.ts` + **`date-fns-tz`**. Detalhes em [§6](#6-fase-6--agenda--calendário). **Opcional:** visão **semana** na UI. |
| **Fase 7 (evolução)** | **Concluída no código** (maio/2026): `/admin/evolution` (filtro por aluno, timeline, CRUD **`evolution_entries`**, tags de habilidade, vínculo opcional a **`lesson_id`** com validação de pertencimento ao aluno), gráfico **Recharts** por frequência de tags, atalho no perfil do aluno. Detalhes em [§7](#7-fase-7--evolução-admin). **v1:** sem upload de mídia (coluna `media_urls` preparada no schema). |
| **Fase 8 (financeiro)** | **Concluída no código** (maio/2026): `/admin/financeiro` — CRUD **`financials`** por aluno, cards (receita no mês, inadimplência, a receber, total histórico), gráfico **Recharts** dos últimos 12 meses, navegação `year`/`month`, entrada na sidebar e atalho na home. Detalhes em [§8](#8-fase-8--financeiro-admin). **Critério RLS:** tabela só para admin; validar manualmente que aluno não lê linhas (`/student` não lista financeiro). |
| **Fase 9 (surf trips)** | **Concluída no código** (maio/2026): `/admin/surf-trips` — CRUD **`surf_trips`**, inscrições **`trip_registrations`** (interessado / confirmado / cancelado), **`spots_taken`** alinhado aos confirmados com regras de vagas, upload de capa no Storage **`trip-covers`** ou URL manual (migração pública `20260506120000_storage_trip_covers_public.sql`). Listagem por ano civil com agrupamento mensal; sidebar, atalhos na home e card “Trips com vagas” no painel. Detalhes em [§9](#9-fase-9--surf-trips-admin). |
| **Fase 10 (configurações)** | **Concluída no código** (maio/2026): tabela **`school_settings`** (singleton), **`/admin/configuracoes`** (nome, contato, URL do logo, interruptor **portal dos alunos**), branding em **`/login`** e cabeçalho admin; **`student_portal_enabled`** + middleware/login/layout bloqueiam **`/student`** quando desligado; **conta inativa** continua por **`profiles.is_active`** (módulo Alunos). Migração **`20260507100000_school_settings.sql`**. Detalhes em [§10](#10-fase-10--configurações-da-escola). |
| **Fase 12 (hardening / LGPD / testes / handoff)** | **Concluída no código** (maio/2026): **`/privacidade`** (modelo de política + branding opcional), **`PublicLegalFooter`** em home/login/onboarding, onboarding com link para política e melhorias de **a11y** no aceite LGPD, **headers** de segurança em `next.config.mjs`, Vitest **`lib/validations/auth.test.ts`**, **Playwright** `e2e/smoke.spec.ts` (porta **3310** por padrão) + job no CI; checklist manual em [checklist-validacao-producao-fase-12.md](./implementado/checklist-validacao-producao-fase-12.md). **Operação:** revisão jurídica do texto, deploy Vercel, validação com usuários reais — ver [implementação Fase 12](./implementado/implementacao-fase-12-hardening-lgpd-testes-deploy.md). |

---

## 1. Plano de implementação (contexto)

O trabalho segue o [plano de implementação](../implementation/plano-de-implementacao.md), derivado do [PRD](../films_dutra_PRD.md).

- **Fase 0** (fundação do repo) e **Fase 1** (design system / shell) — alinhadas ao plano.
- **Fase 2** (Supabase: schema, RLS, Storage, tipos) — **executada** no banco e com tipos versionados. **Pendente (critério do plano):** [validação manual RLS com admin + aluno](./relatorio-fase-4-e-pendencia-rls-fase-2.md#3-fase-2--o-que-já-existe-vs-o-que-falta-rls).
- **Fase 3** (autenticação, middleware, `/login`, proteção de rotas) — **executada no código** (ver seções 4 e [§16](#16-fase-3--como-funciona-na-prática)).
- **Fase 4** (onboarding público) — **executada no código**; ver [relatório](./relatorio-fase-4-e-pendencia-rls-fase-2.md).

A **Fase 5** está **concluída no código** (incl. upload de avatar no Storage pela área admin) — detalhes e ressalvas em [§5](#5-fase-5-admin--implementação-e-pendências).

A **Fase 6** (Agenda / calendário de aulas) está **concluída no código** — detalhes em [§6](#6-fase-6--agenda--calendário); plano: [Fase 6 no plano de implementação](../implementation/plano-de-implementacao.md#fase-6--admin-agenda--calendário).

A **Fase 7** (Evolução no admin) está **concluída no código** — detalhes em [§7](#7-fase-7--evolução-admin); plano: [Fase 7 no plano de implementação](../implementation/plano-de-implementacao.md#fase-7--admin-evolução).

A **Fase 8** (Financeiro no admin) está **concluída no código** — detalhes em [§8](#8-fase-8--financeiro-admin); plano: [Fase 8 no plano de implementação](../implementation/plano-de-implementacao.md#fase-8--admin-financeiro).

A **Fase 9** (Surf trips no admin) está **concluída no código** — detalhes em [§9](#9-fase-9--surf-trips-admin); plano: [Fase 9 no plano de implementação](../implementation/plano-de-implementacao.md#fase-9--admin-surf-trips).

A **Fase 10** (Configurações da escola) está **concluída no código** — detalhes em [§10](#10-fase-10--configurações-da-escola); plano: [Fase 10 no plano de implementação](../implementation/plano-de-implementacao.md#fase-10--admin-configurações).

A **Fase 11** (Área do aluno) está **concluída no código** — detalhes em [§11](#11-fase-11--área-do-aluno-student); plano: [Fase 11 no plano de implementação](../implementation/plano-de-implementacao.md#fase-11--área-do-aluno-student).

A **Fase 12** (Hardening LGPD, testes, deploy e handoff) está **concluída no código** — detalhes em [§12.1](#121-fase-12--entregue-no-código); plano: [Fase 12 no plano de implementação](../implementation/plano-de-implementacao.md#fase-12--hardening-lgpd-testes-e-deploy).

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
| `school_settings` | Configurações institucionais (singleton): nome, contato, logo URL, portal dos alunos ligado/desligado |

### 3.3 Tipos enumerados (Postgres)

Definidos na migração inicial, alinhados ao PRD: `user_role`, `lesson_status`, `financial_type`, `financial_status`, `trip_registration_status`, `surf_level`, `weekly_frequency`.

### 3.4 Funções e triggers

- **`handle_new_user`** — após insert em `auth.users`, cria linha em `profiles` (papel padrão `student`).
- **`set_updated_at`** — mantém `updated_at` em `profiles`, `student_details` e **`school_settings`** (Fase 10).
- **`is_admin()`** — função `SECURITY DEFINER` para políticas RLS (evita recursão ao ler `profiles`).
- **`profiles_guard_student_updates`** — em `UPDATE` de `profiles`, usuários não admin não alteram `role` nem `is_active` (valores forçados a permanecer como antes da linha).
- **`refresh_surf_trip_confirmed_spots(uuid)`** + trigger **`trip_registrations_refresh_spots`** em **`trip_registrations`** (migração **`20260508150000_sync_surf_trips_spots_on_registration.sql`**) — recalculam **`surf_trips.spots_taken`** a partir das linhas **confirmadas**, permitindo que o **aluno** atualize inscrições sem política de escrita em **`surf_trips`** (Fase 11).

### 3.5 Row Level Security (RLS)

RLS **habilitado** nas tabelas acima. Resumo da intenção:

- **Admin** (`profiles.role = 'admin'`) — acesso amplo onde as políticas permitem escrita/leitura global.
- **Aluno** — em geral só **próprios** dados em `profiles`, `lessons`, `evolution_entries`, `trip_registrations` (conforme políticas por tabela).
- **`student_details`** e **`financials`** — restritos a **admin** no modelo atual (onboarding público na Fase 4 pode exigir RPC `SECURITY DEFINER` ou fluxo com **service role**).
- **`surf_trips`** — leitura para usuários autenticados; escrita administrativa.
- **`school_settings`** — **SELECT** para `anon` e `authenticated` (branding no login e checagem do portal no middleware); **UPDATE** apenas **admin** (`is_admin()`).

Detalhes estão na migração SQL versionada no repositório.

### 3.6 Storage

Buckets previstos na migração:

- **`avatars`** — uploads por pasta do usuário (`<user_id>/...`); leitura para autenticados; escrita no próprio folder ou admin.
- **`trip-covers`** — após **`20260506120000_storage_trip_covers_public.sql`**, bucket **público** para URL estável das capas (`getPublicUrl`); escrita apenas **admin** (políticas na migração inicial + bucket update).

### 3.7 Migração versionada

- Arquivos principais: **`supabase/migrations/20260428100000_initial_schema.sql`**, **`supabase/migrations/20260507100000_school_settings.sql`** (Fase 10 — `school_settings`), **`supabase/migrations/20260508150000_sync_surf_trips_spots_on_registration.sql`** (Fase 11 — vagas ocupadas em **`surf_trips`** sincronizadas com **`trip_registrations`**).
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
| `lib/supabase/middleware.ts` | `updateSession()` — refresh de sessão + rota por `profiles.role`; aluno com portal desligado ou inativo não entra em `/student` (**`error=portal`** / **`inactive`**); estudante bloqueado não é redirecionado para `/student` ao abrir `/login` |
| `middleware.ts` (raiz) | Chama `updateSession`; matcher exclui estáticos conhecidos |

### 4.2 Autenticação e rotas

| Caminho | Descrição |
|---------|-----------|
| `lib/auth/actions.ts` | Server Actions: `loginAction` (aluno bloqueado se **`student_portal_enabled === false`**), `logoutAction`, `requestPasswordResetAction` |
| `lib/validations/auth.ts` | Zod `loginSchema` |
| `app/login/page.tsx` | Página de login; query `next`, `error` (**`inactive`**, **`portal`**, profile, auth); branding a partir de **`school_settings`** (**`SchoolBrandMark`**, nome, `mailto` opcional); bloco “esqueci a senha” |
| `components/auth/login-form.tsx` | Formulário cliente com `useFormState` |
| `components/auth/logout-button.tsx` | Botão “Sair” (server action) |
| `app/auth/callback/route.ts` | Troca `code` PKCE por sessão (pós-clique no e-mail) |
| `app/auth/update-password/page.tsx` | Define nova senha após link de recuperação |
| `app/admin/layout.tsx` / `app/admin/page.tsx` | Shell admin; título no header com nome da escola (**`fetchSchoolSettings`**); bloqueia `is_active === false`. Home (`page.tsx`): cards (**`fetchAdminDashboardCounts`** — “aulas hoje” no fuso da escola) + **`fetchAdminDashboardFeed`** (próximas aulas em horário de Brasília, inadimplência, aniversariantes) + atalhos + convite — ver [§5](#5-fase-5-admin--implementação-e-pendências). |
| `app/admin/agenda/page.tsx` | Agenda admin — ver [§6](#6-fase-6--agenda--calendário). |
| `app/admin/evolution/page.tsx` | Evolução admin — ver [§7](#7-fase-7--evolução-admin). |
| `app/admin/financeiro/page.tsx` | Financeiro admin — ver [§8](#8-fase-8--financeiro-admin). |
| `app/admin/surf-trips/page.tsx` | Surf trips admin — ver [§9](#9-fase-9--surf-trips-admin). |
| `app/admin/configuracoes/page.tsx` | Configurações da escola — ver [§10](#10-fase-10--configurações-da-escola). |
| `app/student/layout.tsx` | Shell aluno: **`requireStudentSession`**, nome da escola, **`ThemeToggle`**, **`StudentSidebar`**, **`LogoutButton`** — ver [§11](#11-fase-11--área-do-aluno-student). |
| `app/student/page.tsx` | Home aluno — próximas aulas, prévia de evolução, comunicados |
| `app/student/perfil/page.tsx` | Perfil (somente **`profiles`**) + formulário **solicitar atualização** (`mailto`) |
| `app/student/aulas/page.tsx` | Histórico de **`lessons`** (leitura) |
| `app/student/evolucao/page.tsx` | Timeline **`evolution_entries`** (leitura) |
| `app/student/trips/page.tsx` | Surf trips futuras + painel cliente (**`StudentTripsPanel`**) |
| `lib/student/session.ts`, `lib/student/student-portal-queries.ts`, `lib/student/trip-student-actions.ts` | Sessão aluno, queries RLS e action de inscrição em trips |
| `lib/validations/student-trip.ts` | Zod para payload da action de trip (`studentTripRegistrationUpsertSchema`) |
| `components/student/*` | Sidebar, comunicados, perfil, solicitar atualização, lista de trips |
| `app/page.tsx` | Link para `/login` |

### 4.3 Tipos

| Caminho | Descrição |
|---------|-----------|
| `types/database.ts` | Schema `public`; `Views`/`CompositeTypes` no formato compatível com supabase-js; tipo exportado **`ProfileRow`** |
| `types/index.ts` | Reexporta `Database`, `Json`, `PublicEnums`, `ProfileRow` |

Onde o inferidor do client ainda produz `never` em algumas chains, o código usa **cast explícito** para `ProfileRow` (revisar após `npm run db:types` com CLI atual). **`createServerSupabaseClient`** e o cliente do middleware usam **`as unknown as AppSupabaseClient`** (`lib/supabase/ssr-client-type.ts`) para alinhar genéricos do `@supabase/ssr` ao schema `Database`.

### 4.4 Dependências e scripts relevantes

- **`@supabase/ssr`** — cookies no servidor/middleware.
- **`date-fns`** + **`date-fns-tz`** — calendário da Agenda e fuso **America/São_Paulo** (`lib/school-timezone.ts`).
- **`recharts`** — gráficos na Evolução admin ([§7](#7-fase-7--evolução-admin)) e no Financeiro admin ([§8](#8-fase-8--financeiro-admin)).
- `package.json`: `db:push`, `db:types`, `dev`, `build`, `test`.
- Testes Vitest incluem **`__tests__/student-trip-validation.test.ts`** (validação Zod da inscrição em trips no portal).

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
| **RLS (Fase 2)** | Validação manual com **admin + aluno** continua recomendada antes de produção — [roteiro](./relatorio-fase-4-e-pendencia-rls-fase-2.md#33-o-que-significa-validar-rls-na-prática-roteiro-sugerido). **Conta aluno:** ver [§16.4](#164-conta-de-teste-aluno). |

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
- **Fuso configurável** na UI (ex. por escola) — **ainda não** implementado; o fuso continua em constante **`America/São_Paulo`** no código. A [Fase 10](#10-fase-10--configurações-da-escola) entregou branding e portal, não seleção de fuso.

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

### 9.3 Pendências / operação

- **Portal do aluno** para trips — entregue em [§11](#11-fase-11--área-do-aluno-student); admin continua sendo a fonte de verdade para criar/editar **`surf_trips`**.
- **Operação:** aplicar no projeto Supabase a migração **`trip-covers` público** se ainda não estiver deployada (URLs de capa após upload); aplicar também **`20260508150000_sync_surf_trips_spots_on_registration.sql`** para vagas consistentes quando alunos confirmam pelo portal.

---

## 10. Fase 10 — Configurações da escola

Módulo alinhado ao [plano — Fase 10](../implementation/plano-de-implementacao.md#fase-10--admin-configurações) e ao PRD §6.3 (Configurações).

### 10.1 Entregue no código

| Área | Descrição |
|------|-----------|
| **Tabela `school_settings`** | Linha **singleton** (`singleton = true`): `school_name`, `contact_email`, `contact_phone`, `logo_url`, `student_portal_enabled`, `updated_at`. Migração **`supabase/migrations/20260507100000_school_settings.sql`**. |
| **Rota `/admin/configuracoes`** | Formulário (RHF + Zod): dados da escola, URL opcional do logo (substitui marca estática no login via **`next/image` unoptimized**), interruptor **Portal dos alunos**; link para **`/admin/students`** para **conta inativa por aluno** (`profiles.is_active`). Server Action **`updateSchoolSettingsAdminAction`** (`lib/admin/school-settings-admin-actions.ts`). |
| **Branding** | **`/login`**: componente **`SchoolBrandMark`** (`components/school/school-brand-mark.tsx`); cabeçalho **`app/admin/layout.tsx`** e área aluno (**`app/student/layout.tsx`**) com nome amigável (**`fallbackSchoolDisplayName`** em `lib/school-settings.ts`). |
| **Portal dos alunos** | Se **`student_portal_enabled === false`**: middleware redireciona **`/student`** → **`/login?error=portal`**; **`loginAction`** encerra sessão de aluno; **`app/student/layout.tsx`** faz sign out e redirect. Aluno **inativo** mantém **`?error=inactive`**. |
| **Tema** | Continua global (**`ThemeToggle`** no header admin — Fase 1); a tela de configurações apenas documenta isso na cópia de interface. |
| **RLS** | Ver [§3.5](#35-row-level-security-rls). |
| **Validação / testes** | Zod **`lib/validations/school-settings.ts`**; Vitest **`lib/validations/school-settings.test.ts`**. |

### 10.2 Arquivos principais (referência rápida)

`lib/school-settings.ts`, `lib/supabase/ssr-client-type.ts`, `components/admin/admin-configuracoes-client.tsx`, `components/admin/admin-sidebar.tsx` (entrada **Configurações**), `components/school/school-brand-mark.tsx`.

### 10.3 Operação

- Aplicar a migração **`20260507100000_school_settings.sql`** no projeto Supabase (`npm run db:push` ou SQL Editor — ver [.env.example](../../.env.example)).
- Sem a tabela no banco, **`/admin/configuracoes`** exibe aviso orientando a rodar a migração; o app faz **fail-open** no portal (considera ligado se não houver linha).

---

## 11. Fase 11 — Área do aluno (`/student/*`)

Módulo alinhado ao [plano — Fase 11](../implementation/plano-de-implementacao.md#fase-11--área-do-aluno-student) e ao PRD §6.4 (rotas do aluno).

### 11.1 Entregue no código

| Área | Descrição |
|------|-----------|
| **Layout `/student`** | **`requireStudentSession`** (`lib/student/session.ts`) — aluno ativo, papel **`student`**, portal ligado (alinha middleware + layout anterior); header com nome da escola, **`ThemeToggle`**, **`LogoutButton`**; **`StudentSidebar`** (`components/student/student-sidebar.tsx`) — Início, Perfil, Aulas, Evolução, Surf trips. |
| **Home `/student`** | Próximas aulas (fuso **America/São_Paulo**, exceto canceladas); prévia das últimas entradas de **`evolution_entries`**; **`StudentCommsStrip`** — texto institucional + **e-mail / telefone** de **`school_settings`** quando preenchidos. |
| **`/student/perfil`** | **`StudentProfileFields`** — apenas colunas de **`profiles`** (LGPD: **`student_details`** permanece só admin por RLS); **`StudentRequestUpdateForm`** — gera **`mailto:`** para **`contact_email`** com mensagem editável (MVP sem fila interna). |
| **`/student/aulas`** | Lista **`lessons`** do aluno (histórico recente), status em PT, skills e notas quando existirem — somente leitura. |
| **`/student/evolucao`** | Timeline **`evolution_entries`** — somente leitura; **`media_urls`** sem UI de mídia na v1. |
| **`/student/trips`** | Lista **`surf_trips`** com **`trip_date` ≥ hoje** (dia civil na escola); **`StudentTripsPanel`** — interesse / confirmar / cancelar via **`upsertStudentTripRegistrationAction`**; capas por **`<img>`** para URLs públicas variadas (Storage ou externas). |
| **Queries** | **`lib/student/student-portal-queries.ts`** — `fetchStudentUpcomingLessons`, `fetchStudentLessonHistory`, `fetchStudentEvolutionEntries`, `fetchStudentTripsOpen`. |
| **Validação / testes** | **`lib/validations/student-trip.ts`**; Vitest **`__tests__/student-trip-validation.test.ts`**. |

### 11.2 Banco — sincronização de vagas (surf trips)

- Migração **`supabase/migrations/20260508150000_sync_surf_trips_spots_on_registration.sql`**: função **`refresh_surf_trip_confirmed_spots`**, trigger **`trip_registrations_refresh_spots`** — após INSERT/UPDATE/DELETE em **`trip_registrations`**, **`surf_trips.spots_taken`** reflete a contagem de status **`confirmed`**; falha com erro se o número de confirmados exceder **`spots_total`** (alinha ao `CHECK` da tabela).
- **Operação:** aplicar com **`npm run db:push`** (ou SQL no projeto) antes de liberar confirmações de vagas pelo portal em produção.

### 11.3 Ressalvas

- **`financials`** e **`student_details`** não aparecem no portal do aluno (intencional — ver [§3.5](#35-row-level-security-rls)).
- Notificações/comunicados dinâmicos (tabela ou push) ficam para evoluções pós-MVP; o bloco atual é estático + contato institucional.

### 11.4 Arquivos principais (referência rápida)

`app/student/layout.tsx`, `app/student/page.tsx`, `app/student/perfil/page.tsx`, `app/student/aulas/page.tsx`, `app/student/evolucao/page.tsx`, `app/student/trips/page.tsx`, `components/student/student-sidebar.tsx`, `components/student/student-comms-strip.tsx`, `components/student/student-profile-fields.tsx`, `components/student/student-request-update-form.tsx`, `components/student/student-trips-panel.tsx`, `lib/student/session.ts`, `lib/student/student-portal-queries.ts`, `lib/student/trip-student-actions.ts`, `lib/validations/student-trip.ts`.

---

## 12. Fase 12 — hardening, LGPD, testes e deploy

### 12.1 Fase 12 — entregue no código

Alinhado ao [plano — Fase 12](../implementation/plano-de-implementacao.md#fase-12--hardening-lgpd-testes-e-deploy). Detalhes estendidos em [implementação Fase 12](./implementado/implementacao-fase-12-hardening-lgpd-testes-deploy.md).

| Área | Descrição |
|------|-----------|
| **LGPD / política** | Rota **`/privacidade`** com modelo de política (revisão jurídica recomendada); nome da escola e e-mail de contato quando há **`school_settings`**. |
| **Links públicos** | **`PublicLegalFooter`** — política em **`/`**, **`/login`**, rodapé do onboarding e na página de privacidade. |
| **Onboarding** | Aceite LGPD com **`id`/`htmlFor`**, link para **`/privacidade`** (nova aba), **`aria-invalid`** / **`aria-describedby`**. |
| **Segurança HTTP** | Headers em **`next.config.mjs`**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`. |
| **Testes** | Vitest **`lib/validations/auth.test.ts`**; Playwright **`e2e/smoke.spec.ts`** (servidor E2E na porta **3310** por padrão — ver **`playwright.config.ts`**); **`e2e/`** excluída do Vitest. |
| **CI** | Workflow instala Chromium e executa **`npm run test:e2e`** com credenciais públicas placeholder. |

### 12.2 Pendências operacionais (fora do repositório)

- Revisão jurídica do texto de privacidade e publicação oficial pelo responsável da escola.
- Deploy na **Vercel** (variáveis `NEXT_PUBLIC_*`, domínio, Redirect URLs no Supabase).
- Sessão de validação com professor e alunos piloto — [checklist](./implementado/checklist-validacao-producao-fase-12.md).
- Roteiro **RLS** admin + aluno (critério da Fase 2) permanece recomendado antes de produção.

---

## 13. O que ainda não existe (deliberado ou próximas fases)

- Dados reais de negócio em **`surf_trips`** / **`trip_registrations`** dependem do uso do módulo admin e do portal do aluno; **Agenda**, **Evolução**, **Financeiro** e **Surf trips** persistem nas respectivas tabelas quando utilizados.
- Testes E2E **com credenciais** (login admin/aluno, onboarding ponta a ponta) não estão no CI — podem ser acrescentados com projeto Supabase de staging e segredos no GitHub Actions.
- Validação manual **RLS** com **dois usuários** (admin + aluno), item pendente desde o critério da **Fase 2** no plano — [roteiro sugerido](./relatorio-fase-4-e-pendencia-rls-fase-2.md#33-o-que-significa-validar-rls-na-prática-roteiro-sugerido).

---

## 14. Checklist rápido pós-deploy / novo dev

1. Copiar `.env.example` → `.env.local` e preencher URL + chave anon do projeto correto; para onboarding, também **`SUPABASE_SERVICE_ROLE_KEY`** (servidor) — ver [.env.example](../../.env.example).
2. Configurar **Redirect URLs** no Supabase para **`/auth/callback`** (localhost + produção).
3. Confirmar no dashboard que as tabelas esperadas existem em **`public`** (incl. **`onboarding_tokens`**, **`school_settings`**) e que **RLS** está ativo onde esperado.
4. Aplicar migrações (`npm run db:push` ou fluxo do time), incluindo Storage **`avatars`** (upload admin + bucket público — ver `supabase/migrations/20260504140000_storage_avatars_admin_insert_public.sql`), **`trip-covers` público** para capas de surf trips (`supabase/migrations/20260506120000_storage_trip_covers_public.sql`), **`school_settings`** (`supabase/migrations/20260507100000_school_settings.sql` — Fase 10) e **`sync_surf_trips_spots_on_registration`** (`supabase/migrations/20260508150000_sync_surf_trips_spots_on_registration.sql` — Fase 11, vagas **`spots_taken`**).
5. Promover o primeiro **admin** manualmente (`UPDATE profiles SET role = 'admin' WHERE id = '<uuid>'`) após criar o usuário em Authentication.
6. Para testes **aluno + admin**, criar um segundo usuário em Authentication (não elevar a admin) — ver [§16.4](#164-conta-de-teste-aluno).
7. Rodar `npm run dev`, `npm run test`, `npm run test:e2e` (primeira vez: `npx playwright install chromium`) e `npm run build` antes de abrir PR.
8. Se o dev server acusar erro estranho em rotas ou favicon: apagar pasta **`.next`** e subir de novo (`npm run dev`).

---

## 15. Referências

- [PRD — modelagem §5 e segurança §9](../films_dutra_PRD.md)
- [Plano de implementação](../implementation/plano-de-implementacao.md) — [Progresso por fase](../implementation/plano-de-implementacao.md#progresso-por-fase) — [Fase 6 resumida](../implementation/plano-de-implementacao.md#fase-6--admin-agenda--calendário) — [Fase 7 resumida](../implementation/plano-de-implementacao.md#fase-7--admin-evolução) — [Fase 8 resumida](../implementation/plano-de-implementacao.md#fase-8--admin-financeiro) — [Fase 9 resumida](../implementation/plano-de-implementacao.md#fase-9--admin-surf-trips) — [Fase 10 resumida](../implementation/plano-de-implementacao.md#fase-10--admin-configurações) — [Fase 11 resumida](../implementation/plano-de-implementacao.md#fase-11--área-do-aluno-student) — [Fase 12 resumida](../implementation/plano-de-implementacao.md#fase-12--hardening-lgpd-testes-e-deploy)
- [Relatório — Fase 4 e pendência RLS (Fase 2)](./relatorio-fase-4-e-pendencia-rls-fase-2.md)
- [Relatório — Fase 5 (histórico + atualizações)](./relatorio-fase-5-admin-shell-alunos-e-convite.md)
- [Implementação — Fase 5 complementos](./implementacao-fase-5-alunos-paginacao-edicao-admin.md)
- [Implementação — Fase 12 (hardening / LGPD / E2E)](./implementado/implementacao-fase-12-hardening-lgpd-testes-deploy.md)
- Migrações: `supabase/migrations/20260428100000_initial_schema.sql`, `supabase/migrations/20260429100000_onboarding_tokens.sql`, `supabase/migrations/20260504140000_storage_avatars_admin_insert_public.sql`, `supabase/migrations/20260506120000_storage_trip_covers_public.sql`, `supabase/migrations/20260507100000_school_settings.sql`, `supabase/migrations/20260508150000_sync_surf_trips_spots_on_registration.sql`

---

## 16. Fase 3 — como funciona na prática

Resumo para quem vai **usar** ou **testar** o sistema no dia a dia.

### 16.1 Primeiro acesso e papéis

1. Todo usuário criado no **Authentication** do Supabase recebe, via trigger, uma linha em **`profiles`** com `role = student` por padrão.
2. O **primeiro administrador** da escola é promovido **manualmente** no SQL:  
   `UPDATE profiles SET role = 'admin' WHERE id = '<uuid do auth.users>';`
3. Quem entra com **admin** é sempre direcionado para **`/admin`**; quem entra com **student**, para **`/student`**. Tentar abrir a área errada redireciona para a correta.

### 16.2 Fluxo de login (e-mail + senha)

1. O usuário abre **`/login`** (ou clica “Entrar” na home).
2. Submete e-mail e senha → **Server Action** valida com Zod, chama `signInWithPassword`, lê **`profiles`** (`role`, `is_active`).
3. Se a conta estiver **inativa** (`is_active = false`), a sessão é encerrada e aparece mensagem de erro.
4. Se o papel for **student** e **`school_settings.student_portal_enabled`** estiver **false**, a sessão é encerrada e o formulário mostra erro (portal desligado pela escola — ver [§10](#10-fase-10--configurações-da-escola)).
5. Após sucesso, o redirect vai para **`/admin`** ou **`/student`**, ou para o path interno em **`?next=`** (se for `/admin` ou `/student`).

### 16.3 Middleware (o que acontece “por baixo”)

A cada requisição coberta pelo matcher, o middleware:

1. Atualiza cookies de sessão Supabase (**refresh**).
2. Identifica o usuário e carrega **`profiles.role`** e **`profiles.is_active`**.
3. Para **aluno**, lê **`school_settings.student_portal_enabled`** — se **`false`** ou conta **inativa**, bloqueia **`/student`** e envia ao login com **`?error=portal`** ou **`inactive`** (alinhado a [§10](#10-fase-10--configurações-da-escola)).
4. **Sem login** e URL começando com `/admin` ou `/student` → redireciona para **`/login?next=...`**.
5. **Com login** em **`/login`** → **admin** segue para **`/admin`**; **aluno** só vai para **`/student`** se o portal estiver ligado e a conta **ativa** (caso contrário permanece na tela de login com mensagens de erro já existentes).
6. **Admin** em rota `/student` → manda para **`/admin`**; **aluno** em `/admin` → manda para **`/student`** (salvo bloqueios do item 3).
7. Usuário autenticado mas **sem linha em `profiles`** (caso raro) → **`/login?error=profile`**.

Os layouts de **`/admin`** e **`/student`** conferem de novo **`is_active`** e, na área aluno, o **portal global**; se inapto, fazem **sign out** quando aplicável e redirecionam com **`?error=inactive`** ou **`portal`**.

### 16.4 Conta de teste aluno

Para o roteiro **RLS** (admin vê tudo; aluno só o próprio) e para validar **`/student`**:

1. No **Supabase Dashboard** → **Authentication** → **Users** → **Add user** (ou “Invite” / “Create user”, conforme a UI), informe **e-mail** e **senha** distintos do admin.
2. O trigger **`handle_new_user`** cria automaticamente **`profiles`** com **`role = student`**. Não execute `UPDATE` promovendo essa conta a admin.
3. Se o projeto exigir **confirmação de e-mail**, confirme o usuário no painel ou desative temporariamente a confirmação em **Auth → Providers → Email** (apenas em dev).
4. Acesse **`/login`** com esse usuário → o app deve redirecionar para **`/student`** (portal com rotas **`/student/perfil`**, **`/student/aulas`**, etc. — ver [§11](#11-fase-11--área-do-aluno-student)). O admin continua acessando **`/admin`**.

**Alternativa com dados completos de onboarding:** na home admin, use **Gerar link** de onboarding e conclua o fluxo em `/onboarding/<token>` com outro e-mail (cria perfil aluno com `student_details` preenchido).

### 16.5 Recuperação de senha (magic link)

1. Em **`/login`**, bloco “Esqueceu a senha?” envia e-mail via **`resetPasswordForEmail`**, com redirect para **`/auth/callback?next=/auth/update-password`** (origem via `getSiteUrl()`).
2. O usuário clica no link do e-mail → **`/auth/callback`** executa **`exchangeCodeForSession`** e redireciona para **`/auth/update-password`**.
3. Na página de nova senha, o browser usa **`createBrowserSupabaseClient`** e **`updateUser({ password })`**.
4. É obrigatório ter as **Redirect URLs** corretas no painel Supabase e **`NEXT_PUBLIC_SITE_URL`** coerente em produção.

### 16.6 Logout

O botão **Sair** dispara **`logoutAction`** (sign out no servidor) e redireciona para **`/login`**.

---

*Este arquivo substitui notas dispersas sobre “o que já foi feito”; mantê-lo sincronizado com o repositório e o dashboard Supabase reduz retrabalho na equipe.*
