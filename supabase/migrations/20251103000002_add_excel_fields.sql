-- =====================================================
-- AGREGAR CAMPOS DEL EXCEL A LAS TRANSACCIONES
-- =====================================================
-- Campos adicionales que aparecen en el Excel de MVPX

ALTER TABLE public.statement_transactions
ADD COLUMN IF NOT EXISTS invoice_number TEXT,           -- Número de factura
ADD COLUMN IF NOT EXISTS transaction_type_code TEXT,    -- Tipo (del Excel)
ADD COLUMN IF NOT EXISTS payment_method_detail TEXT,    -- Método de Pago detallado
ADD COLUMN IF NOT EXISTS invoice_value DECIMAL(12, 2),  -- Valor de la Factura
ADD COLUMN IF NOT EXISTS bank_charges_amount DECIMAL(12, 2), -- Cargos Bancarios (monto)
ADD COLUMN IF NOT EXISTS country_percentage DECIMAL(5, 2),   -- 80% País
ADD COLUMN IF NOT EXISTS commission_20_percentage DECIMAL(5, 2), -- 20% Comisión
ADD COLUMN IF NOT EXISTS legal_5_percentage DECIMAL(5, 2),   -- 5% Legal
ADD COLUMN IF NOT EXISTS tax_retention DECIMAL(12, 2),       -- Retención de IVA
ADD COLUMN IF NOT EXISTS mvpx_payment DECIMAL(12, 2),        -- Pagado por MVPX
ADD COLUMN IF NOT EXISTS advance_amount DECIMAL(12, 2),      -- Avance
ADD COLUMN IF NOT EXISTS final_balance DECIMAL(12, 2);       -- Balance (columna final)

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_statement_transactions_invoice 
  ON public.statement_transactions(invoice_number);

CREATE INDEX IF NOT EXISTS idx_statement_transactions_type_code 
  ON public.statement_transactions(transaction_type_code);

-- Comentarios para documentación
COMMENT ON COLUMN public.statement_transactions.invoice_number IS 
  'Número de factura del Excel';

COMMENT ON COLUMN public.statement_transactions.transaction_type_code IS 
  'Código de tipo de transacción del Excel';

COMMENT ON COLUMN public.statement_transactions.payment_method_detail IS 
  'Método de pago detallado del Excel';

COMMENT ON COLUMN public.statement_transactions.invoice_value IS 
  'Valor de la factura original';

COMMENT ON COLUMN public.statement_transactions.bank_charges_amount IS 
  'Monto de cargos bancarios';

COMMENT ON COLUMN public.statement_transactions.country_percentage IS 
  'Porcentaje del país (80%)';

COMMENT ON COLUMN public.statement_transactions.commission_20_percentage IS 
  'Porcentaje de comisión (20%)';

COMMENT ON COLUMN public.statement_transactions.legal_5_percentage IS 
  'Porcentaje legal (5%)';

COMMENT ON COLUMN public.statement_transactions.tax_retention IS 
  'Retención de IVA';

COMMENT ON COLUMN public.statement_transactions.mvpx_payment IS 
  'Monto pagado por MVPX';

COMMENT ON COLUMN public.statement_transactions.advance_amount IS 
  'Monto de avance';

COMMENT ON COLUMN public.statement_transactions.final_balance IS 
  'Balance final de la transacción';
