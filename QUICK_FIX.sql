-- EJECUTA ESTO EN SUPABASE SQL EDITOR PARA ARREGLAR EL PROBLEMA

-- 1. Agregar columnas faltantes
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS muso_ai_profile_id TEXT;

ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Verificar que las columnas existen
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'artists' 
AND column_name IN ('muso_ai_profile_id', 'image_url');

-- 3. Ver algunos artistas para confirmar
SELECT id, name, spotify_artist_id, muso_ai_profile_id, image_url 
FROM public.artists 
LIMIT 5;
