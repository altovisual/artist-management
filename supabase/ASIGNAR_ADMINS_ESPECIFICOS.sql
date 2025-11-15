-- ============================================
-- ASIGNAR ADMINS ESPECÍFICOS
-- ============================================
-- Este script asigna el rol de admin SOLO a los usuarios que deben tenerlo
-- según la imagen proporcionada del User Management

-- ============================================
-- ADMINS IDENTIFICADOS EN LA IMAGEN
-- ============================================
-- Los siguientes usuarios tienen rol "admin" en el sistema:
-- 1. gesa@mvpxmusic.com
-- 2. e.perez@mvpxmusic.com
-- 3. admin@mvpxmusic.com
-- 4. manuelalejandromendozasalvarado@gmail.com

-- ============================================
-- 1. VERIFICAR ESTADO ACTUAL
-- ============================================

SELECT 
    '=== ESTADO ACTUAL DE ADMINS ===' as info;

SELECT 
    au.email,
    up.user_type,
    up.is_admin,
    CASE 
        WHEN up.is_admin = true THEN '👑 ADMIN'
        WHEN up.user_type = 'artist' THEN '🎵 ARTIST'
        WHEN up.user_type = 'manager' THEN '💼 MANAGER'
        ELSE '❓ SIN ROL'
    END as rol_actual
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE au.email IN (
    'gesa@mvpxmusic.com',
    'e.perez@mvpxmusic.com',
    'admin@mvpxmusic.com',
    'manuelalejandromendozasalvarado@gmail.com'
)
ORDER BY au.email;

-- ============================================
-- 2. ASIGNAR ADMIN A LOS 4 USUARIOS
-- ============================================

-- Asignar is_admin = true a los 4 usuarios especificados
UPDATE public.user_profiles
SET 
    is_admin = true,
    updated_at = now()
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email IN (
        'gesa@mvpxmusic.com',
        'e.perez@mvpxmusic.com',
        'admin@mvpxmusic.com',
        'manuelalejandromendozasalvarado@gmail.com'
    )
);

-- Mensaje de confirmación
SELECT 
    '✅ ADMINS ASIGNADOS' as resultado,
    COUNT(*) as usuarios_actualizados
FROM public.user_profiles
WHERE is_admin = true
AND user_id IN (
    SELECT id FROM auth.users WHERE email IN (
        'gesa@mvpxmusic.com',
        'e.perez@mvpxmusic.com',
        'admin@mvpxmusic.com',
        'manuelalejandromendozasalvarado@gmail.com'
    )
);

-- ============================================
-- 3. REMOVER ADMIN DE OTROS USUARIOS
-- ============================================

-- Asegurarse que SOLO estos 4 usuarios tengan is_admin = true
UPDATE public.user_profiles
SET 
    is_admin = false,
    updated_at = now()
WHERE is_admin = true
AND user_id NOT IN (
    SELECT id FROM auth.users WHERE email IN (
        'gesa@mvpxmusic.com',
        'e.perez@mvpxmusic.com',
        'admin@mvpxmusic.com',
        'manuelalejandromendozasalvarado@gmail.com'
    )
);

-- Mensaje de confirmación
SELECT 
    '✅ PERMISOS DE ADMIN REMOVIDOS' as resultado,
    'Solo los 4 usuarios especificados tienen is_admin = true' as descripcion;

-- ============================================
-- 4. VERIFICACIÓN FINAL
-- ============================================

SELECT 
    '=== VERIFICACIÓN FINAL ===' as info;

-- Ver todos los admins actuales
SELECT 
    '👑 ADMINS ACTUALES' as tipo,
    au.email,
    up.user_type,
    up.is_admin,
    up.updated_at
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.user_id
WHERE up.is_admin = true
ORDER BY au.email;

-- Contar admins
SELECT 
    'TOTAL DE ADMINS' as metrica,
    COUNT(*) as cantidad,
    'Debe ser 4' as esperado
FROM public.user_profiles
WHERE is_admin = true;

-- Ver todos los usuarios y sus roles
SELECT 
    'RESUMEN COMPLETO' as info,
    au.email,
    COALESCE(up.user_type::text, 'NULL') as user_type,
    up.is_admin,
    CASE 
        WHEN up.is_admin = true THEN '👑 ADMIN - Acceso completo'
        WHEN up.user_type = 'artist' THEN '🎵 ARTIST - Solo sus transacciones'
        WHEN up.user_type = 'manager' THEN '💼 MANAGER - Solo sus artistas'
        ELSE '❓ SIN ROL - Sin acceso'
    END as permisos
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY 
    up.is_admin DESC,
    up.user_type,
    au.email;

-- ============================================
-- INSTRUCCIONES FINALES
-- ============================================

/*
✅ SCRIPT EJECUTADO EXITOSAMENTE

RESULTADO:
- 4 usuarios tienen is_admin = true:
  1. gesa@mvpxmusic.com
  2. e.perez@mvpxmusic.com
  3. admin@mvpxmusic.com
  4. manuelalejandromendozasalvarado@gmail.com

- Todos los demás usuarios tienen is_admin = false

PERMISOS POR ROL:
- 👑 ADMIN (is_admin = true): Ve TODAS las transacciones y estados de cuenta
- 💼 MANAGER (user_type = 'manager'): Ve solo artistas que gestiona
- 🎵 ARTIST (user_type = 'artist'): Ve solo sus propias transacciones

PRÓXIMOS PASOS:
1. Recarga la aplicación
2. Los 4 admins verán "👑 Admin View" en Finance
3. Los demás usuarios verán solo sus datos correspondientes
*/
