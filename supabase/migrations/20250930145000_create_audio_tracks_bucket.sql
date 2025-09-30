-- Create audio-tracks storage bucket for shareable tracks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-tracks',
  'audio-tracks',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'audio/ogg',
    'audio/webm',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio-tracks bucket

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-tracks');

-- Allow public read access to all files
CREATE POLICY "Public can view audio files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-tracks');

-- Allow users to update their own files
CREATE POLICY "Users can update their own audio files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'audio-tracks' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'audio-tracks' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow admins to manage all files
CREATE POLICY "Admins can manage all audio files"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'audio-tracks' AND public.is_admin())
WITH CHECK (bucket_id = 'audio-tracks' AND public.is_admin());
