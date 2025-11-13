-- Script para restaurar el artista Cesar Da Gold
-- EJECUTA ESTO EN SUPABASE SQL EDITOR

-- 1. Verificar si el artista existe
SELECT * FROM public.artists WHERE name ILIKE '%cesar%gold%';

-- 2. Recrear el artista (ejecuta solo si NO existe)
INSERT INTO public.artists (
    name,
    genre,
    bio,
    country,
    created_at,
    updated_at
)
VALUES (
    'Cesar Da Gold',
    'Unknown',
    'Artist profile',
    'US',
    NOW(),
    NOW()
)
RETURNING *;

-- 3. Verificar que se creó correctamente
SELECT * FROM public.artists WHERE name = 'Cesar Da Gold';
