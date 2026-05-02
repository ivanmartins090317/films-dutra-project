# Implementação — Fase 5 (complemento): lista de alunos, paginação, filtros e edição administrativa

Documento de referência que descreve **o que foi implementado** na evolução do módulo **Alunos** e da **edição admin de perfil**, após a primeira entrega registrada em [relatorio-fase-5-admin-shell-alunos-e-convite.md](./relatorio-fase-5-admin-shell-alunos-e-convite.md). Complementa o [estado-atual.md](./estado-atual.md) e o [plano de implementação](../implementation/plano-de-implementacao.md) (Fase 5).

**Última atualização:** maio de 2026 (lista enriquecida e feed da home — ver [§9](#9-atualização-maio--2026--feed-da-home-e-enriquecimento-da-lista)).

---

## 1. Objetivo desta entrega

Fechar lacunas explícitas do PRD/plano para a **Fase 5** que ainda não estavam no relatório inicial da fatia “shell + lista em leitura + convite”:

1. **Lista de alunos** com paginação (sem limite fixo de 100 registros como única forma de navegar).
2. **Filtros e ordenação** na lista (além da busca por nome).
3. **Avatar** na lista quando existir URL em `profiles.avatar_url`.
4. **Edição administrativa** dos dados do perfil e dos detalhes de surf/saúde na página de detalhe do aluno.

O escopo **desta fatia histórica** não incluía upload de arquivo para Storage nem feed extra na home; **última aula**, **resumo financeiro na lista** e **feed da home** foram acrescentados **depois** — ver [§9](#9-atualização-maio--2026--feed-da-home-e-enriquecimento-da-lista) e [`estado-atual.md` §5.1](./estado-atual.md#51-entregue-no-código-home-e-lista).

---

## 2. Lista de alunos (`GET /admin/students`)

### 2.1 Parâmetros de URL (GET)

| Parâmetro    | Descrição |
|--------------|-----------|
| `q`          | Busca por nome (`ilike` em `full_name`). |
| `page`       | Página (≥ 1). Se for maior que o total de páginas, o backend **ajusta** para a última página válida. |
| `per_page`   | Itens por página: **10**, **20** (padrão) ou **50**. Valores inválidos voltam ao padrão 20. |
| `status`     | `all` (todos), `active` (apenas `is_active = true`), `inactive` (apenas inativos). |
| `sort`       | `name_asc`, `name_desc`, `created_desc` (cadastro mais recente primeiro). |

A UI usa um **formulário GET** com campo oculto `page=1` ao aplicar filtros, para voltar à primeira página quando o usuário muda critérios.

### 2.2 Dados e contagem

- Implementação em **`lib/admin/students-list-query.ts`** (`fetchAdminStudentsList`):
  - Primeiro obtém o **total** com a mesma base de filtros (`eq('role','student')`, `q`, `status`).
  - Depois aplica **`.range(from, to)`** conforme página efetiva e `per_page`.
  - **Maio/2026:** após carregar a página, **enriquece** cada linha com última aula (`lessons.scheduled_at ≤ agora`, varredura limitada) e agregação financeira (`student-financial-rollup`), usando cast **`SupabaseClient<Database>`** nas queries auxiliares (mesmo padrão da home).
- Parâmetros tipados e parsing da query string em **`lib/admin/students-list-params.ts`** (`parseStudentsListSearchParams`, `studentsListQueryString` para montar links de paginação preservando filtros).

### 2.3 Paginação na interface

- Componente **`components/admin/students-pagination.tsx`**: texto “Mostrando X–Y de Z”, botões Anterior/Próxima (desabilitados nas extremidades), link mantendo `q`, `status`, `sort`, `per_page`.

### 2.4 Avatar na lista

- **`components/admin/student-list-avatar.tsx`** (Client Component):
  - Se `avatar_url` existir: `next/image` com **`unoptimized`** (qualquer origem HTTPS sem depender de `remotePatterns` fixos).
  - Se falhar o carregamento ou não houver URL: iniciais do nome ou ícone Phosphor `User`.

---

## 3. Detalhe do aluno (`GET /admin/students/[id]`)

### 3.1 Leitura (já existente)

- Abas **“Dados pessoais”** e **“Surf e saúde”** em **`components/admin/student-detail-tabs.tsx`** (somente leitura).

### 3.2 Edição administrativa (novo)

Nova seção **“Edição (administrador)”** abaixo das abas, em **`app/admin/students/[id]/page.tsx`**:

1. **Dados pessoais** — **`components/admin/admin-student-profile-edit-form.tsx`**
   - Campos: nome, telefone, data/ano de nascimento, endereço, orientação sexual, altura, peso, **URL do avatar** (texto; não há upload), **conta ativa** (checkbox).
   - React Hook Form + Zod (`adminStudentProfileSchema`).
   - Submissão via **`updateStudentProfileAdminAction`** (ver §4).

2. **Surf e saúde** — apenas se `profile.role === 'student'` — **`components/admin/admin-student-details-edit-form.tsx`**
   - Campos alinhados a `student_details` (nível, tempos, saúde, equipamento, meta, frequência, dias preferidos com checkboxes, etc.).
   - Se **não** existir linha em `student_details`, o primeiro salvamento faz **INSERT** com valores padrão do formulário; caso contrário, **UPDATE**.
   - Submissão via **`upsertStudentDetailsAdminAction`**.

### 3.3 UI auxiliar

- **`components/ui/textarea.tsx`**: área de texto reutilizável (mesma linha visual do `Input`).

---

## 4. Validação e Server Actions

### 4.1 Schemas Zod

Arquivo **`lib/validations/admin-student.ts`**:

- **`adminStudentProfileSchema`** — perfil administrável (inclui `avatar_url` vazio → `null` no processamento Zod).
- **`adminStudentDetailsSchema`** — detalhes de surf/saúde; campo livre `other_sports_raw` convertido com **`parseOtherSports`** de `lib/validations/onboarding.ts` (mesma regra de separadores que no onboarding).

Os formulários usam **`zodResolver`** com cast explícito para **`Resolver<T>`** onde necessário (compatibilidade Zod 4 + tipos do resolver).

### 4.2 Actions

Arquivo **`lib/admin/student-admin-actions.ts`** (`"use server"`):

| Função | Comportamento |
|--------|----------------|
| `updateStudentProfileAdminAction(profileId, raw)` | `requireAdminSession()`; valida UUID; parse Zod; **`UPDATE`** em `profiles`; `revalidatePath` na rota do aluno e na lista. Cliente Supabase tipado como **`SupabaseClient<Database>`** (cast a partir do cliente SSR, mesmo padrão da home admin). |
| `upsertStudentDetailsAdminAction(studentId, raw)` | Idem sessão; parse Zod; se existe registro em `student_details` por `student_id`, **UPDATE**; senão **INSERT** com `student_id` + payload. |

**Segurança:** políticas RLS existentes permitem que **admin** atualize `profiles` e faça **FOR ALL** em `student_details` (ver migração inicial). Não foi criada migração SQL nesta entrega.

---

## 5. Arquivos novos ou relevantes (resumo)

| Caminho | Função |
|---------|--------|
| `lib/admin/students-list-params.ts` | Parse de query string, constantes de `per_page`, helper para montar `?` nas navegações. |
| `lib/admin/students-list-query.ts` | `fetchAdminStudentsList`: contagem + página + ordenação + **enriquecimento** (última aula / financeiro) desde maio/2026. |
| `lib/admin/student-admin-actions.ts` | Server Actions de atualização de perfil e upsert de `student_details`. |
| `lib/validations/admin-student.ts` | Schemas Zod admin. |
| `lib/validations/admin-student.test.ts` | Testes Vitest do schema de perfil. |
| `lib/admin/students-list-params.test.ts` | Testes Vitest dos params da lista. |
| `components/admin/students-pagination.tsx` | Barra de paginação. |
| `components/admin/student-list-avatar.tsx` | Avatar / iniciais na lista. |
| `components/admin/admin-student-profile-edit-form.tsx` | Formulário edição perfil. |
| `components/admin/admin-student-details-edit-form.tsx` | Formulário edição surf/saúde. |
| `components/ui/textarea.tsx` | Textarea estilizada. |

Arquivos **alterados** em destaque:

- **`app/admin/students/page.tsx`** — toolbar de filtros + lista com avatar + paginação + **última aula / resumo financeiro** (maio/2026).
- **`app/admin/students/[id]/page.tsx`** — seção de edição admin.
- **`docs/state/*.md`** — atualizados em **maio/2026** para o feed da home e a lista enriquecida ([`estado-atual.md`](./estado-atual.md), [relatório Fase 5](./relatorio-fase-5-admin-shell-alunos-e-convite.md)).

---

## 6. Variáveis de ambiente

Nenhuma variável **nova** para esta fatia. Continua válido:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou publishable) para sessão admin.
- Mesmo comportamento global da área admin descrito no relatório da Fase 5 (convite com `SUPABASE_SERVICE_ROLE_KEY` na **home**, não obrigatório para edição de perfil com cliente autenticado).

---

## 7. Testes automatizados

- **`npm test`** (Vitest): inclui os novos testes de **`students-list-params`** e validação mínima de **`adminStudentProfileSchema`**.
- Não há E2E nesta entrega (previsto para hardening na Fase 12 do plano).

---

## 8. O que permanece fora deste escopo (fatia lista/edição)

- **Upload** de avatar via Supabase Storage na UI (apenas campo **URL**).
- Melhorias de **escala** na última aula (RPC Postgres / vista) se o histórico de `lessons` explodir.
- Demais refinamentos da home quando **Agenda / Financeiro / Trips** tiverem **rotas próprias** no app — parte já coberta por `dashboard-feed-queries` com dados existentes.

---

## 9. Atualização maio / 2026 — feed da home e enriquecimento da lista

| Caminho | Função |
|---------|--------|
| `lib/admin/dashboard-feed-queries.ts` | `fetchAdminDashboardFeed` para a home admin. |
| `lib/admin/student-birthday-window.ts` | Janela de aniversariantes em UTC + testes. |
| `lib/admin/student-financial-rollup.ts` | Prioridade de status financeiro na lista + testes. |
| `lib/admin/lesson-status-label.ts` | Labels PT dos status de aula. |
| `components/admin/admin-dashboard-home-feed.tsx` | Secções da home + atalhos. |
| `components/admin/admin-dashboard-cards.tsx` | Links âncora para secções da home. |

Ver também [relatório Fase 5 §9](./relatorio-fase-5-admin-shell-alunos-e-convite.md#9-atualização-maio--2026--feed-da-home-e-lista-enriquecida).

---

## 10. Referências cruzadas

- [Estado atual do projeto](./estado-atual.md)
- [Relatório Fase 5 (primeira fatia — shell, leitura, convite)](./relatorio-fase-5-admin-shell-alunos-e-convite.md)
- [Plano de implementação](../implementation/plano-de-implementacao.md)
- [Design system](../design_system.md)
