-- Script completo para restaurar Cesar Da Gold con transacciones y estados de cuenta
-- EJECUTA ESTO EN SUPABASE SQL EDITOR

-- PASO 1: Buscar transacciones huérfanas que puedan ser de Cesar Da Gold
SELECT 
    t.id,
    t.artist_name,
    t.amount,
    t.transaction_type,
    t.date,
    t.description,
    t.artist_id
FROM public.transactions t
WHERE t.artist_name ILIKE '%cesar%gold%'
   OR t.artist_name ILIKE '%cesar da gold%'
ORDER BY t.date DESC;

-- PASO 2: Buscar estados de cuenta relacionados
SELECT 
    s.id,
    s.artist_name,
    s.period_start,
    s.period_end,
    s.total_income,
    s.total_expenses,
    s.balance,
    s.artist_id
FROM public.statements s
WHERE s.artist_name ILIKE '%cesar%gold%'
   OR s.artist_name ILIKE '%cesar da gold%'
ORDER BY s.period_start DESC;

-- PASO 3: Crear el artista Cesar Da Gold
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
RETURNING id, name;

-- PASO 4: Obtener el ID del artista recién creado
-- (Copia el ID que te devuelve el PASO 3 y úsalo en los siguientes pasos)

-- PASO 5: Actualizar transacciones huérfanas con el nuevo artist_id
-- REEMPLAZA 'NUEVO_ARTIST_ID' con el ID del PASO 3
/*
UPDATE public.transactions
SET artist_id = 'NUEVO_ARTIST_ID'
WHERE artist_name ILIKE '%cesar%gold%'
   OR artist_name ILIKE '%cesar da gold%';
*/

-- PASO 6: Actualizar estados de cuenta con el nuevo artist_id
-- REEMPLAZA 'NUEVO_ARTIST_ID' con el ID del PASO 3
/*
UPDATE public.statements
SET artist_id = 'NUEVO_ARTIST_ID'
WHERE artist_name ILIKE '%cesar%gold%'
   OR artist_name ILIKE '%cesar da gold%';
*/

-- PASO 7: Verificar que todo se vinculó correctamente
/*
SELECT 
    a.name as artist_name,
    COUNT(DISTINCT t.id) as total_transactions,
    COUNT(DISTINCT s.id) as total_statements,
    COALESCE(SUM(t.amount), 0) as total_amount
FROM public.artists a
LEFT JOIN public.transactions t ON t.artist_id = a.id
LEFT JOIN public.statements s ON s.artist_id = a.id
WHERE a.name = 'Cesar Da Gold'
GROUP BY a.name;
*/

-- PASO 8: Ver detalle completo del artista restaurado
/*
SELECT * FROM public.artists WHERE name = 'Cesar Da Gold';
SELECT * FROM public.transactions WHERE artist_id = 'NUEVO_ARTIST_ID' ORDER BY date DESC;
SELECT * FROM public.statements WHERE artist_id = 'NUEVO_ARTIST_ID' ORDER BY period_start DESC;
*/
