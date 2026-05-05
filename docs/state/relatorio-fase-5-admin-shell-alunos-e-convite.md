# Relatório — Fase 5 (parcial): shell admin, alunos e convite de onboarding

Documento complementar ao [estado-atual.md](./estado-atual.md). Consolida **tudo o que foi acrescentado ao repositório** nesta entrega da **Fase 5** do [plano de implementação](../implementation/plano-de-implementacao.md): área administrativa com navegação, tema claro/escuro, resumo em cards na home, lista e detalhe de alunos (leitura) e **geração/cópia de link** de onboarding para substituir inserts manuais em `onboarding_tokens` no fluxo típico.

**Última atualização:** maio de 2026 (secção [§9](#9-atualização-maio--2026--feed-da-home-e-lista-enriquecida)).

---

## 1. Contexto e objetivo

Com a **Fase 4** (onboarding público) já implementada, o plano prevê a **Fase 5 — Admin: layout, home e módulo Alunos**, incluindo ação para **gerar/copiar link de onboarding** para novos alunos.

Esta entrega cobre **uma primeira fatia verificável**: shell admin utilizável, métricas mínimas na home, navegação para alunos e convite via interface — sem esgotar o PRD inteiro da Fase 5 (edição rica de perfil, paginação avançada, integração completa com Agenda/Financeiro quando essas fases existirem).

---

## 2. Arquivos novos (por pasta)

### 2.1 Providers e tema global

| Caminho | Função |
|---------|--------|
| `components/providers/app-providers.tsx` | Envolve a app com `ThemeProvider` (`next-themes`): `attribute="class"`, tema padrão claro, `enableSystem`. |
| `components/theme-toggle.tsx` | Botão cliente (Phosphor Sun/Moon) para alternar tema claro/escuro; placeholder SSR até hidratar. |

### 2.2 Camada admin (servidor / dados)

| Caminho | Função |
|---------|--------|
| `lib/admin/session.ts` | `requireAdminSession()`: garante usuário autenticado, linha em `profiles`, `is_active`, **`role === admin`** (defesa em profundidade além do middleware); retorna `{ supabase, user, profile }`. Tipagem de `user` com `User` do `@supabase/supabase-js`. |
| `lib/admin/dashboard-queries.ts` | `fetchAdminDashboardCounts(supabase)` — contagens para cards: alunos ativos (`profiles` student + ativo), aulas “hoje” (**limites do dia em UTC** vs `lessons.scheduled_at`), lançamentos `financials` com `status = overdue`, trips futuras (`trip_date >= hoje`) com **vagas** (`spots_taken < spots_total`). |
| `lib/admin/onboarding-invite-action.ts` | Server Action `createOnboardingInviteAction(notes?)`: exige sessão admin via `requireAdminSession`; usa **`createServiceRoleClient()`** para `INSERT` em `onboarding_tokens` (token hex 24 bytes, validade **7 dias**, `created_by` = admin, `notes` opcional); devolve URL absoluta com `getSiteUrl()` → `/onboarding/<token>`. |

### 2.3 Componentes de UI admin

| Caminho | Função |
|---------|--------|
| `components/admin/admin-sidebar.tsx` | Sidebar cliente com links **Início** (`/admin`) e **Alunos** (`/admin/students`); estado ativo via `usePathname`; nota curta sobre próximas fases. |
| `components/admin/admin-dashboard-cards.tsx` | **Client Component** (`"use client"`): grid de quatro cards com ícones Phosphor — métricas por props; links úteis para `/admin/students`, âncoras na home (**próximas aulas**, **pagamentos em atraso**) quando aplicável; hints para Fases 6/9 onde ainda não há rota dedicada. Motivo do `"use client"`: ícones Phosphor no cliente. |
| `components/admin/onboarding-invite-panel.tsx` | **Client Component**: painel neo (cream `#F0E8DE`, sombra soft UI alinhada ao design system), campo opcional de notas, botão “Gerar link”, exibição do URL e “Copiar link” (`navigator.clipboard`). |
| `components/admin/student-detail-tabs.tsx` | **Client Component**: abas “Dados pessoais” e “Surf e saúde”; leitura de `profiles` + `student_details` (quando existir); mensagens quando não há `student_details` ou perfil não é aluno. |

### 2.4 Rotas App Router

| Caminho | Função |
|---------|--------|
| `app/admin/layout.tsx` | Layout admin: header fixo (marca, nome truncado do perfil, `ThemeToggle`, `LogoutButton`), `AdminSidebar`, `<main>` para filhos. Usa `requireAdminSession()` em vez de duplicar só checagem de login. |
| `app/admin/page.tsx` | Home admin: título, `fetchAdminDashboardCounts` + `AdminDashboardCards`, **`fetchAdminDashboardFeed`** + `AdminDashboardHomeFeed` + `AdminDashboardShortcuts` (ver [§9](#9-atualização-maio--2026--feed-da-home-e-lista-enriquecida)), seção “Primeiro acesso” com link para lista e `OnboardingInvitePanel`. |
| `app/admin/students/page.tsx` | Lista paginada com filtros GET (`q`, `page`, `per_page`, `status`, `sort`) — ver [implementação complementar](./implementacao-fase-5-alunos-paginacao-edicao-admin.md); **última aula** e **resumo financeiro** na linha desde maio/2026 ([§9](#9-atualização-maio--2026--feed-da-home-e-lista-enriquecida)). |
| `app/admin/students/[id]/page.tsx` | Detalhe: validação de UUID; `profiles` por id; se aluno, busca `student_details` por `student_id`; `StudentDetailTabs`; `notFound()` se inválido. |

---

## 3. Arquivos alterados (existentes antes desta fase)

| Caminho | Alteração |
|---------|-----------|
| `app/layout.tsx` | Import de `AppProviders`; children envolvidos por `<AppProviders>` para tema global. |

*Nenhuma migração SQL nova nesta entrega* — reutiliza `onboarding_tokens` da Fase 4.

---

## 4. Rotas HTTP entregues

| Rota | Comportamento |
|------|----------------|
| `GET /admin` | Home com métricas e painel de convite (dinâmico no servidor). |
| `GET /admin/students` | Lista de alunos; `?q=` filtra nome. |
| `GET /admin/students/[id]` | Perfil do aluno (ou outro `profiles.id` acessível a admin) em modo leitura por abas. |

Proteção: **middleware** continua redirecionando não-admins; **`requireAdminSession`** garante papel admin nas Server Components/actions desta área.

---

## 5. Variáveis de ambiente

| Variável | Uso nesta fase |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente servidor Supabase (sessão admin). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou publishable) | Idem. |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Obrigatória para **gerar convite** (`createOnboardingInviteAction`). Sem ela, o painel retorna mensagem amigável (mesmo padrão da Fase 4). |
| `NEXT_PUBLIC_SITE_URL` / `VERCEL_URL` | Base do link gerado via `getSiteUrl()` (convite absoluto). |

---

## 6. Detalhes técnicos e decisões

1. **Contagem “aulas hoje”:** usa início/fim do dia calendário em **UTC** (documentado na UI como “UTC”). Evolução futura: fuso da escola (ex. `America/Sao_Paulo`).
2. **`fetchAdminDashboardCounts`:** parâmetro tipado como `SupabaseClient<Database>` em `dashboard-queries.ts`; na **home** (`app/admin/page.tsx`) o cliente retornado por `createServerSupabaseClient()` é passado com **`as unknown as SupabaseClient<Database>`** por divergência de genéricos entre `@supabase/ssr` e `@supabase/supabase-js` no build — remover quando as libs alinharem tipos.
3. **Design system:** painel de convite usa fundo cream e sombra soft UI; demais superfícies seguem tokens Tailwind (`globals.css`) e tema claro/escuro.
4. **E-mail do aluno:** não há coluna de e-mail em `public.profiles`; na aba “Dados pessoais” há texto genérico sobre login — evolução possível com metadados Auth ou campo dedicado.

---

## 7. Ressalvas após fechamento da Fase 5 (documentação maio/2026)

- **Upload de avatar:** implementado na edição admin do aluno — bucket **`avatars`**, política de **INSERT** para admin + bucket **público** para URL estável (migração `20260504140000_storage_avatars_admin_insert_public.sql`). Campo **URL manual** permanece como alternativa.
- **Fuso horário da escola** em contagens “hoje” / próximas aulas — ainda **UTC**; evolução com **Agenda (Fase 6)**.
- **Cards e atalhos** ganham rotas dedicadas quando **Agenda / Financeiro / Trips** existirem — métricas já leem `lessons`, `financials`, `surf_trips`.
- **Última aula na lista:** varredura com limite; escala muito grande → **RPC/view** opcional.
- **RLS manual** admin vs aluno — checklist **Fase 2**; conta aluno: [`estado-atual` §10.4](./estado-atual.md#104-conta-de-teste-aluno).
- **Testes E2E** — **Fase 12**; tabela de progresso do [plano](../implementation/plano-de-implementacao.md) atualizada para Fase 5 **concluída**.

---

## 8. Referências cruzadas (histórico de entregas)

- **Primeira fatia:** shell, métricas, lista/detalhe em leitura, convite — este documento até §6.
- **Segunda fatia:** paginação, filtros, edição admin — [implementação — lista, paginação e edição](./implementacao-fase-5-alunos-paginacao-edicao-admin.md).
- **Terceira fatia:** feed na home e lista enriquecida — [§9](#9-atualização-maio--2026--feed-da-home-e-lista-enriquecida) abaixo.

---

## 9. Atualização maio / 2026 — feed da home e lista enriquecida

Objetivo: aproximar a **home** e a **lista de alunos** do texto da Fase 5 no [plano](../implementation/plano-de-implementacao.md) sem esperar as Fases 6–9 completas.

| Caminho | Função |
|---------|--------|
| `lib/admin/dashboard-feed-queries.ts` | `fetchAdminDashboardFeed`: próximas aulas futuras (não canceladas), lançamentos `financials` **overdue**, **aniversariantes** em 7 dias (UTC) via `profiles.birth_date`; resolve nomes em `profiles`. |
| `lib/admin/student-birthday-window.ts` | Cálculo de janela de aniversário em UTC (`filterBirthdaysWithinUtcDays`, etc.). |
| `lib/admin/student-financial-rollup.ts` | Agregação **vencido → pendente → em dia → sem lançamentos** por aluno na lista. |
| `lib/admin/lesson-status-label.ts` | Rótulos PT para `lesson_status`. |
| `components/admin/admin-dashboard-home-feed.tsx` | UI das secções Próximas aulas, Pagamentos em atraso, Aniversariantes + **`AdminDashboardShortcuts`**. |
| `lib/admin/students-list-query.ts` | Extende `fetchAdminStudentsList` com enriquecimento pós-página (aulas + financeiro). |
| `*.test.ts` | Vitest: `student-birthday-window`, `student-financial-rollup`. |

---

## 10. Referências externas ao relatório

- [Implementação — lista, paginação e edição admin](./implementacao-fase-5-alunos-paginacao-edicao-admin.md) (detalhamento técnico da evolução após este relatório)
- [Estado atual do projeto](./estado-atual.md)
- [Plano de implementação](../implementation/plano-de-implementacao.md)
- [Relatório Fase 4 e pendência RLS Fase 2](./relatorio-fase-4-e-pendencia-rls-fase-2.md) — onboarding público e checklist manual de RLS
- [Design system](../design_system.md)
