-- =====================================================
-- CORREGIR TODOS LOS DUPLICADOS DE ARTISTAS
-- =====================================================
-- Este script identifica y corrige artistas duplicados
-- consolidando sus datos financieros en un solo perfil
-- =====================================================

-- PASO 1: IDENTIFICAR DUPLICADOS
-- =====================================================

DO $$
DECLARE
    rec RECORD;
    real_artist_id UUID;
    duplicate_artist_id UUID;
    statements_moved INTEGER := 0;
    transactions_moved INTEGER := 0;
    total_duplicates INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 INICIANDO CORRECCIÓN DE DUPLICADOS...';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';

    -- Buscar artistas con nombres similares (duplicados)
    FOR rec IN 
        SELECT 
            LOWER(TRIM(name)) as normalized_name,
            array_agg(id ORDER BY created_at ASC) as artist_ids,
            array_agg(name ORDER BY created_at ASC) as artist_names,
            COUNT(*) as duplicate_count
        FROM public.artists
        GROUP BY LOWER(TRIM(name))
        HAVING COUNT(*) > 1
        ORDER BY COUNT(*) DESC
    LOOP
        total_duplicates := total_duplicates + 1;
        
        RAISE NOTICE '📋 Duplicado encontrado: %', rec.normalized_name;
        RAISE NOTICE '   Cantidad de perfiles: %', rec.duplicate_count;
        RAISE NOTICE '   IDs: %', rec.artist_ids;
        RAISE NOTICE '';

        -- El primer artista (más antiguo) es el "real"
        real_artist_id := rec.artist_ids[1];
        
        RAISE NOTICE '   ✅ Perfil principal (mantener): %', real_artist_id;
        RAISE NOTICE '   🗑️  Perfiles duplicados (eliminar):';

        -- Procesar cada duplicado
        FOR i IN 2..array_length(rec.artist_ids, 1) LOOP
            duplicate_artist_id := rec.artist_ids[i];
            RAISE NOTICE '      - %', duplicate_artist_id;

            -- Mover estados de cuenta del duplicado al real
            UPDATE public.artist_statements
            SET artist_id = real_artist_id
            WHERE artist_id = duplicate_artist_id;
            
            GET DIAGNOSTICS statements_moved = ROW_COUNT;
            RAISE NOTICE '         Estados de cuenta movidos: %', statements_moved;

            -- Mover transacciones del duplicado al real
            UPDATE public.statement_transactions
            SET artist_id = real_artist_id
            WHERE artist_id = duplicate_artist_id;
            
            GET DIAGNOSTICS transactions_moved = ROW_COUNT;
            RAISE NOTICE '         Transacciones movidas: %', transactions_moved;

            -- Eliminar el perfil duplicado
            DELETE FROM public.artists
            WHERE id = duplicate_artist_id;
            
            RAISE NOTICE '         ✅ Perfil duplicado eliminado';
        END LOOP;

        RAISE NOTICE '';
        RAISE NOTICE '   ═══════════════════════════════════════════════';
        RAISE NOTICE '';
    END LOOP;

    IF total_duplicates = 0 THEN
        RAISE NOTICE '✅ No se encontraron duplicados';
    ELSE
        RAISE NOTICE '✅ PROCESO COMPLETADO';
        RAISE NOTICE '';
        RAISE NOTICE '📊 RESUMEN:';
        RAISE NOTICE '   - Grupos de duplicados corregidos: %', total_duplicates;
        RAISE NOTICE '';
    END IF;

END $$;

-- =====================================================
-- PASO 2: VERIFICAR RESULTADO
-- =====================================================

-- Ver si quedan duplicados
SELECT 
    '🔍 Duplicados restantes' as verificacion,
    LOWER(TRIM(name)) as nombre_normalizado,
    COUNT(*) as cantidad_perfiles,
    array_agg(id) as ids,
    array_agg(name) as nombres
FROM public.artists
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- Si no hay resultados, significa que no hay duplicados

-- =====================================================
-- PASO 3: MOSTRAR ARTISTAS ÚNICOS
-- =====================================================

SELECT 
    '✅ Artistas únicos después de limpieza' as descripcion,
    COUNT(DISTINCT id) as total_artistas,
    COUNT(DISTINCT LOWER(TRIM(name))) as nombres_unicos
FROM public.artists;

-- =====================================================
-- PASO 4: VERIFICAR ESTADOS DE CUENTA
-- =====================================================

SELECT 
    '📊 Estados por artista' as resumen,
    a.name as artista,
    COUNT(DISTINCT s.id) as estados_de_cuenta,
    COUNT(DISTINCT t.id) as transacciones,
    COALESCE(SUM(s.total_income), 0) as ingresos_totales,
    COALESCE(SUM(s.total_expenses), 0) as gastos_totales,
    COALESCE(SUM(s.balance), 0) as balance_total
FROM public.artists a
LEFT JOIN public.artist_statements s ON s.artist_id = a.id 
    AND (s.hidden IS NULL OR s.hidden = FALSE)
LEFT JOIN public.statement_transactions t ON t.artist_id = a.id 
    AND (t.hidden IS NULL OR t.hidden = FALSE)
GROUP BY a.id, a.name
HAVING COUNT(DISTINCT s.id) > 0
ORDER BY a.name;
