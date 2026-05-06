-- URLs públicas estáveis para capas de surf trips (`cover_url` em surf_trips), alinhado ao bucket avatars.

UPDATE storage.buckets
SET public = true
WHERE id = 'trip-covers';
