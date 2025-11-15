-- ============================================
-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR
-- ============================================
-- Este script arreglará el problema de "Error creating user profile"

-- PASO 1: Verificar el estado actual
SELECT 'Verificando tabla user_profiles...' as status;

SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- PASO 2: Crear el enum user_type (si no existe)
SELECT 'Creando enum user_type...' as status;

DO $$ 
BEGIN
    CREATE TYPE public.user_type AS ENUM ('artist', 'manager', 'other');
    RAISE NOTICE 'Enum user_type creado exitosamente';
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Enum user_type ya existe - OK';
END $$;

-- PASO 3: Agregar las columnas necesarias
SELECT 'Agregando columnas a user_profiles...' as status;

DO $$
BEGIN
    -- Agregar user_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'user_type'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN user_type public.user_type;
        RAISE NOTICE 'Columna user_type agregada';
    ELSE
        RAISE NOTICE 'Columna user_type ya existe - OK';
    END IF;

    -- Agregar artist_profile_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'artist_profile_id'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN artist_profile_id UUID REFERENCES public.artists(id) ON DELETE SET NULL;
        RAISE NOTICE 'Columna artist_profile_id agregada';
    ELSE
        RAISE NOTICE 'Columna artist_profile_id ya existe - OK';
    END IF;

    -- Agregar username
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN username TEXT;
        RAISE NOTICE 'Columna username agregada';
    ELSE
        RAISE NOTICE 'Columna username ya existe - OK';
    END IF;

    -- Agregar avatar_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Columna avatar_url agregada';
    ELSE
        RAISE NOTICE 'Columna avatar_url ya existe - OK';
    END IF;
END $$;

-- PASO 4: Crear índices
SELECT 'Creando índices...' as status;

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type 
ON public.user_profiles(user_type);

CREATE INDEX IF NOT EXISTS idx_user_profiles_artist_profile 
ON public.user_profiles(artist_profile_id);

-- PASO 5: Verificar el resultado final
SELECT 'Verificación final...' as status;

SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- PASO 6: Mostrar mensaje de éxito
SELECT '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE' as status;
SELECT 'Ahora puedes probar el registro de nuevo' as next_step;
