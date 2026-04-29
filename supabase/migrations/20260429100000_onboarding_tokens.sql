-- Tokens para convite de onboarding (Fase 4). Acesso apenas via service role no app.

CREATE TABLE public.onboarding_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  notes text NOT NULL DEFAULT '',
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now ()
);

CREATE INDEX idx_onboarding_tokens_expires ON public.onboarding_tokens (expires_at);

ALTER TABLE public.onboarding_tokens ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.onboarding_tokens IS 'Links únicos /onboarding/[token]; leitura e escrita só pelo backend com service role.';

-- Exemplo (SQL no dashboard, após `db:push`): gerar token de teste válido por 7 dias
-- INSERT INTO public.onboarding_tokens (token, expires_at)
-- VALUES (encode(gen_random_bytes(24), 'hex'), now() + interval '7 days');
