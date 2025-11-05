-- Verificar datos de JayRozz

-- 1. Encontrar el artista
SELECT id, name FROM artists WHERE name ILIKE '%rozz%' OR name ILIKE '%jay%';

-- 2. Ver el estado de cuenta
SELECT 
  id,
  artist_id,
  statement_month,
  period_start,
  period_end,
  total_income,
  total_expenses,
  total_advances,
  balance,
  total_transactions
FROM artist_statements 
WHERE artist_id IN (SELECT id FROM artists WHERE name ILIKE '%rozz%');

-- 3. Ver las transacciones
SELECT 
  transaction_date,
  concept,
  amount,
  transaction_type,
  category,
  running_balance
FROM statement_transactions
WHERE artist_id IN (SELECT id FROM artists WHERE name ILIKE '%rozz%')
ORDER BY transaction_date;

-- 4. Sumar manualmente las transacciones
SELECT 
  transaction_type,
  COUNT(*) as cantidad,
  SUM(amount) as total
FROM statement_transactions
WHERE artist_id IN (SELECT id FROM artists WHERE name ILIKE '%rozz%')
GROUP BY transaction_type;
