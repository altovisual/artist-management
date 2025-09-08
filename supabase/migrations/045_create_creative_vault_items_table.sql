CREATE TABLE public.creative_vault_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    file_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.creative_vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view their own creative vault items." ON public.creative_vault_items
FOR SELECT USING (artist_id = (SELECT id FROM public.artists WHERE user_id = auth.uid()));

CREATE POLICY "Artists can insert their own creative vault items." ON public.creative_vault_items
FOR INSERT WITH CHECK (artist_id = (SELECT id FROM public.artists WHERE user_id = auth.uid()));

CREATE POLICY "Artists can update their own creative vault items." ON public.creative_vault_items
FOR UPDATE USING (artist_id = (SELECT id FROM public.artists WHERE user_id = auth.uid()));

CREATE POLICY "Artists can delete their own creative vault items." ON public.creative_vault_items
FOR DELETE USING (artist_id = (SELECT id FROM public.artists WHERE user_id = auth.uid()));

-- Admin policies (assuming admin role exists and is handled by a function like is_admin())
-- You might need to adjust these based on your actual admin role implementation
CREATE POLICY "Admins can view all creative vault items." ON public.creative_vault_items
FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can insert creative vault items." ON public.creative_vault_items
FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update creative vault items." ON public.creative_vault_items
FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can delete creative vault items." ON public.creative_vault_items
FOR DELETE TO authenticated USING (public.is_admin());