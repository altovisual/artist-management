-- Script para eliminar artistas creados automáticamente desde estados de cuenta
-- EJECUTA ESTO EN SUPABASE SQL EDITOR

-- 1. Ver los artistas que serán eliminados (sin spotify_artist_id y sin muso_ai_profile_id)
SELECT 
    id, 
    name, 
    genre,
    spotify_artist_id,
    muso_ai_profile_id,
    created_at
FROM public.artists
WHERE spotify_artist_id IS NULL 
  AND muso_ai_profile_id IS NULL
ORDER BY created_at DESC;

-- 2. ELIMINAR artistas sin conexiones (descomenta para ejecutar)
-- ADVERTENCIA: Esta acción NO se puede deshacer

/*
DELETE FROM public.artists
WHERE spotify_artist_id IS NULL 
  AND muso_ai_profile_id IS NULL;
*/

-- 3. Si quieres ser más específico, elimina solo los que tienen género "Unknown"
/*
DELETE FROM public.artists
WHERE spotify_artist_id IS NULL 
  AND muso_ai_profile_id IS NULL
  AND (genre = 'Unknown' OR genre IS NULL);
*/

-- 4. O elimina artistas creados después de cierta fecha
/*
DELETE FROM public.artists
WHERE spotify_artist_id IS NULL 
  AND muso_ai_profile_id IS NULL
  AND created_at > '2024-01-01';
*/

-- 5. Verificar cuántos artistas quedarán
SELECT COUNT(*) as total_artists_remaining
FROM public.artists;
