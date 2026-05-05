-- Table Editor / SQL como postgres: auth.uid() é NULL → is_admin() era falso e
-- o trigger revertia role/is_active. Só aplicamos o guard quando há sessão JWT.

CREATE OR REPLACE FUNCTION public.profiles_guard_student_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.is_active := OLD.is_active;
  END IF;
  RETURN NEW;
END;
$$;
