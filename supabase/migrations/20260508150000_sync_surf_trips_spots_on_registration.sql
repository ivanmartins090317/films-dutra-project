-- Mantém surf_trips.spots_taken = contagem de inscrições confirmadas.
-- Permite que o aluno (RLS em trip_registrations) altere status e a contagem reflita sem política de escrita em surf_trips.

CREATE OR REPLACE FUNCTION public.refresh_surf_trip_confirmed_spots(p_trip_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cnt integer;
  lim smallint;
BEGIN
  IF p_trip_id IS NULL THEN
    RETURN;
  END IF;

  SELECT st.spots_total
  INTO lim
  FROM public.surf_trips st
  WHERE st.id = p_trip_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT COUNT(*)::integer
  INTO cnt
  FROM public.trip_registrations tr
  WHERE tr.trip_id = p_trip_id
    AND tr.status = 'confirmed'::public.trip_registration_status;

  IF cnt > lim THEN
    RAISE EXCEPTION USING
      errcode = 'integrity_constraint_violation',
      message = 'Não há vagas suficientes para confirmar todas as inscrições nesta trip.';
  END IF;

  UPDATE public.surf_trips
  SET spots_taken = cnt::smallint
  WHERE id = p_trip_id;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_surf_trip_confirmed_spots (uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.refresh_surf_trip_confirmed_spots (uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.trip_registrations_refresh_spots()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ids uuid[];
  t uuid;
BEGIN
  ids := ARRAY[]::uuid[];
  IF TG_OP = 'DELETE' THEN
    ids := array_append(ids, OLD.trip_id);
  ELSIF TG_OP = 'INSERT' THEN
    ids := array_append(ids, NEW.trip_id);
  ELSE
    ids := array_append(ids, OLD.trip_id);
    IF NEW.trip_id IS DISTINCT FROM OLD.trip_id THEN
      ids := array_append(ids, NEW.trip_id);
    END IF;
  END IF;

  FOREACH t IN ARRAY ids LOOP
    PERFORM public.refresh_surf_trip_confirmed_spots(t);
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trip_registrations_refresh_spots ON public.trip_registrations;

CREATE TRIGGER trip_registrations_refresh_spots
AFTER INSERT OR UPDATE OR DELETE ON public.trip_registrations
FOR EACH ROW
EXECUTE FUNCTION public.trip_registrations_refresh_spots();

-- Recalcula vagas ocupadas já existentes (idempotência com código admin pré-trigger).
UPDATE public.surf_trips st
SET
  spots_taken = COALESCE(
    (
      SELECT COUNT(*)::integer
      FROM public.trip_registrations tr
      WHERE
        tr.trip_id = st.id
        AND tr.status = 'confirmed'::public.trip_registration_status
    ),
    0
  )::smallint;
