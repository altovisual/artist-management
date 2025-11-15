-- ============================================
-- DIAGNÓSTICO DE PERFILES DE USUARIO
-- ============================================
-- Ejecuta este script para ver qué está pasando con los perfiles

-- 1. Ver todos los usuarios en auth.users
SELECT 
    'USUARIOS EN AUTH.USERS' as info,
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Ver todos los perfiles en user_profiles
SELECT 
    'PERFILES EN USER_PROFILES' as info,
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

-- 3. Verificar si hay usuarios sin perfil
SELECT 
    'USUARIOS SIN PERFIL' as info,
    u.id as user_id,
    u.email,
    u.created_at as user_created_at
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. Verificar las columnas de user_profiles
SELECT 
    'COLUMNAS DE USER_PROFILES' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 5. Ver artistas sin perfil de usuario
SELECT 
    'ARTISTAS SIN PERFIL DE USUARIO' as info,
    a.id as artist_id,
    a.name as artist_name,
    a.genre,
    a.country,
    a.user_id,
    a.created_at
FROM public.artists a
LEFT JOIN public.user_profiles p ON a.user_id = p.user_id
WHERE p.id IS NULL
ORDER BY a.created_at DESC;

-- 6. Ver perfiles de artistas completos
SELECT 
    'PERFILES DE ARTISTAS COMPLETOS' as info,
    p.user_id,
    p.user_type,
    p.artist_profile_id,
    a.name as artist_name,
    a.genre,
    a.country,
    p.created_at as profile_created,
    a.created_at as artist_created
FROM public.user_profiles p
LEFT JOIN public.artists a ON p.artist_profile_id = a.id
WHERE p.user_type = 'artist'
ORDER BY p.created_at DESC;

-- 7. Verificar RLS policies en user_profiles
SELECT 
    'RLS POLICIES EN USER_PROFILES' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_profiles';

-- 8. Contar usuarios por tipo
SELECT 
    'CONTEO POR TIPO DE USUARIO' as info,
    user_type,
    COUNT(*) as count
FROM public.user_profiles
GROUP BY user_type;
