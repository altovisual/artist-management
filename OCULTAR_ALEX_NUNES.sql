-- =====================================================
-- OCULTAR TRANSACCIONES Y ESTADOS DE CUENTA DE ALEX NUÑEZ
-- =====================================================
-- EJECUTA TODO ESTE SCRIPT EN SUPABASE SQL EDITOR
-- =====================================================

DO $$
DECLARE
    artist_id_var UUID;
    statements_count INTEGER := 0;
    transactions_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔄 Iniciando ocultación de datos de Alex Nuñez...';
    RAISE NOTICE '';

    -- 1. Agregar columnas hidden si no existen
    ALTER TABLE public.artist_statements 
    ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;

    ALTER TABLE public.statement_transactions 
    ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;

    RAISE NOTICE '✅ Columnas hidden verificadas';

    -- 2. Buscar el ID de Alex Nuñez
    SELECT id INTO artist_id_var
    FROM public.artists 
    WHERE name ILIKE '%alex%nu%' OR name ILIKE '%alex%nunes%'
    LIMIT 1;

    IF artist_id_var IS NULL THEN
        RAISE NOTICE '❌ No se encontró el artista Alex Nuñez';
        RETURN;
    END IF;

    RAISE NOTICE '📋 Artista encontrado: %', artist_id_var;
    RAISE NOTICE '';

    -- 3. Ocultar estados de cuenta
    UPDATE public.artist_statements
    SET hidden = TRUE
    WHERE artist_id = artist_id_var
    AND (hidden = FALSE OR hidden IS NULL);
    
    GET DIAGNOSTICS statements_count = ROW_COUNT;
    RAISE NOTICE '✅ Estados de cuenta ocultados: %', statements_count;

    -- 4. Ocultar transacciones
    UPDATE public.statement_transactions
    SET hidden = TRUE
    WHERE artist_id = artist_id_var
    AND (hidden = FALSE OR hidden IS NULL);
    
    GET DIAGNOSTICS transactions_count = ROW_COUNT;
    RAISE NOTICE '✅ Transacciones ocultadas: %', transactions_count;

    RAISE NOTICE '';
    RAISE NOTICE '✅ ¡Proceso completado!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Resumen:';
    RAISE NOTICE '   - Estados de cuenta ocultados: %', statements_count;
    RAISE NOTICE '   - Transacciones ocultadas: %', transactions_count;
    RAISE NOTICE '';
    RAISE NOTICE '💡 Los datos NO fueron eliminados, solo ocultados.';
    RAISE NOTICE '💡 Para mostrarlos de nuevo, ejecuta el script de restauración.';
END $$;

-- Verificar resultado
SELECT 
    a.name,
    COUNT(DISTINCT st.id) FILTER (WHERE st.hidden = TRUE) as statements_ocultos,
    COUNT(DISTINCT st.id) FILTER (WHERE st.hidden = FALSE OR st.hidden IS NULL) as statements_visibles,
    COUNT(DISTINCT t.id) FILTER (WHERE t.hidden = TRUE) as transacciones_ocultas,
    COUNT(DISTINCT t.id) FILTER (WHERE t.hidden = FALSE OR t.hidden IS NULL) as transacciones_visibles
FROM public.artists a
LEFT JOIN public.artist_statements st ON st.artist_id = a.id
LEFT JOIN public.statement_transactions t ON t.artist_id = a.id
WHERE a.name ILIKE '%alex%nu%' OR a.name ILIKE '%alex%nunes%'
GROUP BY a.name;
