
-- Anyone can read attachments (so signed URLs work for public site visitors)
CREATE POLICY "Public read cms attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cms-attachments');

-- Only admins can upload
CREATE POLICY "Admins can upload cms attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'cms-attachments'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Only admins can update
CREATE POLICY "Admins can update cms attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'cms-attachments'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Only admins can delete
CREATE POLICY "Admins can delete cms attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'cms-attachments'
    AND public.has_role(auth.uid(), 'admin')
  );
