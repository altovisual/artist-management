-- ============================================
-- DIAGNÓSTICO Y REPARACIÓN DE USUARIOS
-- ============================================
-- Este script diagnostica y repara problemas comunes con user_profiles

-- ============================================
-- 1. DIAGNÓSTICO: Ver todos los usuarios
-- ============================================

SELECT 
    '=== DIAGNÓSTICO DE USUARIOS ===' as info;

-- Ver usuarios de auth.users
SELECT 
    'USUARIOS EN AUTH.USERS' as tabla,
    au.id as user_id,
    au.email,
    au.created_at,
    au.email_confirmed_at
FROM auth.users au
ORDER BY au.created_at DESC;

-- Ver perfiles en user_profiles
SELECT 
    'PERFILES EN USER_PROFILES' as tabla,
    up.user_id,
    up.user_type,
    up.is_admin,
    up.artist_profile_id,
    up.created_at,
    au.email
FROM public.user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id
ORDER BY up.created_at DESC;

-- ============================================
-- 2. IDENTIFICAR PROBLEMAS
-- ============================================

-- Usuarios sin perfil
SELECT 
    '❌ USUARIOS SIN PERFIL' as problema,
    au.id as user_id,
    au.email,
    'Este usuario no tiene entrada en user_profiles' as descripcion
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL;

-- Perfiles sin user_type
SELECT 
    '❌ PERFILES SIN USER_TYPE' as problema,
    up.user_id,
    au.email,
    up.is_admin,
    'Este perfil no tiene user_type configurado' as descripcion
FROM public.user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id
WHERE up.user_type IS NULL;

-- Artistas sin artist_profile_id
SELECT 
    '⚠️ ARTISTAS SIN ARTIST_PROFILE_ID' as problema,
    up.user_id,
    au.email,
    up.user_type,
    'Este artista no tiene artist_profile_id vinculado' as descripcion
FROM public.user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id
WHERE up.user_type = 'artist' 
AND up.artist_profile_id IS NULL;

-- ============================================
-- 3. REPARACIÓN AUTOMÁTICA
-- ============================================

-- Crear perfiles faltantes (SIN user_type, para que admin los configure)
INSERT INTO public.user_profiles (user_id, is_admin, created_at, updated_at)
SELECT 
    au.id,
    false,
    au.created_at,
    now()
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- NO actualizar perfiles sin user_type automáticamente
-- El admin debe asignar los roles manualmente según corresponda
SELECT 
    '⚠️ PERFILES SIN ROL' as advertencia,
    'Los siguientes usuarios necesitan que se les asigne un rol manualmente' as descripcion;

SELECT 
    up.user_id,
    au.email,
    'Necesita rol' as accion_requerida
FROM public.user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id
WHERE up.user_type IS NULL;

-- ============================================
-- 4. VERIFICACIÓN POST-REPARACIÓN
-- ============================================

SELECT 
    '=== VERIFICACIÓN POST-REPARACIÓN ===' as info;

-- Contar usuarios por tipo
SELECT 
    'RESUMEN POR TIPO' as info,
    COALESCE(user_type::text, 'NULL') as user_type,
    COUNT(*) as cantidad,
    COUNT(CASE WHEN is_admin = true THEN 1 END) as admins
FROM public.user_profiles
GROUP BY user_type;

-- Ver todos los perfiles actualizados
SELECT 
    'PERFILES ACTUALIZADOS' as info,
    up.user_id,
    au.email,
    up.user_type,
    up.is_admin,
    up.artist_profile_id,
    CASE 
        WHEN up.is_admin = true THEN '👑 ADMIN'
        WHEN up.user_type = 'artist' THEN '🎵 ARTIST'
        WHEN up.user_type = 'manager' THEN '💼 MANAGER'
        ELSE '❓ UNKNOWN'
    END as rol_visual
FROM public.user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id
ORDER BY up.is_admin DESC, up.user_type, au.email;

-- ============================================
-- 5. ASIGNAR ADMIN AL USUARIO ACTUAL
-- ============================================

-- OPCIÓN A: Asignar admin por email
-- Descomenta y modifica el email:

/*
UPDATE public.user_profiles
SET 
    is_admin = true,
    updated_at = now()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'TU_EMAIL@ejemplo.com'
);

SELECT 
    '✅ ADMIN ASIGNADO' as resultado,
    au.email,
    up.user_type,
    up.is_admin
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.user_id
WHERE au.email = 'TU_EMAIL@ejemplo.com';
*/

-- OPCIÓN B: Asignar admin al primer usuario (el más antiguo)
-- Descomenta para usar:

/*
UPDATE public.user_profiles
SET 
    is_admin = true,
    updated_at = now()
WHERE user_id = (
    SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
);

SELECT 
    '✅ ADMIN ASIGNADO AL PRIMER USUARIO' as resultado,
    au.email,
    up.user_type,
    up.is_admin
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.user_id
WHERE up.is_admin = true;
*/

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================

/*
CÓMO USAR ESTE SCRIPT:

1. EJECUTA TODO EL SCRIPT TAL COMO ESTÁ
   - Verás el diagnóstico completo
   - Se repararán automáticamente los perfiles faltantes

2. ASIGNA ADMIN MANUALMENTE:
   - Descomenta la OPCIÓN A y pon tu email
   - O descomenta la OPCIÓN B para asignar al primer usuario
   - Ejecuta solo esa sección

3. VERIFICA LOS RESULTADOS:
   - Revisa la sección "VERIFICACIÓN POST-REPARACIÓN"
   - Deberías ver tu usuario con is_admin = true

4. RECARGA LA APLICACIÓN:
   - Cierra sesión y vuelve a entrar
   - O simplemente recarga la página de Finance

EJEMPLO PARA ASIGNAR ADMIN:

UPDATE public.user_profiles
SET is_admin = true, updated_at = now()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'altovisual.js@gmail.com'
);
*/
