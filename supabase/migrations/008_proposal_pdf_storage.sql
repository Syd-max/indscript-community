-- Allow public (anon) visitors to upload proposal PDFs (max handled client-side, 2MB)
DROP POLICY IF EXISTS "Public can upload proposal pdf" ON storage.objects;
CREATE POLICY "Public can upload proposal pdf"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'community-assets'
    AND name LIKE 'documents/proposals/%'
    AND lower(storage.extension(name)) = 'pdf'
  );

-- Public bucket reads (so admin can open the link)
DROP POLICY IF EXISTS "Public can read community assets" ON storage.objects;
CREATE POLICY "Public can read community assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'community-assets');
