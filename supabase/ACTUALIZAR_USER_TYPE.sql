-- ============================================
-- ACTUALIZAR USER_TYPE DE PERFILES EXISTENTES
-- ============================================

-- PASO 1: Ver todos los usuarios con sus emails
SELECT 
    'USUARIOS ACTUALES' as info,
    up.id as profile_id,
    up.user_id,
    au.email,
    up.user_type,
    up.created_at
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at DESC;

-- PASO 2: Actualizar un usuario específico a 'artist'
-- Reemplaza 'EMAIL_AQUI' con el email del usuario que quieres actualizar

-- Ejemplo: UPDATE para un artista
/*
UPDATE public.user_profiles
SET user_type = 'artist'
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'EMAIL_AQUI'
);
*/

-- PASO 3: Actualizar un usuario específico a 'manager'
-- Reemplaza 'EMAIL_AQUI' con el email del usuario que quieres actualizar

-- Ejemplo: UPDATE para un manager
/*
UPDATE public.user_profiles
SET user_type = 'manager'
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'EMAIL_AQUI'
);
*/

-- PASO 4: Si quieres actualizar TODOS los usuarios a 'artist' (CUIDADO!)
-- Descomenta esto solo si TODOS los usuarios son artistas

/*
UPDATE public.user_profiles
SET user_type = 'artist'
WHERE user_type IS NULL;
*/

-- PASO 5: Verificar los cambios
SELECT 
    'VERIFICACIÓN POST-UPDATE' as info,
    up.user_type,
    au.email,
    up.artist_profile_id,
    up.onboarding_completed,
    up.created_at
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at DESC;

-- PASO 6: Contar por tipo
SELECT 
    'CONTEO POR TIPO' as info,
    user_type,
    COUNT(*) as count
FROM public.user_profiles
GROUP BY user_type;
