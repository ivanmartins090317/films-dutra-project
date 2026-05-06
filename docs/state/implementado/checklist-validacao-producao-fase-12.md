# Checklist — validação pré-produção (Fase 12)

Use este roteiro na sessão com **professor / coordenação** e **primeiros alunos**, após deploy em ambiente estável (staging ou produção).

## LGPD e comunicação

- [ ] Texto da **Política de privacidade** (`/privacidade`) foi revisado por assessoria jurídica ou responsável da escola.
- [ ] Link para a política está visível no **login**, **home**, **onboarding** e onde mais fizer sentido para o MVP.
- [ ] Fluxo de onboarding exige **aceite explícito** e grava **`lgpd_accepted_at`** / equivalente no perfil (conferir no Supabase após um cadastro teste).

## Autenticação e áreas

- [ ] Login **admin** → apenas **`/admin`**; tentativa de **`/student`** redireciona corretamente.
- [ ] Login **aluno** → **`/student`** quando portal ativo e conta ativa.
- [ ] Conta **inativa** ou **portal desligado** em configurações → mensagens claras no login.
- [ ] **Recuperação de senha** (magic link): Redirect URLs corretas no Supabase e **`NEXT_PUBLIC_SITE_URL`** / Vercel URL coerentes.

## RLS e dados sensíveis (crítico)

- [ ] Com usuário **aluno**, não há leitura de **`financials`** nem **`student_details`** via app ou API (roteiro em [relatorio-fase-4-e-pendencia-rls-fase-2.md](./relatorio-fase-4-e-pendencia-rls-fase-2.md)).
- [ ] Dois alunos distintos não enxergam dados um do outro (aulas, evolução, inscrições).

## Jornadas funcionais (amostra)

- [ ] **Onboarding** completo com token válido → perfil e detalhes coerentes.
- [ ] **Admin**: criar ou editar uma aula na agenda; registrar uma entrada de evolução; lançamento financeiro (smoke).
- [ ] **Aluno**: visualizar próximas aulas, evolução e trips; manifestar interesse / confirmar em uma trip com vagas.

## Operação e monitoramento

- [ ] Logs da **Vercel** e métricas básicas do **Supabase** acessíveis ao time.
- [ ] Variáveis de ambiente de produção documentadas (sem commitar segredos).

---

*Documento operacional; ajuste itens conforme decisões de produto.*
