-- =====================================================
-- VERIFICAR DISCREPANCIA EN LOS NÚMEROS
-- =====================================================
-- Este script compara los datos en diferentes tablas
-- para identificar por qué no concuerdan los números
-- =====================================================

-- 1. Ver totales en la tabla TRANSACTIONS (usada en Finance page)
SELECT 
    'TRANSACTIONS (Finance Page)' as fuente,
    COUNT(*) as total_registros,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_ingresos,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_gastos,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as balance_neto
FROM public.transactions;

-- 2. Ver totales en STATEMENT_TRANSACTIONS (datos del Excel)
SELECT 
    'STATEMENT_TRANSACTIONS (Excel Import)' as fuente,
    COUNT(*) as total_registros,
    COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_ingresos,
    COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_gastos,
    COALESCE(SUM(CASE WHEN transaction_type = 'advance' THEN amount ELSE 0 END), 0) as total_avances,
    COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN transaction_type = 'advance' THEN amount ELSE 0 END), 0) as balance_neto
FROM public.statement_transactions
WHERE hidden IS NULL OR hidden = FALSE;

-- 3. Ver totales en ARTIST_STATEMENTS (resúmenes)
SELECT 
    'ARTIST_STATEMENTS (Resúmenes)' as fuente,
    COUNT(*) as total_statements,
    COALESCE(SUM(total_income), 0) as total_ingresos,
    COALESCE(SUM(total_expenses), 0) as total_gastos,
    COALESCE(SUM(total_advances), 0) as total_avances,
    COALESCE(SUM(balance), 0) as balance_neto
FROM public.artist_statements
WHERE hidden IS NULL OR hidden = FALSE;

-- 4. Comparación por artista
SELECT 
    a.name as artista,
    
    -- Datos de TRANSACTIONS
    COUNT(DISTINCT t.id) as trans_count,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as trans_ingresos,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as trans_gastos,
    
    -- Datos de STATEMENT_TRANSACTIONS
    COUNT(DISTINCT st.id) as statement_trans_count,
    COALESCE(SUM(CASE WHEN st.transaction_type = 'income' THEN st.amount ELSE 0 END), 0) as statement_ingresos,
    COALESCE(SUM(CASE WHEN st.transaction_type = 'expense' THEN st.amount ELSE 0 END), 0) as statement_gastos,
    COALESCE(SUM(CASE WHEN st.transaction_type = 'advance' THEN st.amount ELSE 0 END), 0) as statement_avances,
    
    -- Diferencias
    COUNT(DISTINCT st.id) - COUNT(DISTINCT t.id) as diferencia_registros
FROM public.artists a
LEFT JOIN public.transactions t ON t.artist_id = a.id
LEFT JOIN public.statement_transactions st ON st.artist_id = a.id 
    AND (st.hidden IS NULL OR st.hidden = FALSE)
GROUP BY a.id, a.name
ORDER BY diferencia_registros DESC;

-- 5. Ver qué tabla tiene más datos
SELECT 
    'Resumen' as tipo,
    (SELECT COUNT(*) FROM public.transactions) as transactions_count,
    (SELECT COUNT(*) FROM public.statement_transactions WHERE hidden IS NULL OR hidden = FALSE) as statement_transactions_count,
    (SELECT COUNT(*) FROM public.artist_statements WHERE hidden IS NULL OR hidden = FALSE) as artist_statements_count;

-- 6. Ver artistas con datos solo en STATEMENT_TRANSACTIONS
SELECT 
    a.name,
    COUNT(DISTINCT st.id) as transacciones_en_statements,
    COUNT(DISTINCT t.id) as transacciones_en_transactions,
    COALESCE(SUM(st.amount), 0) as total_en_statements
FROM public.artists a
LEFT JOIN public.statement_transactions st ON st.artist_id = a.id 
    AND (st.hidden IS NULL OR st.hidden = FALSE)
LEFT JOIN public.transactions t ON t.artist_id = a.id
WHERE st.id IS NOT NULL
GROUP BY a.id, a.name
HAVING COUNT(DISTINCT t.id) = 0
ORDER BY total_en_statements DESC;
