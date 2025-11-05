-- Limpiar todos los estados de cuenta para reimportación
-- Created: 2025-11-05

DO $$
DECLARE
  deleted_transactions INT := 0;
  deleted_statements INT := 0;
BEGIN
  RAISE NOTICE '🧹 Iniciando limpieza de estados de cuenta...';

  -- Eliminar todas las transacciones de estados de cuenta
  DELETE FROM statement_transactions;
  GET DIAGNOSTICS deleted_transactions = ROW_COUNT;
  RAISE NOTICE '🗑️  Eliminadas % transacciones de estados de cuenta', deleted_transactions;

  -- Eliminar todos los estados de cuenta
  DELETE FROM artist_statements;
  GET DIAGNOSTICS deleted_statements = ROW_COUNT;
  RAISE NOTICE '🗑️  Eliminados % estados de cuenta', deleted_statements;

  RAISE NOTICE '✅ Limpieza completada exitosamente';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Resumen:';
  RAISE NOTICE '   - Transacciones eliminadas: %', deleted_transactions;
  RAISE NOTICE '   - Estados eliminados: %', deleted_statements;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Sistema listo para reimportación';
END $$;
