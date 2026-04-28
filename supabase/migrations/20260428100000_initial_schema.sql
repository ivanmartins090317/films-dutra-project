-- Films Dutra — schema inicial (PRD §5 + plano Fase 2)
-- Aplicar no Supabase: SQL Editor → colar e rodar, ou: supabase db push (CLI linkado)

-- ---------------------------------------------------------------------------
-- Tipos enumerados
-- ---------------------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM ('admin', 'student');

CREATE TYPE public.lesson_status AS ENUM (
  'scheduled',
  'completed',
  'cancelled',
  'missed'
);

CREATE TYPE public.financial_type AS ENUM ('monthly', 'package', 'single');

CREATE TYPE public.financial_status AS ENUM ('pending', 'paid', 'overdue');

CREATE TYPE public.trip_registration_status AS ENUM (
  'interested',
  'confirmed',
  'cancelled'
);

CREATE TYPE public.surf_level AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TYPE public.weekly_frequency AS ENUM ('1x', '2x', '3x', 'weekend');

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'student',
  full_name text NOT NULL DEFAULT '',
  birth_year integer,
  birth_date date,
  phone text,
  address text,
  sexual_orientation text,
  height_cm smallint,
  weight_kg numeric,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  lgpd_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.student_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  student_id uuid NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  surfs_already boolean NOT NULL DEFAULT false,
  surf_level public.surf_level NOT NULL DEFAULT 'beginner',
  surf_time_years numeric NOT NULL DEFAULT 0,
  other_sports text[] NOT NULL DEFAULT '{}',
  health_conditions text NOT NULL DEFAULT '',
  surgeries text NOT NULL DEFAULT '',
  menstrual_cycle text,
  equipment_has boolean NOT NULL DEFAULT false,
  equipment_model text NOT NULL DEFAULT '',
  surf_goal text NOT NULL DEFAULT '',
  preferred_days text[] NOT NULL DEFAULT '{}',
  weekly_frequency public.weekly_frequency NOT NULL DEFAULT '1x',
  suggestions text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  student_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_min smallint NOT NULL DEFAULT 60,
  status public.lesson_status NOT NULL DEFAULT 'scheduled',
  cancel_reason text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  skills_noted text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.evolution_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  student_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons (id) ON DELETE SET NULL,
  entry_date date NOT NULL,
  content text NOT NULL DEFAULT '',
  skills text[] NOT NULL DEFAULT '{}',
  media_urls text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.financials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  student_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type public.financial_type NOT NULL,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  paid_at date,
  status public.financial_status NOT NULL DEFAULT 'pending',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.surf_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  title text NOT NULL DEFAULT '',
  destination text NOT NULL DEFAULT '',
  trip_date date NOT NULL,
  description text NOT NULL DEFAULT '',
  spots_total smallint NOT NULL DEFAULT 0,
  spots_taken smallint NOT NULL DEFAULT 0,
  cover_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT surf_trips_spots_nonneg CHECK (
    spots_total >= 0
    AND spots_taken >= 0
    AND spots_taken <= spots_total
  )
);

CREATE TABLE public.trip_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  trip_id uuid NOT NULL REFERENCES public.surf_trips (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  status public.trip_registration_status NOT NULL DEFAULT 'interested',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trip_registrations_unique_student_per_trip UNIQUE (trip_id, student_id)
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

CREATE INDEX idx_lessons_student_id ON public.lessons (student_id);

CREATE INDEX idx_lessons_scheduled_at ON public.lessons (scheduled_at);

CREATE INDEX idx_evolution_entries_student_id ON public.evolution_entries (student_id);

CREATE INDEX idx_financials_student_id ON public.financials (student_id);

CREATE INDEX idx_surf_trips_trip_date ON public.surf_trips (trip_date);

CREATE INDEX idx_trip_registrations_trip_id ON public.trip_registrations (trip_id);

CREATE INDEX idx_trip_registrations_student_id ON public.trip_registrations (student_id);

CREATE INDEX idx_profiles_role ON public.profiles (role);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_student_details_updated_at
BEFORE UPDATE ON public.student_details
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Novo usuário → linha em profiles (Padrão Supabase)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    'student',
    coalesce(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- helper RLS (SECURITY DEFINER evita recursão em policies de profiles)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'::public.user_role
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_admin () TO anon, authenticated, service_role;

-- Aluno não altera role nem is_active (admin faz promoções / desativação)
CREATE OR REPLACE FUNCTION public.profiles_guard_student_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.is_active := OLD.is_active;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_guard_student_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.profiles_guard_student_updates();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.evolution_entries ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.surf_trips ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.trip_registrations ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles FOR SELECT TO authenticated
USING (
  (id = auth.uid())
  OR public.is_admin ()
);

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid ());

CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles FOR UPDATE TO authenticated
USING (
  (id = auth.uid())
  OR public.is_admin ()
)
WITH CHECK (
  (id = auth.uid())
  OR public.is_admin ()
);

CREATE POLICY "profiles_delete_admin"
ON public.profiles FOR DELETE TO authenticated
USING (public.is_admin ());

-- student_details: somente admin (onboarding na Fase 4 pode usar RPC service role)
CREATE POLICY "student_details_all_admin"
ON public.student_details FOR ALL TO authenticated
USING (public.is_admin ())
WITH CHECK (public.is_admin ());

-- lessons
CREATE POLICY "lessons_select_own_or_admin"
ON public.lessons FOR SELECT TO authenticated
USING (
  (student_id = auth.uid ())
  OR public.is_admin ()
);

CREATE POLICY "lessons_write_admin"
ON public.lessons FOR ALL TO authenticated
USING (public.is_admin ())
WITH CHECK (public.is_admin ());

-- evolution_entries
CREATE POLICY "evolution_select_own_or_admin"
ON public.evolution_entries FOR SELECT TO authenticated
USING (
  (student_id = auth.uid ())
  OR public.is_admin ()
);

CREATE POLICY "evolution_write_admin"
ON public.evolution_entries FOR ALL TO authenticated
USING (public.is_admin ())
WITH CHECK (public.is_admin ());

-- financials: apenas admin
CREATE POLICY "financials_all_admin"
ON public.financials FOR ALL TO authenticated
USING (public.is_admin ())
WITH CHECK (public.is_admin ());

-- surf_trips
CREATE POLICY "surf_trips_select_authenticated"
ON public.surf_trips FOR SELECT TO authenticated
USING (true);

CREATE POLICY "surf_trips_write_admin"
ON public.surf_trips FOR ALL TO authenticated
USING (public.is_admin ())
WITH CHECK (public.is_admin ());

-- trip_registrations
CREATE POLICY "trip_reg_select_own_or_admin"
ON public.trip_registrations FOR SELECT TO authenticated
USING (
  (student_id = auth.uid ())
  OR public.is_admin ()
);

CREATE POLICY "trip_reg_insert_own_or_admin"
ON public.trip_registrations FOR INSERT TO authenticated
WITH CHECK (
  (student_id = auth.uid ())
  OR public.is_admin ()
);

CREATE POLICY "trip_reg_update_own_or_admin"
ON public.trip_registrations FOR UPDATE TO authenticated
USING (
  (student_id = auth.uid ())
  OR public.is_admin ()
)
WITH CHECK (
  (student_id = auth.uid ())
  OR public.is_admin ()
);

CREATE POLICY "trip_reg_delete_admin"
ON public.trip_registrations FOR DELETE TO authenticated
USING (public.is_admin ());

-- ---------------------------------------------------------------------------
-- Storage (buckets + políticas)
-- ---------------------------------------------------------------------------

INSERT INTO
  storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', false),
  ('trip-covers', 'trip-covers', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_avatars_select_auth"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "storage_avatars_insert_own_folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername (name))[1] = auth.uid ()::text
);

CREATE POLICY "storage_avatars_update_own_or_admin"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    (storage.foldername (name))[1] = auth.uid ()::text
    OR public.is_admin ()
  )
);

CREATE POLICY "storage_avatars_delete_own_or_admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    (storage.foldername (name))[1] = auth.uid ()::text
    OR public.is_admin ()
  )
);

CREATE POLICY "storage_trip_covers_select_auth"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'trip-covers');

CREATE POLICY "storage_trip_covers_write_admin"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'trip-covers' AND public.is_admin ());

CREATE POLICY "storage_trip_covers_update_admin"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'trip-covers' AND public.is_admin ());

CREATE POLICY "storage_trip_covers_delete_admin"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'trip-covers' AND public.is_admin ());

-- ---------------------------------------------------------------------------
-- Privilégios (alinhado ao padrão Supabase em public)
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT EXECUTE ON FUNCTION public.set_updated_at () TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.profiles_guard_student_updates () TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.handle_new_user () TO service_role;
