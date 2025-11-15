-- ============================================
-- ASIGNAR ROL DE ADMIN A UN USUARIO
-- ============================================

-- Ver todos los usuarios actuales
SELECT 
    'USUARIOS ACTUALES' as info,
    au.id as user_id,
    au.email,
    up.user_type,
    up.is_admin,
    up.created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;

-- ============================================
-- OPCIÓN 1: Asignar admin por EMAIL
-- ============================================
-- Reemplaza 'admin@ejemplo.com' con el email del usuario

/*
UPDATE public.user_profiles 
SET is_admin = true 
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'admin@ejemplo.com'
);
*/

-- ============================================
-- OPCIÓN 2: Asignar admin por USER_ID
-- ============================================
-- Reemplaza 'USER_ID_AQUI' con el ID del usuario

/*
UPDATE public.user_profiles 
SET is_admin = true 
WHERE user_id = 'USER_ID_AQUI';
*/

-- ============================================
-- OPCIÓN 3: Asignar múltiples admins
-- ============================================

/*
UPDATE public.user_profiles 
SET is_admin = true 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN (
        'admin1@ejemplo.com',
        'admin2@ejemplo.com',
        'admin3@ejemplo.com'
    )
);
*/

-- ============================================
-- VERIFICAR ADMINS
-- ============================================

SELECT 
    'USUARIOS ADMIN' as info,
    au.email,
    up.user_type,
    up.is_admin,
    up.created_at
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE up.is_admin = true
ORDER BY up.created_at DESC;

-- ============================================
-- QUITAR ROL DE ADMIN
-- ============================================
-- Si necesitas quitar el rol de admin a alguien

/*
UPDATE public.user_profiles 
SET is_admin = false 
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'usuario@ejemplo.com'
);
*/
