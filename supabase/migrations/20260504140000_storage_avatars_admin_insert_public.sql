-- Permite que administradores façam upload no bucket avatars para qualquer pasta (ex.: pasta do aluno).
-- Políticas existentes já permitem UPDATE/DELETE por admin; INSERT era apenas na própria pasta (auth.uid).
-- Bucket público: URLs estáveis para avatar_url em profiles (lista admin / next/image sem signed URL).

CREATE POLICY "storage_avatars_insert_admin"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND public.is_admin ()
);

UPDATE storage.buckets
SET public = true
WHERE id = 'avatars';
