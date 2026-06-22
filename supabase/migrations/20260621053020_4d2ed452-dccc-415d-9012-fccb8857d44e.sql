
DROP POLICY IF EXISTS "Public read cms attachments" ON storage.objects;

CREATE POLICY "Public read published notice attachments"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'cms-attachments'
  AND EXISTS (
    SELECT 1 FROM public.notices n
    WHERE n.attachment_url LIKE '%' || storage.objects.name || '%'
      AND n.status = 'published'
      AND (n.published_at IS NULL OR n.published_at <= now())
  )
);

CREATE POLICY "Admins read all cms attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cms-attachments'
  AND public.has_role(auth.uid(), 'admin')
);
