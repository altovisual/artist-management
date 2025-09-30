-- Create storage bucket for artist images
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-images', 'artist-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for artist-images bucket
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'artist-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artist-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'artist-images'
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'artist-images'
  AND auth.role() = 'authenticated'
);
