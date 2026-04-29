# Relatório — implementação da Fase 4 e pendência da Fase 2 (RLS)

Documento complementar ao [estado-atual.md](./estado-atual.md). Descreve o trabalho de onboarding público entregue no repositório, decisões técnicas, variáveis de ambiente e **o que ainda falta** para fechar o critério de **validação manual de RLS** da Fase 2 conforme o [plano de implementação](../implementation/plano-de-implementacao.md).

**Última atualização:** abril de 2026.

---

## 1. Contexto e objetivo

Após a **Fase 3** (autenticação, middleware, `/login`, `/admin`, `/student`), o próximo passo lógico no plano era a **Fase 4 — Onboarding público** (`/onboarding/[token]`): formulário multi-step alinhado ao PRD §6.2, validação com **Zod**, persistência em **`profiles`** e **`student_details`**, aceite **LGPD** obrigatório.

Este relatório consolida **o que foi implementado em código** e documenta em separado a questão da **Fase 2**: infraestrutura de schema/RLS já existente no banco, mas **critério de teste manual com dois usuários (admin + aluno)** ainda pendente — conforme o próprio plano; **não bloqueia** o uso da Fase 4.

---

## 2. Resumo do que foi implementado (Fase 4)

| Área | Entrega |
|------|---------|
| **Banco** | Nova migração `supabase/migrations/20260429100000_onboarding_tokens.sql`: tabela `onboarding_tokens` (`token`, `expires_at`, `used_at`, `created_by`, etc.), índice em `expires_at`, RLS habilitado sem políticas para `anon`/`authenticated` (acesso apenas via **service role** no backend). |
| **Tipos TS** | `types/database.ts` estendido com a tabela `onboarding_tokens` (regenerar com `npm run db:types` após outras mudanças no schema). |
| **Cliente admin** | `lib/supabase/admin.ts` — `createServiceRoleClient()` usando `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (somente servidor). |
| **Validação** | `lib/validations/onboarding.ts` — schemas por etapa (passo 1–5), `parseOnboardingPayload` para o submit completo, helpers (`mapProfileBirthFields`, `mapStudentDetailsInsert`, `parseOtherSports`). |
| **Server Actions** | `lib/onboarding/actions.ts` — `validateOnboardingTokenAction` (token válido, não usado, não expirado), `completeOnboardingAction` (cria usuário via `auth.admin.createUser`, atualiza `profiles`, insere `student_details`, marca token usado). |
| **UI** | Rota `app/onboarding/[token]/page.tsx`; wizard cliente em `components/onboarding/` (progresso neo cream, 5 etapas, tooltips/contexto em campos sensíveis; senha + LGPD na etapa final); estados de erro (`OnboardingInvalid`) incluindo config ausente (`SUPABASE_SERVICE_ROLE_KEY`). |
| **Testes** | `lib/validations/onboarding.test.ts` — testes de `parseOnboardingPayload` (Vitest). |
| **Documentação de env** | `.env.example` — comentário para `SUPABASE_SERVICE_ROLE_KEY` (onboarding). |

### 2.1 Por que service role no onboarding?

As políticas RLS atuais restringem **`student_details`** (e parte dos dados sensíveis) a **admin**. Um cadastro **público** por link não está autenticado como admin; por isso o plano prevê **RPC `SECURITY DEFINER` ou fluxo com service role**. A implementação escolheu **service role apenas em Server Actions**, sem expor a chave ao browser — alinhado ao [estado-atual §3.5](./estado-atual.md) e ao plano.

### 2.2 Variáveis de ambiente relevantes

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto (browser + servidor). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou publishable) | Cliente seguro com RLS nas rotas normais. |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Somente servidor: validar/inserir em `onboarding_tokens`, `auth.admin.createUser`, escrita que o anon não pode fazer. **Obrigatória** em `.env.local` (dev) e na **Vercel** (produção) para o onboarding funcionar. |

**Não** versionar valores reais; **não** prefixar com `NEXT_PUBLIC_`.

### 2.3 Token de convite vs service role

- **`SUPABASE_SERVICE_ROLE_KEY`**: chave **fixa do projeto** Supabase (Dashboard → Settings → API → **service_role**). Não é gerada pelo app; não expira como um “token de sessão”.
- **Token na URL** (`/onboarding/<hex>`): valor na coluna `onboarding_tokens.token`, gerado no **INSERT** (ex.: `encode(gen_random_bytes(24), 'hex')`), com validade em **`expires_at`**. Hoje pode ser criado via **SQL Editor**; na **Fase 5** o plano prevê botão no admin para gerar/copiar link.

### 2.4 Arquivos principais (referência rápida)

```
supabase/migrations/20260429100000_onboarding_tokens.sql
lib/supabase/admin.ts
lib/validations/onboarding.ts
lib/validations/onboarding.test.ts
lib/onboarding/actions.ts
app/onboarding/[token]/page.tsx
components/onboarding/onboarding-wizard.tsx
components/onboarding/onboarding-progress.tsx
components/onboarding/onboarding-invalid.tsx
components/onboarding/onboarding-constants.ts
components/onboarding/onboarding-step-types.ts
components/onboarding/field-error.tsx
components/onboarding/steps/onboarding-step-personal.tsx
components/onboarding/steps/onboarding-step-surf.tsx
components/onboarding/steps/onboarding-step-health.tsx
components/onboarding/steps/onboarding-step-availability.tsx
components/onboarding/steps/onboarding-step-confirm.tsx
```

A UI foi dividida por etapa para respeitar o limite de ~300 linhas por arquivo do projeto.

---

## 3. Fase 2 — o que já existe vs o que falta (RLS)

### 3.1 O que já está feito (infra)

- Migração inicial `supabase/migrations/20260428100000_initial_schema.sql`: tabelas, enums, triggers (`handle_new_user`, `set_updated_at`, `profiles_guard_student_updates`), função `is_admin()`, RLS nas tabelas, buckets Storage.
- Tipos em `types/database.ts`; integração app com Supabase nas camadas já documentadas em [estado-atual.md](./estado-atual.md).

### 3.2 Critério do plano ainda pendente

No [plano — Fase 2](../implementation/plano-de-implementacao.md), o critério de conclusão inclui:

> Políticas testadas com **dois usuários de teste (admin e aluno)**; **nenhum vazamento de linhas entre alunos**.

Isso é **validação manual / QA**, não um script automatizado no repositório. Continua **pendente** até ser executada conscientemente.

**Não bloqueia** a Fase 4: o onboarding usa service role no servidor de forma controlada; o critério da Fase 2 refere-se a **comportamento com sessão anon/authenticated** e papéis **admin vs student** nas políticas.

### 3.3 O que significa “validar RLS” na prática (roteiro sugerido)

1. Criar **dois utilizadores** no Supabase Auth (aluno A e aluno B), ambos com `profiles.role = student` (padrão do trigger).
2. Promover **um** usuário a **admin** com SQL:  
   `UPDATE profiles SET role = 'admin' WHERE id = '<uuid>';`
3. **Como aluno A** (sessão real no app ou cliente Supabase com JWT do aluno):
   - Tentar ler/atualizar dados cujo `student_id` ou `id` seja do **aluno B** em tabelas como `profiles`, `lessons`, `evolution_entries`, `trip_registrations` — **não** deve expor linhas do outro aluno.
4. **Como admin**: confirmar leitura/escrita onde as políticas permitem (ex.: `student_details`, `financials`).
5. Confirmar matriz sensível do PRD (ex.: aluno não acessa financeiro; `student_details` conforme políticas atuais).

Registrar evidências (prints ou notas) quando o time considerar a Fase 2 “fechada” do ponto de vista de QA.

---

## 4. Próximos passos sugeridos

1. **Executar** o checklist RLS da seção 3.3 e registrar conclusão no plano ou neste doc (data + responsável).
2. **Fase 5**: layout admin, lista de alunos e **geração de link de onboarding** (substituir inserts manuais em `onboarding_tokens`).
3. Opcional: após mudanças no schema, rodar `npm run db:types` e revisar tipos.

---

## 5. Referências cruzadas

- [Estado atual do projeto](./estado-atual.md)
- [Plano de implementação](../implementation/plano-de-implementacao.md)
- [PRD](../films_dutra_PRD.md) — §5, §6.2, §9
