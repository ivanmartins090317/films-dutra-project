-- Fase 10: configurações da escola (linha singleton)
CREATE TABLE public.school_settings (
  singleton boolean PRIMARY KEY DEFAULT true NOT NULL
    CONSTRAINT school_settings_singleton_check CHECK (singleton = TRUE),
  school_name text NOT NULL DEFAULT 'Films Dutra',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  logo_url text,
  student_portal_enabled boolean NOT NULL DEFAULT TRUE,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.school_settings (singleton) VALUES (TRUE);

CREATE TRIGGER set_school_settings_updated_at BEFORE
UPDATE ON public.school_settings FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "school_settings_select_public"
ON public.school_settings FOR SELECT TO anon,
authenticated USING (TRUE);

CREATE POLICY "school_settings_update_admin"
ON public.school_settings FOR UPDATE TO authenticated USING (public.is_admin ())
WITH
  CHECK (public.is_admin ());

GRANT SELECT ON TABLE public.school_settings TO anon,
authenticated;

GRANT UPDATE ON TABLE public.school_settings TO authenticated;
