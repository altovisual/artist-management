-- =====================================================
-- VERIFICAR TRANSACCIONES Y ESTADOS DE CUENTA
-- =====================================================

-- 1. Ver estructura de statement_transactions
SELECT 
    '📋 Columnas de statement_transactions' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'statement_transactions'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver una muestra de transacciones
SELECT 
    '📊 Muestra de transacciones' as info,
    id,
    artist_id,
    statement_id,
    transaction_date,
    invoice_number,
    transaction_type_code,
    payment_method_detail,
    concept,
    invoice_value,
    bank_charges_amount,
    country_percentage,
    commission_20_percentage,
    legal_5_percentage,
    tax_retention,
    mvpx_payment,
    advance_amount,
    final_balance,
    created_at
FROM public.statement_transactions
ORDER BY created_at DESC
LIMIT 5;

-- 3. Contar transacciones por artista
SELECT 
    '📈 Transacciones por artista' as info,
    a.name as artista,
    COUNT(st.id) as total_transacciones,
    COUNT(st.invoice_value) as con_valor_factura,
    COUNT(st.bank_charges_amount) as con_cargos_banco,
    COUNT(st.mvpx_payment) as con_pago_mvpx
FROM public.artists a
LEFT JOIN public.statement_transactions st ON st.artist_id = a.id
GROUP BY a.id, a.name
HAVING COUNT(st.id) > 0
ORDER BY total_transacciones DESC;

-- 4. Ver estados de cuenta
SELECT 
    '📋 Estados de cuenta' as info,
    s.id,
    a.name as artista,
    s.statement_month,
    s.period_start,
    s.period_end,
    s.total_income,
    s.total_expenses,
    s.balance,
    (SELECT COUNT(*) FROM statement_transactions WHERE statement_id = s.id) as num_transacciones
FROM public.artist_statements s
JOIN public.artists a ON a.id = s.artist_id
ORDER BY s.created_at DESC
LIMIT 10;

-- 5. Verificar si hay transacciones con todos los campos NULL
SELECT 
    '⚠️  Transacciones con campos vacíos' as info,
    COUNT(*) as total_transacciones,
    COUNT(*) FILTER (WHERE invoice_value IS NULL) as sin_valor_factura,
    COUNT(*) FILTER (WHERE bank_charges_amount IS NULL) as sin_cargos_banco,
    COUNT(*) FILTER (WHERE country_percentage IS NULL) as sin_80_pais,
    COUNT(*) FILTER (WHERE commission_20_percentage IS NULL) as sin_20_comision,
    COUNT(*) FILTER (WHERE legal_5_percentage IS NULL) as sin_5_legal,
    COUNT(*) FILTER (WHERE tax_retention IS NULL) as sin_retencion_iva,
    COUNT(*) FILTER (WHERE mvpx_payment IS NULL) as sin_pago_mvpx,
    COUNT(*) FILTER (WHERE advance_amount IS NULL) as sin_avance,
    COUNT(*) FILTER (WHERE final_balance IS NULL) as sin_balance
FROM public.statement_transactions;
