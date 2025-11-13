-- =====================================================
-- VERIFICAR DUPLICADOS ESPECÍFICOS
-- =====================================================
-- Verifica si hay duplicados de artistas específicos
-- visibles en la captura de pantalla
-- =====================================================

-- 1. Buscar todos los artistas con nombres similares
SELECT 
    'Búsqueda de duplicados' as tipo,
    id,
    name,
    created_at,
    user_id,
    (SELECT COUNT(*) FROM public.artist_statements WHERE artist_id = a.id) as estados_cuenta,
    (SELECT COUNT(*) FROM public.statement_transactions WHERE artist_id = a.id) as transacciones
FROM public.artists a
WHERE 
    LOWER(name) LIKE '%lanalizer%' OR
    LOWER(name) LIKE '%mozart%' OR
    LOWER(name) LIKE '%ecby%' OR
    LOWER(name) LIKE '%cesar%' OR
    LOWER(name) LIKE '%gold%'
ORDER BY name, created_at;

-- 2. Buscar duplicados exactos por nombre
SELECT 
    'Duplicados exactos' as tipo,
    name,
    COUNT(*) as cantidad,
    array_agg(id ORDER BY created_at) as ids,
    array_agg(created_at ORDER BY created_at) as fechas_creacion
FROM public.artists
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 3. Buscar duplicados por nombre normalizado (sin espacios, minúsculas)
SELECT 
    'Duplicados normalizados' as tipo,
    LOWER(TRIM(name)) as nombre_normalizado,
    COUNT(*) as cantidad,
    array_agg(name) as nombres_originales,
    array_agg(id ORDER BY created_at) as ids
FROM public.artists
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 4. Ver estados de cuenta por artista
SELECT 
    a.name as artista,
    s.statement_month as mes,
    s.total_income as ingresos,
    s.total_expenses as gastos,
    s.balance,
    s.hidden,
    a.id as artist_id
FROM public.artists a
JOIN public.artist_statements s ON s.artist_id = a.id
WHERE 
    LOWER(a.name) LIKE '%lanalizer%' OR
    LOWER(a.name) LIKE '%mozart%' OR
    LOWER(a.name) LIKE '%ecby%' OR
    LOWER(a.name) LIKE '%cesar%'
ORDER BY a.name, s.statement_month DESC;

-- 5. Contar total de artistas y estados
SELECT 
    'Resumen general' as tipo,
    (SELECT COUNT(*) FROM public.artists) as total_artistas,
    (SELECT COUNT(DISTINCT name) FROM public.artists) as nombres_unicos,
    (SELECT COUNT(*) FROM public.artist_statements WHERE hidden IS NULL OR hidden = FALSE) as estados_visibles,
    (SELECT COUNT(*) FROM public.artist_statements WHERE hidden = TRUE) as estados_ocultos;

-- 6. Ver artistas sin estados de cuenta
SELECT 
    'Artistas sin estados' as tipo,
    a.id,
    a.name,
    a.created_at
FROM public.artists a
LEFT JOIN public.artist_statements s ON s.artist_id = a.id
WHERE s.id IS NULL
ORDER BY a.created_at DESC;
