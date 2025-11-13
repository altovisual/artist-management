-- =====================================================
-- LIMPIAR TODAS LAS TRANSACCIONES Y ESTADOS DE CUENTA
-- =====================================================
-- ⚠️ ADVERTENCIA: Este script elimina TODOS los datos
-- financieros para empezar de nuevo
-- =====================================================

DO $$
DECLARE
    statements_count INTEGER := 0;
    transactions_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🗑️  INICIANDO LIMPIEZA COMPLETA...';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ADVERTENCIA: Se eliminarán TODOS los datos financieros';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';

    -- 1. Eliminar TODAS las transacciones de estados de cuenta
    DELETE FROM public.statement_transactions;
    GET DIAGNOSTICS transactions_count = ROW_COUNT;
    RAISE NOTICE '✅ Transacciones eliminadas: %', transactions_count;

    -- 2. Eliminar TODOS los estados de cuenta
    DELETE FROM public.artist_statements;
    GET DIAGNOSTICS statements_count = ROW_COUNT;
    RAISE NOTICE '✅ Estados de cuenta eliminados: %', statements_count;

    -- 3. Eliminar TODAS las transacciones manuales (opcional)
    -- Descomenta la siguiente línea si también quieres eliminar transacciones manuales
    -- DELETE FROM public.transactions;

    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ LIMPIEZA COMPLETADA';
    RAISE NOTICE '';
    RAISE NOTICE '📊 RESUMEN:';
    RAISE NOTICE '   - Estados de cuenta eliminados: %', statements_count;
    RAISE NOTICE '   - Transacciones eliminadas: %', transactions_count;
    RAISE NOTICE '';
    RAISE NOTICE '💡 Los artistas NO fueron eliminados';
    RAISE NOTICE '💡 Puedes importar el Excel de nuevo para restaurar datos';
    RAISE NOTICE '';

END $$;

-- =====================================================
-- VERIFICAR RESULTADO
-- =====================================================

-- Verificar que todo está vacío
SELECT 
    '🔍 Verificación de limpieza' as tipo,
    (SELECT COUNT(*) FROM public.artist_statements) as estados_restantes,
    (SELECT COUNT(*) FROM public.statement_transactions) as transacciones_restantes,
    (SELECT COUNT(*) FROM public.artists) as artistas_restantes;

-- Ver artistas sin datos financieros
SELECT 
    '📋 Artistas disponibles (sin datos financieros)' as tipo,
    id,
    name,
    created_at
FROM public.artists
ORDER BY name;
