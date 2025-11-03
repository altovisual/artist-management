-- =====================================================
-- CORREGIR COLUMNAS DE PORCENTAJES
-- =====================================================
-- Las columnas de "porcentaje" en realidad contienen MONTOS
-- no porcentajes, por lo que deben ser DECIMAL(18, 2)

-- Eliminar vista primero
DROP VIEW IF EXISTS public.artist_own_statements;

-- Cambiar columnas de "porcentaje" a montos grandes
ALTER TABLE public.statement_transactions
  ALTER COLUMN country_percentage TYPE DECIMAL(18, 2),
  ALTER COLUMN commission_20_percentage TYPE DECIMAL(18, 2),
  ALTER COLUMN legal_5_percentage TYPE DECIMAL(18, 2);

-- Recrear vista
CREATE OR REPLACE VIEW public.artist_own_statements AS
SELECT 
  s.*,
  a.name as artist_name,
  a.profile_image as artist_image
FROM public.artist_statements s
JOIN public.artists a ON s.artist_id = a.id
WHERE a.user_id = auth.uid();

GRANT SELECT ON public.artist_own_statements TO authenticated;

-- Comentarios actualizados
COMMENT ON COLUMN public.statement_transactions.country_percentage IS 
  'Monto correspondiente al país (80% del total) - NO es un porcentaje';

COMMENT ON COLUMN public.statement_transactions.commission_20_percentage IS 
  'Monto de comisión (20% del total) - NO es un porcentaje';

COMMENT ON COLUMN public.statement_transactions.legal_5_percentage IS 
  'Monto legal (5% del total) - NO es un porcentaje';
