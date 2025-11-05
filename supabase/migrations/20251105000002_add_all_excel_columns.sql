-- Agregar todas las columnas del Excel a statement_transactions
-- Para mantener transparencia total con el archivo Estados_de_Cuenta.xlsx
-- Created: 2025-11-05

-- Verificar si las columnas ya existen antes de agregarlas
DO $$
BEGIN
  -- Columnas que ya existen:
  -- transaction_date, invoice_number, transaction_type_code, payment_method_detail
  -- concept, invoice_value, bank_charges_amount, country_percentage
  -- commission_20_percentage, legal_5_percentage, tax_retention
  -- mvpx_payment, advance_amount, final_balance

  -- Agregar columna para "Nombre" (columna 4 del Excel)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'statement_transactions' AND column_name = 'name_field'
  ) THEN
    ALTER TABLE statement_transactions ADD COLUMN name_field TEXT;
    RAISE NOTICE '✅ Agregada columna: name_field';
  END IF;

  -- Agregar columna para "50% Fee" (columna 8 del Excel)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'statement_transactions' AND column_name = 'fee_50_percentage'
  ) THEN
    ALTER TABLE statement_transactions ADD COLUMN fee_50_percentage DECIMAL(15, 2);
    RAISE NOTICE '✅ Agregada columna: fee_50_percentage';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Estructura de tabla actualizada para reflejar Excel completo';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Columnas disponibles:';
  RAISE NOTICE '   1. transaction_date (Fecha)';
  RAISE NOTICE '   2. invoice_number (Número)';
  RAISE NOTICE '   3. transaction_type_code (Tipo)';
  RAISE NOTICE '   4. payment_method_detail (Método de pago)';
  RAISE NOTICE '   5. name_field (Nombre)';
  RAISE NOTICE '   6. concept (Concepto)';
  RAISE NOTICE '   7. invoice_value (Valor de la Factura)';
  RAISE NOTICE '   8. bank_charges_amount (Cargos Bancarios)';
  RAISE NOTICE '   9. fee_50_percentage (50%% Fee)';
  RAISE NOTICE '  10. commission_20_percentage (20%% Comisión)';
  RAISE NOTICE '  11. legal_5_percentage (5%% Legal)';
  RAISE NOTICE '  12. tax_retention (Retención de Impuestos)';
  RAISE NOTICE '  13. mvpx_payment (Pagado por MVPX)';
  RAISE NOTICE '  14. advance_amount (Avance)';
  RAISE NOTICE '  15. final_balance (Balance)';
END $$;

-- Agregar comentarios para documentación
COMMENT ON COLUMN statement_transactions.name_field IS 'Columna "Nombre" del Excel (columna 4)';
COMMENT ON COLUMN statement_transactions.fee_50_percentage IS 'Columna "50% Fee" del Excel (columna 8)';
COMMENT ON COLUMN statement_transactions.country_percentage IS 'Columna "80% País" del Excel (puede estar vacía)';
