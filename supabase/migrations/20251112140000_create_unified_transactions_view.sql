-- =====================================================
-- VISTA UNIFICADA DE TRANSACCIONES
-- =====================================================
-- Combina transactions (manuales) y statement_transactions (Excel)
-- en una sola vista para mostrar totales consolidados
-- =====================================================

-- Eliminar vista si existe
DROP VIEW IF EXISTS public.unified_transactions;

-- Crear vista unificada
CREATE VIEW public.unified_transactions AS
-- Transacciones manuales
SELECT 
    t.id,
    t.artist_id,
    t.amount,
    t.type,
    t.transaction_date,
    t.description,
    t.created_at,
    a.name as artist_name,
    tc.name as category_name,
    'manual' as source,
    NULL::text as statement_month
FROM public.transactions t
LEFT JOIN public.artists a ON a.id = t.artist_id
LEFT JOIN public.transaction_categories tc ON tc.id = t.category_id

UNION ALL

-- Transacciones de estados de cuenta (Excel)
SELECT 
    st.id,
    st.artist_id,
    st.amount,
    st.transaction_type as type,
    st.transaction_date,
    st.concept as description,
    st.created_at,
    a.name as artist_name,
    st.category as category_name,
    'statement' as source,
    s.statement_month
FROM public.statement_transactions st
LEFT JOIN public.artists a ON a.id = st.artist_id
LEFT JOIN public.artist_statements s ON s.id = st.statement_id
WHERE st.hidden IS NULL OR st.hidden = FALSE;

-- Comentarios
COMMENT ON VIEW public.unified_transactions IS 'Vista consolidada que combina transacciones manuales y de estados de cuenta';

-- Crear índices en las tablas base para mejorar performance
CREATE INDEX IF NOT EXISTS idx_transactions_artist_date 
ON public.transactions(artist_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_statement_transactions_artist_date 
ON public.statement_transactions(artist_id, transaction_date DESC)
WHERE hidden IS NULL OR hidden = FALSE;
