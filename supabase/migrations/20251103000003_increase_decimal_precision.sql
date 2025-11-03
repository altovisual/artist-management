-- =====================================================
-- AUMENTAR PRECISIÓN DE CAMPOS DECIMALES
-- =====================================================
-- Soluciona el error "numeric field overflow"
-- Aumenta de DECIMAL(12, 2) a DECIMAL(18, 2)

-- Paso 1: Eliminar la vista que depende de las columnas
DROP VIEW IF EXISTS public.artist_own_statements;

-- Paso 2: Modificar columnas de artist_statements
ALTER TABLE public.artist_statements
  ALTER COLUMN total_income TYPE DECIMAL(18, 2),
  ALTER COLUMN total_expenses TYPE DECIMAL(18, 2),
  ALTER COLUMN total_advances TYPE DECIMAL(18, 2),
  ALTER COLUMN balance TYPE DECIMAL(18, 2);

-- Paso 3: Modificar columnas de statement_transactions
ALTER TABLE public.statement_transactions
  ALTER COLUMN amount TYPE DECIMAL(18, 2),
  ALTER COLUMN running_balance TYPE DECIMAL(18, 2),
  ALTER COLUMN bank_charges TYPE DECIMAL(18, 2),
  ALTER COLUMN tax_withholding TYPE DECIMAL(18, 2),
  ALTER COLUMN invoice_value TYPE DECIMAL(18, 2),
  ALTER COLUMN bank_charges_amount TYPE DECIMAL(18, 2),
  ALTER COLUMN tax_retention TYPE DECIMAL(18, 2),
  ALTER COLUMN mvpx_payment TYPE DECIMAL(18, 2),
  ALTER COLUMN advance_amount TYPE DECIMAL(18, 2),
  ALTER COLUMN final_balance TYPE DECIMAL(18, 2);

-- Paso 4: Recrear la vista
CREATE OR REPLACE VIEW public.artist_own_statements AS
SELECT 
  s.*,
  a.name as artist_name,
  a.profile_image as artist_image
FROM public.artist_statements s
JOIN public.artists a ON s.artist_id = a.id
WHERE a.user_id = auth.uid();

-- Paso 5: Restaurar permisos
GRANT SELECT ON public.artist_own_statements TO authenticated;

-- Comentario
COMMENT ON TABLE public.artist_statements IS 
  'Estados de cuenta de artistas con campos DECIMAL(18,2) para soportar valores grandes';

COMMENT ON TABLE public.statement_transactions IS 
  'Transacciones de estados de cuenta con campos DECIMAL(18,2) para soportar valores grandes';
