INSERT INTO storage.buckets (id, name, public)
VALUES ('creative-vault-assets', 'creative-vault-assets', FALSE);

CREATE POLICY "Artists can upload their own creative vault assets." ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'creative-vault-assets' AND auth.uid() IN (SELECT user_id FROM public.artists WHERE id = (SELECT artist_id FROM public.creative_vault_items WHERE id = (split_part(name, '/', 1)::uuid))));

CREATE POLICY "Artists can view their own creative vault assets." ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'creative-vault-assets' AND auth.uid() IN (SELECT user_id FROM public.artists WHERE id = (SELECT artist_id FROM public.creative_vault_items WHERE id = (split_part(name, '/', 1)::uuid))));

CREATE POLICY "Artists can delete their own creative vault assets." ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'creative-vault-assets' AND auth.uid() IN (SELECT user_id FROM public.artists WHERE id = (SELECT artist_id FROM public.creative_vault_items WHERE id = (split_part(name, '/', 1)::uuid))));

-- Admin policies
CREATE POLICY "Admins can upload creative vault assets." ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'creative-vault-assets' AND public.is_admin());

CREATE POLICY "Admins can view creative vault assets." ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'creative-vault-assets' AND public.is_admin());

CREATE POLICY "Admins can delete creative vault assets." ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'creative-vault-assets' AND public.is_admin());