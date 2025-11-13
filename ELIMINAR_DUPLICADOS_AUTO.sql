-- =====================================================
-- SCRIPT AUTOMÁTICO: ELIMINAR DUPLICADOS Y CONSOLIDAR FINANZAS
-- =====================================================
-- Ejecuta TODO este script de una vez en Supabase SQL Editor
-- 
-- QUÉ HACE:
-- 1. Identifica artistas duplicados (mismo nombre)
-- 2. Mantiene el perfil REAL (con Spotify/Muso.AI o el más antiguo)
-- 3. Transfiere todas las finanzas al perfil real
-- 4. Elimina los duplicados
-- =====================================================

DO $$
DECLARE
    duplicados_eliminados INTEGER := 0;
    transacciones_transferidas INTEGER := 0;
    statements_transferidos INTEGER := 0;
    rec RECORD;
BEGIN
    RAISE NOTICE '🔄 Iniciando eliminación de duplicados...';
    RAISE NOTICE '';

    -- Crear tabla temporal con el mapeo
    CREATE TEMP TABLE artist_mapping AS
    WITH duplicados AS (
        SELECT 
            a.id,
            a.name,
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
        d_duplicado.name as duplicado_nombre,
        d_real.id as real_id,
        d_real.name as real_nombre,
        d_duplicado.nombre_normalizado
    FROM duplicados d_duplicado
    JOIN duplicados d_real ON d_real.nombre_normalizado = d_duplicado.nombre_normalizado 
        AND d_real.row_num = 1
    WHERE d_duplicado.row_num > 1;

    -- Contar duplicados encontrados
    SELECT COUNT(*) INTO duplicados_eliminados FROM artist_mapping;
    
    IF duplicados_eliminados = 0 THEN
        RAISE NOTICE '✅ No se encontraron artistas duplicados';
        RETURN;
    END IF;

    RAISE NOTICE '📊 Duplicados encontrados: %', duplicados_eliminados;
    RAISE NOTICE '';

    -- Mostrar qué se va a hacer
    RAISE NOTICE '📋 Artistas que se consolidarán:';
    FOR rec IN 
        SELECT duplicado_nombre, real_nombre, nombre_normalizado 
        FROM artist_mapping 
        ORDER BY nombre_normalizado
    LOOP
        RAISE NOTICE '   • % → % (consolidando)', rec.duplicado_nombre, rec.real_nombre;
    END LOOP;
    RAISE NOTICE '';

    -- Transferir statement_transactions
    RAISE NOTICE '📤 Transfiriendo transacciones...';
    UPDATE public.statement_transactions st
    SET artist_id = am.real_id
    FROM artist_mapping am
    WHERE st.artist_id = am.duplicado_id;
    
    GET DIAGNOSTICS transacciones_transferidas = ROW_COUNT;
    RAISE NOTICE '   ✅ % transacciones transferidas', transacciones_transferidas;

    -- Transferir artist_statements (consolidando si hay conflictos)
    RAISE NOTICE '📤 Transfiriendo estados de cuenta...';
    
    -- Primero, actualizar los que no tienen conflicto
    UPDATE public.artist_statements st
    SET artist_id = am.real_id
    FROM artist_mapping am
    WHERE st.artist_id = am.duplicado_id
    AND NOT EXISTS (
        SELECT 1 FROM public.artist_statements st2
        WHERE st2.artist_id = am.real_id
        AND st2.statement_month = st.statement_month
    );
    
    GET DIAGNOSTICS statements_transferidos = ROW_COUNT;
    
    -- Eliminar los que tienen conflicto (ya existen en el perfil real)
    DELETE FROM public.artist_statements st
    USING artist_mapping am
    WHERE st.artist_id = am.duplicado_id;
    
    RAISE NOTICE '   ✅ % estados de cuenta transferidos', statements_transferidos;

    -- Eliminar artistas duplicados
    RAISE NOTICE '🗑️  Eliminando duplicados...';
    DELETE FROM public.artists
    WHERE id IN (SELECT duplicado_id FROM artist_mapping);
    
    RAISE NOTICE '   ✅ % artistas duplicados eliminados', duplicados_eliminados;
    RAISE NOTICE '';
    RAISE NOTICE '✅ ¡Proceso completado exitosamente!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Resumen:';
    RAISE NOTICE '   - Duplicados eliminados: %', duplicados_eliminados;
    RAISE NOTICE '   - Transacciones transferidas: %', transacciones_transferidas;
    RAISE NOTICE '   - Estados de cuenta transferidos: %', statements_transferidos;

    -- Limpiar tabla temporal
    DROP TABLE IF EXISTS artist_mapping;
END $$;

-- Verificar que no quedan duplicados
SELECT 
    LOWER(TRIM(name)) as nombre,
    COUNT(*) as cantidad,
    STRING_AGG(name, ' | ') as variaciones
FROM public.artists
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1;

-- Si el resultado está vacío, ¡éxito! ✅

-- Ver resumen final de artistas
SELECT 
    a.name,
    CASE 
        WHEN a.spotify_artist_id IS NOT NULL THEN '✅ Spotify'
        ELSE '❌'
    END as spotify,
    CASE 
        WHEN a.muso_ai_profile_id IS NOT NULL THEN '✅ Muso.AI'
        ELSE '❌'
    END as muso,
    COUNT(DISTINCT st.id) as statements,
    COUNT(DISTINCT t.id) as transactions,
    COALESCE(SUM(st.balance), 0) as balance
FROM public.artists a
LEFT JOIN public.artist_statements st ON st.artist_id = a.id
LEFT JOIN public.statement_transactions t ON t.artist_id = a.id
GROUP BY a.id, a.name, a.spotify_artist_id, a.muso_ai_profile_id
ORDER BY a.name;
