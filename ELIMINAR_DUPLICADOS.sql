-- =====================================================
-- ELIMINAR ARTISTAS DUPLICADOS MANTENIENDO SUS FINANZAS
-- =====================================================
-- Este script identifica y elimina artistas duplicados,
-- pero MANTIENE sus transacciones y estados de cuenta
-- para vincularlos después con los perfiles reales.

-- PASO 1: Ver artistas duplicados (mismo nombre pero diferentes IDs)
SELECT 
    LOWER(TRIM(name)) as nombre_normalizado,
    COUNT(*) as cantidad,
    STRING_AGG(id::text, ', ') as ids,
    STRING_AGG(name, ' | ') as nombres_exactos
FROM public.artists
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

-- PASO 2: Ver detalles de cada duplicado
SELECT 
    a.id,
    a.name,
    a.spotify_artist_id,
    a.muso_ai_profile_id,
    a.created_at,
    COUNT(DISTINCT st.id) as total_statements,
    COUNT(DISTINCT t.id) as total_transactions,
    COALESCE(SUM(st.balance), 0) as balance_total
FROM public.artists a
LEFT JOIN public.artist_statements st ON st.artist_id = a.id
LEFT JOIN public.statement_transactions t ON t.artist_id = a.id
WHERE LOWER(TRIM(a.name)) IN (
    SELECT LOWER(TRIM(name))
    FROM public.artists
    GROUP BY LOWER(TRIM(name))
    HAVING COUNT(*) > 1
)
GROUP BY a.id, a.name, a.spotify_artist_id, a.muso_ai_profile_id, a.created_at
ORDER BY LOWER(TRIM(a.name)), a.created_at;

-- PASO 3: Identificar cuál es el perfil REAL (con Spotify o Muso.AI)
-- y cuál es el duplicado (sin conexiones)
WITH duplicados AS (
    SELECT 
        a.id,
        a.name,
        a.spotify_artist_id,
        a.muso_ai_profile_id,
        a.created_at,
        LOWER(TRIM(a.name)) as nombre_normalizado,
        ROW_NUMBER() OVER (
            PARTITION BY LOWER(TRIM(a.name)) 
            ORDER BY 
                CASE 
                    WHEN a.spotify_artist_id IS NOT NULL THEN 1
                    WHEN a.muso_ai_profile_id IS NOT NULL THEN 2
                    ELSE 3
                END,
                a.created_at ASC
        ) as row_num
    FROM public.artists a
)
SELECT 
    d.nombre_normalizado,
    d.id,
    d.name,
    CASE 
        WHEN d.row_num = 1 THEN '✅ MANTENER (Perfil Real)'
        ELSE '❌ ELIMINAR (Duplicado)'
    END as accion,
    d.spotify_artist_id,
    d.muso_ai_profile_id,
    d.created_at
FROM duplicados d
WHERE d.nombre_normalizado IN (
    SELECT nombre_normalizado
    FROM duplicados
    GROUP BY nombre_normalizado
    HAVING COUNT(*) > 1
)
ORDER BY d.nombre_normalizado, d.row_num;

-- PASO 4: TRANSFERIR finanzas de duplicados al perfil real
-- IMPORTANTE: Ejecuta esto ANTES de eliminar los duplicados

-- 4.1 Crear tabla temporal con el mapeo
CREATE TEMP TABLE IF NOT EXISTS artist_mapping AS
WITH duplicados AS (
    SELECT 
        a.id,
        LOWER(TRIM(a.name)) as nombre_normalizado,
        ROW_NUMBER() OVER (
            PARTITION BY LOWER(TRIM(a.name)) 
            ORDER BY 
                CASE 
                    WHEN a.spotify_artist_id IS NOT NULL THEN 1
                    WHEN a.muso_ai_profile_id IS NOT NULL THEN 2
                    ELSE 3
                END,
                a.created_at ASC
        ) as row_num
    FROM public.artists a
)
SELECT 
    d_duplicado.id as duplicado_id,
    d_real.id as real_id,
    d_duplicado.nombre_normalizado
FROM duplicados d_duplicado
JOIN duplicados d_real ON d_real.nombre_normalizado = d_duplicado.nombre_normalizado 
    AND d_real.row_num = 1
WHERE d_duplicado.row_num > 1;

-- 4.2 Ver el mapeo
SELECT 
    am.nombre_normalizado,
    a_dup.name as duplicado_nombre,
    a_real.name as real_nombre,
    am.duplicado_id,
    am.real_id
FROM artist_mapping am
JOIN public.artists a_dup ON a_dup.id = am.duplicado_id
JOIN public.artists a_real ON a_real.id = am.real_id
ORDER BY am.nombre_normalizado;

-- 4.3 Transferir statement_transactions
UPDATE public.statement_transactions st
SET artist_id = am.real_id
FROM artist_mapping am
WHERE st.artist_id = am.duplicado_id;

-- 4.4 Transferir artist_statements
UPDATE public.artist_statements st
SET artist_id = am.real_id
FROM artist_mapping am
WHERE st.artist_id = am.duplicado_id
ON CONFLICT (artist_id, statement_month) DO UPDATE
SET 
    total_income = EXCLUDED.total_income + artist_statements.total_income,
    total_expenses = EXCLUDED.total_expenses + artist_statements.total_expenses,
    total_advances = EXCLUDED.total_advances + artist_statements.total_advances,
    balance = EXCLUDED.balance + artist_statements.balance,
    total_transactions = EXCLUDED.total_transactions + artist_statements.total_transactions;

-- PASO 5: ELIMINAR artistas duplicados (ahora sin finanzas)
DELETE FROM public.artists
WHERE id IN (
    SELECT duplicado_id FROM artist_mapping
);

-- PASO 6: Verificar resultado
SELECT 
    LOWER(TRIM(name)) as nombre_normalizado,
    COUNT(*) as cantidad,
    STRING_AGG(name, ' | ') as nombres
FROM public.artists
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1;

-- Si el resultado está vacío, ¡no hay duplicados! ✅

-- PASO 7: Ver resumen final
SELECT 
    a.name,
    a.spotify_artist_id IS NOT NULL as tiene_spotify,
    a.muso_ai_profile_id IS NOT NULL as tiene_muso,
    COUNT(DISTINCT st.id) as total_statements,
    COUNT(DISTINCT t.id) as total_transactions,
    COALESCE(SUM(st.balance), 0) as balance_total
FROM public.artists a
LEFT JOIN public.artist_statements st ON st.artist_id = a.id
LEFT JOIN public.statement_transactions t ON t.artist_id = a.id
GROUP BY a.id, a.name, a.spotify_artist_id, a.muso_ai_profile_id
ORDER BY a.name;

-- Limpiar tabla temporal
DROP TABLE IF EXISTS artist_mapping;
