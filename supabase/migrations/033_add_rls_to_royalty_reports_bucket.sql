-- Add RLS policies to the royalty-reports bucket
CREATE POLICY "Allow authenticated users to upload royalty reports (for debugging)" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'royalty-reports' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view their own royalty reports" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'royalty-reports' AND owner = auth.uid());