-- Script AUTOMÁTICO para restaurar Cesar Da Gold
-- EJECUTA TODO ESTE SCRIPT DE UNA VEZ EN SUPABASE SQL EDITOR

-- NOTA: Como el artista fue eliminado con CASCADE, 
-- todas sus transacciones y estados de cuenta también se eliminaron.
-- Este script solo crea el artista nuevamente.

-- 1. Crear el artista
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
RETURNING id, name, created_at;

-- 2. Verificar que se creó correctamente
SELECT * FROM public.artists WHERE name = 'Cesar Da Gold';
