# Implementação — Fase 12 (hardening LGPD, testes, deploy e handoff)

Referência: [plano de implementação — Fase 12](../implementation/plano-de-implementacao.md#fase-12--hardening-lgpd-testes-e-deploy).

## Entregue no código (maio/2026)

| Área | Descrição |
|------|-----------|
| **LGPD / textos** | Rota pública **`/privacidade`** com modelo de política (revisão jurídica recomendada antes de produção); nome/contato da escola quando **`school_settings`** está disponível. |
| **Links** | Componente **`PublicLegalFooter`** (`components/legal/public-legal-footer.tsx`) em **`/`**, **`/login`**, wizard de onboarding e rodapé da página de privacidade. |
| **Consentimento** | Etapa final do onboarding: checkbox com **`id`/`htmlFor`**, link aberto em nova aba para **`/privacidade`**, **`aria-invalid`** / **`aria-describedby`** + **`FieldError`** com **`role="alert"`**. |
| **Headers HTTP** | `next.config.mjs`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`. |
| **Testes Vitest** | **`lib/validations/auth.test.ts`** (`loginSchema`); pasta **`e2e/`** excluída do Vitest (`vitest.config.mts`). |
| **E2E Playwright** | **`playwright.config.ts`** — servidor em porta **`3310`** por padrão (evita colisão com `next dev :3000`); **`e2e/smoke.spec.ts`** — login, privacidade, home. Scripts **`npm run test:e2e`** / **`test:e2e:ui`**. |
| **CI** | `.github/workflows/ci.yml` — passo **Install Playwright** + **E2E smoke** com variáveis públicas placeholder para Supabase. |

## Pendências operacionais (fora do código)

- Revisão jurídica da política de privacidade e alinhamento com contratos da escola.
- Deploy na Vercel: variáveis `NEXT_PUBLIC_*`, Redirect URLs no Supabase, domínio cliente.
- Checklist de validação com professor e alunos piloto: ver [checklist-validacao-producao-fase-12.md](./checklist-validacao-producao-fase-12.md).
- Roteiro manual **RLS** (admin + aluno) — critério histórico da Fase 2.

## Arquivos principais

`app/privacidade/page.tsx`, `components/legal/public-legal-footer.tsx`, `components/onboarding/steps/onboarding-step-confirm.tsx`, `components/onboarding/field-error.tsx`, `next.config.mjs`, `playwright.config.ts`, `e2e/smoke.spec.ts`, `lib/validations/auth.test.ts`, `.github/workflows/ci.yml`.
