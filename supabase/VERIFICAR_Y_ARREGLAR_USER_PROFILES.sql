-- Script para verificar y arreglar la tabla user_profiles
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Verificar si la tabla user_profiles existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'user_profiles'
) AS table_exists;

-- 2. Verificar las columnas actuales de user_profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. Verificar si el tipo user_type existe
SELECT EXISTS (
   SELECT FROM pg_type 
   WHERE typname = 'user_type'
) AS user_type_exists;

-- 4. Si la tabla existe pero faltan columnas, ejecutar esto:
-- (Descomenta las líneas siguientes si necesitas ejecutarlas)

/*
-- Crear el enum user_type si no existe
DO $$ BEGIN
    CREATE TYPE public.user_type AS ENUM ('artist', 'manager', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Agregar las columnas faltantes
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS user_type public.user_type,
ADD COLUMN IF NOT EXISTS artist_profile_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_artist_profile ON public.user_profiles(artist_profile_id);
*/

-- 5. Verificar los datos actuales en user_profiles
SELECT 
    id,
    user_id,
    user_type,
    artist_profile_id,
    username,
    onboarding_completed,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- 6. Contar usuarios por tipo
SELECT 
    user_type,
    COUNT(*) as count
FROM public.user_profiles
GROUP BY user_type;
