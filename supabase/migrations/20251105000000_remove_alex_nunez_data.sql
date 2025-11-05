-- Remove Alex Nuñez financial data for testing
-- Created: 2025-11-05

DO $$
DECLARE
  alex_artist_id UUID;
  deleted_transactions INT := 0;
  deleted_statements INT := 0;
BEGIN
  -- Find Alex Nuñez artist ID
  SELECT id INTO alex_artist_id
  FROM artists
  WHERE name ILIKE '%Alex Nu%ez%' OR name ILIKE '%Alex Nunez%'
  LIMIT 1;

  IF alex_artist_id IS NOT NULL THEN
    RAISE NOTICE '🔍 Found Alex Nuñez with ID: %', alex_artist_id;

    -- Delete statement transactions first (foreign key constraint)
    DELETE FROM statement_transactions
    WHERE statement_id IN (
      SELECT id FROM artist_statements WHERE artist_id = alex_artist_id
    );
    GET DIAGNOSTICS deleted_transactions = ROW_COUNT;
    RAISE NOTICE '🗑️  Deleted % statement transactions', deleted_transactions;

    -- Delete artist statements
    DELETE FROM artist_statements
    WHERE artist_id = alex_artist_id;
    GET DIAGNOSTICS deleted_statements = ROW_COUNT;
    RAISE NOTICE '🗑️  Deleted % artist statements', deleted_statements;

    -- Delete old transactions table data (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
      DELETE FROM transactions WHERE artist_id = alex_artist_id;
      RAISE NOTICE '🗑️  Deleted old transactions table data';
    END IF;

    RAISE NOTICE '✅ Successfully removed all financial data for Alex Nuñez';
  ELSE
    RAISE NOTICE '⚠️  Alex Nuñez not found in artists table';
  END IF;
END $$;
