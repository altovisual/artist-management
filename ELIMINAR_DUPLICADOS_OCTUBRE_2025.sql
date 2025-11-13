-- =====================================================
-- ELIMINAR ARTISTAS DUPLICADOS DE OCTUBRE 2025
-- =====================================================
-- Este script elimina los artistas duplicados creados
-- en octubre de 2025, manteniendo los originales
-- =====================================================

DO $$
DECLARE
    rec RECORD;
    duplicate_id UUID;
    original_id UUID;
    statements_moved INTEGER := 0;
    transactions_moved INTEGER := 0;
    total_deleted INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 ELIMINANDO DUPLICADOS DE OCTUBRE 2025...';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';

    -- Buscar duplicados donde hay uno de octubre 2025 y otro más antiguo
    FOR rec IN 
        SELECT 
            LOWER(TRIM(name)) as normalized_name,
            array_agg(id ORDER BY created_at ASC) as artist_ids,
            array_agg(name ORDER BY created_at ASC) as artist_names,
            array_agg(created_at ORDER BY created_at ASC) as created_dates,
            COUNT(*) as duplicate_count
        FROM public.artists
        GROUP BY LOWER(TRIM(name))
        HAVING COUNT(*) > 1
        AND EXISTS (
            -- Al menos uno creado en octubre 2025
            SELECT 1 FROM unnest(array_agg(created_at)) as d 
            WHERE d >= '2025-10-01' AND d < '2025-11-01'
        )
        ORDER BY normalized_name
    LOOP
        RAISE NOTICE '📋 Procesando: %', rec.normalized_name;
        RAISE NOTICE '   Total de perfiles: %', rec.duplicate_count;
        
        -- El primer artista (más antiguo) es el original
        original_id := rec.artist_ids[1];
        
        RAISE NOTICE '   ✅ Perfil original (mantener): % - Creado: %', 
            original_id, rec.created_dates[1];
        RAISE NOTICE '   🗑️  Duplicados de octubre 2025 (eliminar):';

        -- Procesar cada duplicado de octubre 2025
        FOR i IN 2..array_length(rec.artist_ids, 1) LOOP
            duplicate_id := rec.artist_ids[i];
            
            -- Solo eliminar si fue creado en octubre 2025
            IF rec.created_dates[i] >= '2025-10-01' AND rec.created_dates[i] < '2025-11-01' THEN
                RAISE NOTICE '      - % - Creado: %', duplicate_id, rec.created_dates[i];

                -- ELIMINAR estados de cuenta del duplicado (NO mover)
                DELETE FROM public.artist_statements
                WHERE artist_id = duplicate_id;
                
                GET DIAGNOSTICS statements_moved = ROW_COUNT;
                RAISE NOTICE '         Estados de cuenta eliminados: %', statements_moved;

                -- ELIMINAR transacciones del duplicado (NO mover)
                DELETE FROM public.statement_transactions
                WHERE artist_id = duplicate_id;
                
                GET DIAGNOSTICS transactions_moved = ROW_COUNT;
                RAISE NOTICE '         Transacciones eliminadas: %', transactions_moved;

                -- Eliminar el perfil duplicado de octubre 2025
                DELETE FROM public.artists
                WHERE id = duplicate_id;
                
                total_deleted := total_deleted + 1;
                RAISE NOTICE '         ✅ Perfil y datos duplicados eliminados completamente';
            ELSE
                RAISE NOTICE '      - % - Creado: % (NO es de octubre 2025, se mantiene)', 
                    duplicate_id, rec.created_dates[i];
            END IF;
        END LOOP;

        RAISE NOTICE '';
        RAISE NOTICE '   ═══════════════════════════════════════════════';
        RAISE NOTICE '';
    END LOOP;

    IF total_deleted = 0 THEN
        RAISE NOTICE '✅ No se encontraron duplicados de octubre 2025';
    ELSE
        RAISE NOTICE '✅ PROCESO COMPLETADO';
        RAISE NOTICE '';
        RAISE NOTICE '📊 RESUMEN:';
        RAISE NOTICE '   - Perfiles duplicados eliminados: %', total_deleted;
        RAISE NOTICE '';
    END IF;

END $$;

-- =====================================================
-- VERIFICAR RESULTADO
-- =====================================================

-- Ver si quedan duplicados
SELECT 
    '🔍 Duplicados restantes' as verificacion,
    LOWER(TRIM(name)) as nombre_normalizado,
    COUNT(*) as cantidad_perfiles,
    array_agg(id ORDER BY created_at) as ids,
    array_agg(created_at ORDER BY created_at) as fechas_creacion
FROM public.artists
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- Ver artistas únicos
SELECT 
    '✅ Resumen después de limpieza' as descripcion,
    COUNT(DISTINCT id) as total_artistas,
    COUNT(DISTINCT LOWER(TRIM(name))) as nombres_unicos,
    COUNT(*) FILTER (WHERE created_at >= '2025-10-01' AND created_at < '2025-11-01') as creados_octubre_2025
FROM public.artists;

-- Ver estados de cuenta por artista
SELECT 
    '📊 Estados de cuenta consolidados' as resumen,
    a.name as artista,
    a.created_at as fecha_creacion_artista,
    COUNT(DISTINCT s.id) as estados_de_cuenta,
    array_agg(DISTINCT s.statement_month ORDER BY s.statement_month) as meses
FROM public.artists a
LEFT JOIN public.artist_statements s ON s.artist_id = a.id 
    AND (s.hidden IS NULL OR s.hidden = FALSE)
GROUP BY a.id, a.name, a.created_at
HAVING COUNT(DISTINCT s.id) > 0
ORDER BY a.name;
