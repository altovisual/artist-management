-- =====================================================
-- EXCLUIR ALEX NUÑEZ DE ESTADOS DE CUENTA
-- =====================================================
-- Este script oculta permanentemente a Alex Nuñez
-- de todos los cálculos y vistas
-- =====================================================

DO $$
DECLARE
    alex_artist_id UUID;
    statements_count INTEGER := 0;
    transactions_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔄 Ocultando Alex Nuñez de estados de cuenta...';
    RAISE NOTICE '';

    -- 1. Buscar el ID de Alex Nuñez
    SELECT id INTO alex_artist_id
    FROM public.artists 
    WHERE name ILIKE '%alex%nu%' 
       OR name ILIKE '%alex%nunes%'
       OR name ILIKE '%alex nuñez%'
    LIMIT 1;

    IF alex_artist_id IS NULL THEN
        RAISE NOTICE '❌ No se encontró Alex Nuñez';
        RETURN;
    END IF;

    RAISE NOTICE '📋 Alex Nuñez encontrado: %', alex_artist_id;
    RAISE NOTICE '';

    -- 2. Agregar columnas hidden si no existen
    BEGIN
        ALTER TABLE public.artist_statements 
        ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Columna hidden ya existe en artist_statements';
    END;

    BEGIN
        ALTER TABLE public.statement_transactions 
        ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Columna hidden ya existe en statement_transactions';
    END;

    -- 3. Ocultar estados de cuenta de Alex Nuñez
    UPDATE public.artist_statements
    SET hidden = TRUE
    WHERE artist_id = alex_artist_id
    AND (hidden = FALSE OR hidden IS NULL);
    
    GET DIAGNOSTICS statements_count = ROW_COUNT;
    RAISE NOTICE '✅ Estados de cuenta ocultados: %', statements_count;

    -- 4. Ocultar transacciones de Alex Nuñez
    UPDATE public.statement_transactions
    SET hidden = TRUE
    WHERE artist_id = alex_artist_id
    AND (hidden = FALSE OR hidden IS NULL);
    
    GET DIAGNOSTICS transactions_count = ROW_COUNT;
    RAISE NOTICE '✅ Transacciones ocultadas: %', transactions_count;

    RAISE NOTICE '';
    RAISE NOTICE '✅ ¡Alex Nuñez excluido exitosamente!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Resumen:';
    RAISE NOTICE '   - Estados de cuenta ocultados: %', statements_count;
    RAISE NOTICE '   - Transacciones ocultadas: %', transactions_count;
END $$;

-- Verificar que Alex Nuñez está oculto
SELECT 
    'Verificación' as tipo,
    COUNT(*) FILTER (WHERE hidden = TRUE) as ocultos,
    COUNT(*) FILTER (WHERE hidden = FALSE OR hidden IS NULL) as visibles
FROM public.artist_statements
WHERE artist_id IN (
    SELECT id FROM public.artists 
    WHERE name ILIKE '%alex%nu%' 
       OR name ILIKE '%alex%nunes%'
       OR name ILIKE '%alex nuñez%'
);

-- Ver totales SIN Alex Nuñez
SELECT 
    'Totales SIN Alex Nuñez' as descripcion,
    COALESCE(SUM(total_income), 0) as ingresos_totales,
    COALESCE(SUM(total_expenses), 0) as gastos_totales,
    COALESCE(SUM(total_advances), 0) as avances_totales,
    COALESCE(SUM(balance), 0) as balance_total
FROM public.artist_statements
WHERE (hidden IS NULL OR hidden = FALSE);
