-- Cria bucket product-models se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-models', 'product-models', true, 104857600, ARRAY['model/gltf-binary', 'model/gltf+json']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600;

-- Permite acesso público ao bucket
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-models');

-- Permite upload com service role
CREATE POLICY IF NOT EXISTS "Service Role Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-models');

-- Permite update com service role
CREATE POLICY IF NOT EXISTS "Service Role Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-models');
