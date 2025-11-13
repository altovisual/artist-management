-- =====================================================
-- MOSTRAR (RESTAURAR) DATOS DE ALEX NUÑEZ
-- =====================================================
-- Este script deshace la ocultación de datos de Alex Nuñez
-- =====================================================

DO $$
DECLARE
    artist_id_var UUID;
    statements_count INTEGER := 0;
    transactions_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔄 Restaurando visibilidad de datos de Alex Nuñez...';
    RAISE NOTICE '';

    -- Buscar el ID de Alex Nuñez
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

    -- Mostrar estados de cuenta
    UPDATE public.artist_statements
    SET hidden = FALSE
    WHERE artist_id = artist_id_var
    AND hidden = TRUE;
    
    GET DIAGNOSTICS statements_count = ROW_COUNT;
    RAISE NOTICE '✅ Estados de cuenta restaurados: %', statements_count;

    -- Mostrar transacciones
    UPDATE public.statement_transactions
    SET hidden = FALSE
    WHERE artist_id = artist_id_var
    AND hidden = TRUE;
    
    GET DIAGNOSTICS transactions_count = ROW_COUNT;
    RAISE NOTICE '✅ Transacciones restauradas: %', transactions_count;

    RAISE NOTICE '';
    RAISE NOTICE '✅ ¡Datos restaurados exitosamente!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Resumen:';
    RAISE NOTICE '   - Estados de cuenta restaurados: %', statements_count;
    RAISE NOTICE '   - Transacciones restauradas: %', transactions_count;
END $$;

-- Verificar resultado
SELECT 
    a.name,
    COUNT(DISTINCT st.id) as total_statements,
    COUNT(DISTINCT t.id) as total_transactions,
    COALESCE(SUM(st.balance), 0) as balance_total
FROM public.artists a
LEFT JOIN public.artist_statements st ON st.artist_id = a.id AND (st.hidden = FALSE OR st.hidden IS NULL)
LEFT JOIN public.statement_transactions t ON t.artist_id = a.id AND (t.hidden = FALSE OR t.hidden IS NULL)
WHERE a.name ILIKE '%alex%nu%' OR a.name ILIKE '%alex%nunes%'
GROUP BY a.name;
