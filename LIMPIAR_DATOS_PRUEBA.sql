-- =====================================================
-- LIMPIAR TRANSACCIONES DE PRUEBA
-- =====================================================
-- Este script elimina las transacciones de prueba
-- y deja solo las importadas del Excel

-- Ver cuántas transacciones hay actualmente
SELECT 
  'Transacciones actuales' as tipo,
  COUNT(*) as total
FROM transactions;

-- Ver transacciones de prueba (las que no tienen artist_id válido o son de prueba)
SELECT 
  'Transacciones de prueba' as tipo,
  COUNT(*) as total
FROM transactions
WHERE description = '—' OR description IS NULL OR description = '';

-- =====================================================
-- OPCIÓN 1: ELIMINAR TODAS LAS TRANSACCIONES ANTIGUAS
-- =====================================================
-- Ejecuta esto si quieres eliminar TODAS las transacciones
-- de la tabla 'transactions' (la tabla antigua)

-- DELETE FROM transactions;

-- =====================================================
-- OPCIÓN 2: ELIMINAR SOLO TRANSACCIONES DE PRUEBA
-- =====================================================
-- Ejecuta esto si quieres eliminar solo las de prueba

DELETE FROM transactions
WHERE description = '—' 
   OR description IS NULL 
   OR description = ''
   OR amount IN (2000, 65500, 2334, 10560, 23455, 2500); -- Montos de prueba de la imagen

-- =====================================================
-- VERIFICAR RESULTADO
-- =====================================================

-- Ver cuántas quedaron
SELECT 
  'Transacciones después de limpiar' as tipo,
  COUNT(*) as total
FROM transactions;

-- Ver las que quedaron
SELECT 
  date,
  artist,
  category,
  description,
  amount
FROM transactions
ORDER BY date DESC
LIMIT 10;

-- =====================================================
-- NOTA IMPORTANTE
-- =====================================================
-- Las transacciones del Excel están en las tablas:
-- - artist_statements
-- - statement_transactions
-- 
-- La tabla 'transactions' es diferente y puede ser
-- eliminada completamente si solo usarás los estados
-- de cuenta del Excel.
