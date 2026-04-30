# Relatório — Fase 5 (parcial): shell admin, alunos e convite de onboarding

Documento complementar ao [estado-atual.md](./estado-atual.md). Consolida **tudo o que foi acrescentado ao repositório** nesta entrega da **Fase 5** do [plano de implementação](../implementation/plano-de-implementacao.md): área administrativa com navegação, tema claro/escuro, resumo em cards na home, lista e detalhe de alunos (leitura) e **geração/cópia de link** de onboarding para substituir inserts manuais em `onboarding_tokens` no fluxo típico.

**Última atualização:** abril de 2026.

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
| `components/admin/admin-dashboard-cards.tsx` | **Client Component** (`"use client"`): grid de quatro cards com ícones Phosphor — métricas recebidas por props; apenas “Alunos ativos” é link para `/admin/students`; demais são cards estáticos com texto “Fase 6/8/9”. Motivo do `"use client"`: ícones Phosphor não podem ser usados como Server Component (bundle servidor / `createContext`). |
| `components/admin/onboarding-invite-panel.tsx` | **Client Component**: painel neo (cream `#F0E8DE`, sombra soft UI alinhada ao design system), campo opcional de notas, botão “Gerar link”, exibição do URL e “Copiar link” (`navigator.clipboard`). |
| `components/admin/student-detail-tabs.tsx` | **Client Component**: abas “Dados pessoais” e “Surf e saúde”; leitura de `profiles` + `student_details` (quando existir); mensagens quando não há `student_details` ou perfil não é aluno. |

### 2.4 Rotas App Router

| Caminho | Função |
|---------|--------|
| `app/admin/layout.tsx` | Layout admin: header fixo (marca, nome truncado do perfil, `ThemeToggle`, `LogoutButton`), `AdminSidebar`, `<main>` para filhos. Usa `requireAdminSession()` em vez de duplicar só checagem de login. |
| `app/admin/page.tsx` | Home admin: título, `fetchAdminDashboardCounts` + `AdminDashboardCards`, seção “Primeiro acesso” com link para lista e `OnboardingInvitePanel`. |
| `app/admin/students/page.tsx` | Lista de `profiles` com `role = student`, ordenação por nome, **limite 100**; busca GET `?q=` com `ilike` em `full_name`. |
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

## 7. O que ainda não está nesta entrega (Fase 5 no PRD)

- Itens de lista estilo PRD §6.3: **última aula**, **status de pagamento** na linha (dependem de Agenda/Financeiro no app).
- **Upload** de avatar pelo Storage (UI) — hoje a lista usa `avatar_url` quando já preenchido (URL).
- Cards da home com regras mais ricas (alertas, aniversariantes, etc.) quando **Agenda / Financeiro / Trips** estiverem implementados de ponta a ponta.

**Entregue depois do relatório inicial:** paginação + filtros (status, ordenação, itens por página), edição admin do perfil e de surf/saúde na página do aluno, testes Vitest para params da lista e validação admin do perfil.

- Demais testes E2E/critérios da Fase 12 conforme plano.

---

## 8. Referências cruzadas

- [Implementação — lista, paginação e edição admin](./implementacao-fase-5-alunos-paginacao-edicao-admin.md) (detalhamento técnico da evolução após este relatório)
- [Estado atual do projeto](./estado-atual.md)
- [Plano de implementação](../implementation/plano-de-implementacao.md)
- [Relatório Fase 4 e pendência RLS Fase 2](./relatorio-fase-4-e-pendencia-rls-fase-2.md) — onboarding público e checklist manual de RLS
- [Design system](../design_system.md)
