-- ============================================
-- AGREGAR COLUMNA is_admin A user_profiles
-- ============================================
-- IMPORTANTE: Este script debe ejecutarse ANTES que cualquier otro
-- que use la columna is_admin en sus policies

-- Verificar si la columna ya existe
SELECT 
    'VERIFICANDO COLUMNA is_admin' as info,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name = 'is_admin';

-- Agregar la columna si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN is_admin BOOLEAN DEFAULT false;
        
        RAISE NOTICE '✅ Columna is_admin agregada a user_profiles';
    ELSE
        RAISE NOTICE '✅ Columna is_admin ya existe';
    END IF;
END $$;

-- Verificar que se creó correctamente
SELECT 
    'VERIFICACIÓN FINAL' as info,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name = 'is_admin';

-- Ver todos los usuarios y su estado de admin
SELECT 
    'USUARIOS ACTUALES' as info,
    au.email,
    up.user_type,
    COALESCE(up.is_admin, false) as is_admin,
    up.created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY up.created_at DESC;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
/*
ESTE SCRIPT DEBE EJECUTARSE:

1. DESPUÉS de EJECUTAR_ESTO_PRIMERO.sql
2. ANTES de CREAR_TABLA_ARTIST_MANAGERS.sql
3. ANTES de ARREGLAR_RLS_FINANZAS.sql

ORDEN CORRECTO:
1. EJECUTAR_ESTO_PRIMERO.sql
2. AGREGAR_COLUMNA_IS_ADMIN.sql ← ESTE SCRIPT
3. CREAR_TABLA_ARTIST_MANAGERS.sql
4. ARREGLAR_RLS_ARTISTS.sql
5. ARREGLAR_RLS_FINANZAS.sql
6. ASIGNAR_ADMIN.sql (opcional)

La columna is_admin se usa para identificar administradores:
- Artistas: user_type = 'artist', is_admin = false
- Managers: user_type = 'manager', is_admin = false
- Admins: is_admin = true (puede tener cualquier user_type)

Los admins tienen permisos completos sobre todas las tablas.
*/
