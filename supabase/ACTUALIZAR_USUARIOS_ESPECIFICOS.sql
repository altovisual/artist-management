-- ============================================
-- ACTUALIZAR USUARIOS ESPECÍFICOS
-- ============================================
-- Basado en los emails vistos en la imagen

-- Ver todos los usuarios primero
SELECT 
    au.email,
    up.user_type,
    up.created_at
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at DESC;

-- ============================================
-- DESCOMENTA Y EJECUTA LAS LÍNEAS QUE NECESITES
-- ============================================

-- Para: j.cruzrivera@utp.com (si es artista)
/*
UPDATE public.user_profiles
SET user_type = 'artist'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'j.cruzrivera@utp.com');
*/

-- Para: pruebartista1@.com (si es artista)
/*
UPDATE public.user_profiles
SET user_type = 'artist'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pruebartista1@.com');
*/

-- Para: dayannegonzal1.com (si es artista)
/*
UPDATE public.user_profiles
SET user_type = 'artist'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'dayannegonzal1.com');
*/

-- Para: o.perezgamboa1@.com (si es artista)
/*
UPDATE public.user_profiles
SET user_type = 'artist'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'o.perezgamboa1@.com');
*/

-- Para: Albertgalz-holguin.com (si es artista)
/*
UPDATE public.user_profiles
SET user_type = 'artist'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'Albertgalz-holguin.com');
*/

-- Para: manuelita@andrewvisualive.adelgaza11.com (si es artista)
/*
UPDATE public.user_profiles
SET user_type = 'artist'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'manuelita@andrewvisualive.adelgaza11.com');
*/

-- ============================================
-- O ACTUALIZAR TODOS A ARTIST DE UNA VEZ
-- ============================================
-- Si TODOS los usuarios son artistas, ejecuta esto:

/*
UPDATE public.user_profiles
SET user_type = 'artist'
WHERE user_type IS NULL;

SELECT 'Todos los usuarios actualizados a artist' as resultado;
*/

-- ============================================
-- VERIFICAR RESULTADOS
-- ============================================
SELECT 
    'RESULTADO FINAL' as info,
    au.email,
    up.user_type,
    up.artist_profile_id,
    up.onboarding_completed
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at DESC;

-- Contar por tipo
SELECT 
    user_type,
    COUNT(*) as count
FROM public.user_profiles
GROUP BY user_type;
