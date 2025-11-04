-- Distribute transactions across all artists
-- This migration creates sample transactions for artists that don't have any

DO $$
DECLARE
  artist_record RECORD;
  statement_id uuid;
  transaction_count int;
BEGIN
  -- Loop through all artists
  FOR artist_record IN 
    SELECT a.id, a.name 
    FROM artists a
    LEFT JOIN artist_statements aos ON a.id = aos.artist_id AND aos.statement_month = '2024-11'
    WHERE aos.id IS NULL
  LOOP
    RAISE NOTICE 'Creating transactions for artist: %', artist_record.name;
    
    -- Create artist_statement for November 2024 (skip if already exists)
    INSERT INTO artist_statements (
      artist_id, 
      period_start, 
      period_end, 
      statement_month,
      legal_name
    )
    VALUES (
      artist_record.id, 
      '2024-11-01', 
      '2024-11-30',
      '2024-11',
      artist_record.name
    )
    ON CONFLICT (artist_id, statement_month) DO NOTHING
    RETURNING id INTO statement_id;
    
    -- Skip if statement already existed
    IF statement_id IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Insert sample income transactions with real categories
    INSERT INTO statement_transactions (statement_id, artist_id, transaction_date, concept, amount, transaction_type, category, payment_method)
    VALUES 
      (statement_id, artist_record.id, CURRENT_DATE - INTERVAL '10 days', 'Pasajes Medellin Florida', 1500.00 + (RANDOM() * 1000), 'income', 'Factura', 'Transferencia'),
      (statement_id, artist_record.id, CURRENT_DATE - INTERVAL '8 days', 'Madrid Ibiza', 800.00 + (RANDOM() * 500), 'income', 'Factura', 'Transferencia'),
      (statement_id, artist_record.id, CURRENT_DATE - INTERVAL '5 days', 'Neumann U 87 Ai Set Z', 300.00 + (RANDOM() * 200), 'income', 'Factura', 'Efectivo'),
      (statement_id, artist_record.id, CURRENT_DATE - INTERVAL '15 days', 'Pago de Madrid a Caracas Ven Z boletos', 2000.00 + (RANDOM() * 1500), 'income', 'Factura', 'Transferencia');
    
    -- Insert sample expense transactions with real categories
    INSERT INTO statement_transactions (statement_id, artist_id, transaction_date, concept, amount, transaction_type, category, payment_method)
    VALUES 
      (statement_id, artist_record.id, CURRENT_DATE - INTERVAL '12 days', 'Adelanto via Zelle Marval', -500.00 - (RANDOM() * 300), 'expense', 'Avance', 'Zelle'),
      (statement_id, artist_record.id, CURRENT_DATE - INTERVAL '7 days', 'Gastos de Airbnb de la finca villa grande La Masia', -800.00 - (RANDOM() * 400), 'expense', 'Gastos de producción', 'Transferencia'),
      (statement_id, artist_record.id, CURRENT_DATE - INTERVAL '3 days', 'Gastos de Viaje', -200.00 - (RANDOM() * 150), 'expense', 'Gastos de producción', 'Efectivo'),
      (statement_id, artist_record.id, CURRENT_DATE - INTERVAL '20 days', 'Pago por equipaje', -150.00 - (RANDOM() * 100), 'expense', 'Gastos de producción', 'Tarjeta');
    
  END LOOP;
  
  -- Count total transactions
  SELECT COUNT(*) INTO transaction_count FROM statement_transactions;
  RAISE NOTICE 'Total transactions in database: %', transaction_count;
  
END $$;
