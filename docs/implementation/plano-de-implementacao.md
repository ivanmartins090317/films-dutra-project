# Plano de implementação — Films Dutra Dashboard

Documento derivado do [films_dutra_PRD.md](../../films_dutra_PRD.md). Organiza o trabalho em **fases sequenciais** com entregas verificáveis, respeitando dependências técnicas (Supabase → Auth → dados → telas).

**Escopo alvo:** MVP v1 conforme seção 10 do PRD (onboarding, perfis, dashboard admin completo, área do aluno em leitura, tema claro/escuro, sem upload de mídia na evolução na v1).

---

## Visão das fases

| Fase | Nome resumido | Dependência principal |
|------|---------------|------------------------|
| 0 | Fundação do repositório e padrões | — |
| 1 | Design system e shell da aplicação | Fase 0 |
| 2 | Supabase: schema, RLS e Storage (estrutura) | Fase 0 |
| 3 | Autenticação, perfis e proteção de rotas | Fases 1–2 |
| 4 | Onboarding público (token + multi-step) | Fase 3 |
| 5 | Admin: layout, home e módulo Alunos | Fases 3–4 |
| 6 | Admin: Agenda / calendário de aulas | Fase 5 |
| 7 | Admin: Evolução (texto, timeline, skills) | Fases 5–6 |
| 8 | Admin: Financeiro | Fase 5 |
| 9 | Admin: Surf trips | Fase 5 |
| 10 | Admin: Configurações da escola | Fase 5 |
| 11 | Área do aluno (todas as rotas `/student/*`) | Fases 6–9 |
| 12 | Hardening LGPD, testes, deploy e handoff | Todas anteriores |

---

## Fase 0 — Fundação do repositório e padrões

**Objetivo:** Base técnica alinhada ao PRD (seções 3 e 11).

**Entregas:**

- Projeto Next.js 14 (App Router), TypeScript strict, ESLint/Prettier acordados com o time.
- Dependências do PRD: Tailwind, shadcn/ui, `next-themes`, React Hook Form, Zod, `date-fns`, Recharts (instalados conforme necessidade por fase).
- Estrutura de pastas próxima à sugerida no PRD (`app/`, `components/`, `lib/supabase/`, `lib/validations/`, `types/`, `hooks/`).
- Variáveis de ambiente documentadas (sem commitar segredos): URL e chaves anônimas do Supabase, placeholders para produção.

**Critérios de conclusão:** `pnpm dev` / `npm run dev` sobe a home mínima; CI básico (lint ou build) opcional mas recomendado.

---

## Fase 1 — Design system e shell da aplicação

**Objetivo:** Identidade visual e tema (PRD seção 4).

**Entregas:**

- Tokens em `globals.css` (light/dark) e extensão de cores em `tailwind.config`.
- Tipografia: Playfair (display) + Inter ou DM Sans (corpo), conforme PRD.
- Componentes compartilhados: `ThemeToggle`, esqueleto de `Navbar` / layout público.
- `Providers` com `ThemeProvider` (`next-themes`).
- Landing `/` ou redirect acordado para `/login`.

**Critérios de conclusão:** Toggle de tema visível e persistente; páginas públicas com aparência da marca.

---

## Fase 2 — Supabase: schema, RLS e políticas sensíveis

**Objetivo:** Modelo de dados e segurança (PRD seções 5 e 9).

**Entregas:**

- Migrações SQL (ou fluxo único documentado) para: `profiles`, `student_details`, `lessons`, `evolution_entries`, `financials`, `surf_trips`, `trip_registrations`.
- Enumerações/tipos equivalentes aos do PRD (`role`, status de aulas, financeiro, trips).
- Trigger `on_auth_user_created` (ou fluxo equivalente) para criar `profiles` ao registrar usuário.
- **RLS:** admin acesso total; aluno apenas próprios dados; **dados sensíveis** em `student_details` e financeiro conforme matriz do PRD (seção 9).
- Buckets Storage preparados para avatar/capas (políticas mínimas); upload de evolução pode ficar desabilitado na UI até v2.
- Tipos TypeScript gerados (`supabase gen types`) em `types/database.ts`.

**Critérios de conclusão:** Políticas testadas com dois usuários de teste (admin e aluno); nenhum vazamento de linhas entre alunos.

---

## Fase 3 — Autenticação, perfis e middleware

**Objetivo:** Login e separação Admin / Aluno (PRD seções 2, 6.1, 7).

**Entregas:**

- Cliente Supabase browser + server + helpers para middleware.
- Página `/login`: e-mail + senha; fluxo de recuperação (magic link) para admin.
- Middleware Next.js: proteção de `/admin/*` e `/student/*`; redirecionamento por `role`.
- Fluxo de primeiro acesso do aluno: convite ou magic link conforme decisão de produto (PRD menciona link único enviado pelo professor — implementar geração/validação mínima).
- Sincronização de `role` e nome após login.

**Critérios de conclusão:** Admin nunca cai em layout de aluno e vice-versa; sessão recuperável após refresh.

---

## Fase 4 — Onboarding público `/onboarding/[token]`

**Objetivo:** Formulário em 5 etapas (PRD seção 6.2).

**Entregas:**

- Validação Zod em `lib/validations/onboarding.ts` (espelhando campos obrigatórios/opcionais).
- UI multi-step com `Progress`, tooltips em campos sensíveis, etapa 5 com resumo + aceite LGPD obrigatório.
- Backend: validação do token (tabela dedicada ou JWT assinado — definir na implementação sem quebrar o requisito de “link enviado pelo professor”).
- Persistência em `profiles` + `student_details` + criação de usuário aluno se aplicável ao fluxo escolhido.

**Critérios de conclusão:** Um fluxo completo de ponta a ponta grava dados coerentes no Supabase; termo obrigatório bloqueia envio sem aceite.

---

## Fase 5 — Admin: layout, dashboard home e módulo Alunos

**Objetivo:** PRD seções 6.3 (home + alunos) e rotas `/admin`, `/admin/students`, `/admin/students/[id]`.

**Entregas:**

- Layout admin: sidebar/nav + `ThemeToggle`.
- Home: cards (alunos ativos, aulas hoje, pendências financeiras, trips abertas), lista próximas aulas, alertas (pagamentos vencidos, aniversariantes), atalhos.
- Lista de alunos: busca, filtros básicos, cards com foto, última aula, status pagamento.
- Perfil do aluno: abas (`Tabs`) — dados pessoais, detalhes surf/saúde (conforme permissão), ações de edição admin.
- Ação: gerar/copiar link de onboarding para novo aluno.

**Critérios de conclusão:** Admin CRUD coerente com RLS; listagens performáticas com paginação ou limite razoável.

---

## Fase 6 — Admin: Agenda / calendário

**Objetivo:** PRD módulo Agenda (6.3) e tabela `lessons`.

**Entregas:**

- Rotas e UI: visões mês/semana/dia (progressivo: começar por mês + dia se necessário).
- CRUD de aulas: aluno, data/hora, duração, status, motivo cancelamento, `skills_noted`, `notes`.
- Histórico por aluno acessível a partir do calendário e/ou do perfil.

**Critérios de conclusão:** Conflitos de agenda tratados (validação ou regra explícita); estados de aula refletidos na UI.

---

## Fase 7 — Admin: Evolução

**Objetivo:** PRD módulo Evolução MVP (texto, timeline, tags; sem upload de mídia na v1).

**Entregas:**

- Página `/admin/evolution` com visão por aluno ou filtros acordados.
- CRUD `evolution_entries`: data, conteúdo, skills (tags), vínculo opcional com `lesson_id`.
- Gráfico por habilidade (Recharts) quando houver dados suficientes.

**Critérios de conclusão:** Timeline consistente com RLS; gráfico não quebra com lista vazia.

---

## Fase 8 — Admin: Financeiro

**Objetivo:** PRD módulo Financeiro e tabela `financials`.

**Entregas:**

- CRUD lançamentos por aluno; status visual (pago / pendente / vencido).
- Visão consolidada: receita do mês, inadimplência, total recebido.
- Gráfico mensal (Recharts).

**Critérios de conclusão:** Aluno **não** enxerga tabela financeira (validar com usuário aluno de teste).

---

## Fase 9 — Admin: Surf trips

**Objetivo:** PRD módulo Surf trips + `surf_trips` / `trip_registrations`.

**Entregas:**

- CRUD de trips (título, destino, data, vagas, descrição, capa URL ou upload capa).
- Lista de interessados/confirmados; atualização de `spots_taken` com regras de negócio.
- Calendário anual ou listagem agrupada por mês.

**Critérios de conclusão:** Vagas não ficam negativas; estados de inscrição claros na UI.

---

## Fase 10 — Admin: Configurações

**Objetivo:** PRD seção 6.3 (Configurações).

**Entregas:**

- Dados da escola (nome, contato, logo) — modelo mínimo (tabela `school_settings` ou `profiles` admin-only, conforme desenho).
- Ativar/desativar acesso de alunos (flag em `profiles` ou equivalente).
- Tema já global via Fase 1; reforçar consistência em todas as telas admin.

**Critérios de conclusão:** Alterações persistem e refletem na área pública/admin conforme regra definida.

---

## Fase 11 — Área do aluno (`/student/*`)

**Objetivo:** PRD seção 6.4 e rotas `/student`, `/profile`, `/lessons`, `/evolution`, `/trips`.

**Entregas:**

- Layout aluno com navegação e tema.
- Home: próximas aulas, resumo de evolução, espaço para notificações/comunicados (conteúdo estático ou tabela simples no MVP).
- Perfil: leitura + fluxo de “solicitar atualização” (formulário ou mensagem para admin — MVP pode ser notificação interna/e-mail manual).
- Aulas e evolução: leitura conforme RLS.
- Trips: listar abertas, manifestar interesse / confirmar (integração com Fase 9).

**Critérios de conclusão:** Paridade com dados que o aluno pode ver segundo LGPD/PRD; nenhum dado admin-only exposto.

---

## Fase 12 — Hardening, LGPD, testes e deploy

**Objetivo:** PRD seções 3.3, 9 e 12.

**Entregas:**

- Revisão de consentimentos, textos legais e links de política de privacidade.
- Testes: unitários em validações Zod; testes de integração ou E2E críticos (login, onboarding, uma jornada admin).
- Acessibilidade básica em componentes shadcn (foco, labels).
- Deploy Vercel; variáveis de ambiente de produção; domínio cliente quando disponível.
- Sessão de validação com professor e primeiros alunos (checklist do PRD).

**Critérios de conclusão:** MVP v1 utilizável em produção com monitoramento mínimo (logs Vercel / Supabase).

---

## Pós-MVP (referência rápida — PRD seção 10)

| Versão | Itens |
|--------|--------|
| **v2** | Upload foto/vídeo em evolução (Storage), notificações (Realtime / push), lembretes de aula, Edge Functions (e-mail/WhatsApp) conforme prioridade. |
| **v3+** | PWA ou app nativo, relatórios PDF, pagamento online. |

---

## Rastreabilidade PRD → fases

| Tópico PRD | Fases principais |
|------------|------------------|
| Design system (§4) | 1 |
| Modelagem e RLS (§5, §9) | 2 |
| Auth (§6.1) | 3 |
| Onboarding (§6.2) | 4 |
| Admin home, alunos, agenda, evolução, financeiro, trips, settings (§6.3) | 5–10 |
| Área aluno (§6.4) | 11 |
| Rotas (§7) | distribuídas nas fases 3–11 |
| shadcn (§8) | 1 em diante, conforme tela |
| Deploy / próximos passos (§3.3, §12) | 0, 12 |

---

## Notas de governança

- **Branches:** uma branch por fase ou por feature dentro da fase (ex.: `feature/fase-5-alunos`), com commits no padrão Conventional Commits.
- **Ambientes:** desenvolvimento contra projeto Supabase dedicado; promoção para staging/prod com migrações versionadas.
- **Alterações de escopo:** qualquer desvio do MVP v1 deve ser refletido neste plano e no PRD com acordo explícito.

---

*Documento vivo: atualizar datas e status de fase à medida que o projeto avança.*
