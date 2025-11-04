-- Complete verification and analysis of Excel data integrity
-- This migration compares database data with the original Excel import

DO $$
DECLARE
  artist_record RECORD;
  total_artists int;
  total_statements int;
  total_transactions int;
  expected_artists TEXT[] := ARRAY['marval']; -- Add more as we verify
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'EXCEL DATA INTEGRITY VERIFICATION';
  RAISE NOTICE '========================================';
  
  -- 1. Show all artists in database
  RAISE NOTICE '';
  RAISE NOTICE '1. Artists in database:';
  RAISE NOTICE '   %-30s %s', 'Artist Name', 'ID';
  RAISE NOTICE '   %', REPEAT('-', 70);
  
  FOR artist_record IN 
    SELECT id, name 
    FROM artists 
    ORDER BY name
  LOOP
    RAISE NOTICE '   %-30s %s', artist_record.name, artist_record.id;
  END LOOP;
  
  SELECT COUNT(*) INTO total_artists FROM artists;
  RAISE NOTICE '   %', REPEAT('-', 70);
  RAISE NOTICE '   Total: % artists', total_artists;
  
  -- 2. Show all statement periods (months)
  RAISE NOTICE '';
  RAISE NOTICE '2. Statement periods in database:';
  RAISE NOTICE '   %-15s %-10s %-10s %s', 'Month', 'Statements', 'Trans', 'Artists';
  RAISE NOTICE '   %', REPEAT('-', 70);
  
  FOR artist_record IN 
    SELECT 
      s.statement_month,
      COUNT(DISTINCT s.id) as stmt_count,
      COUNT(st.id) as trans_count,
      COUNT(DISTINCT s.artist_id) as artist_count
    FROM artist_statements s
    LEFT JOIN statement_transactions st ON s.id = st.statement_id
    GROUP BY s.statement_month
    ORDER BY s.statement_month DESC
  LOOP
    RAISE NOTICE '   %-15s %-10s %-10s %s', 
      artist_record.statement_month,
      artist_record.stmt_count,
      artist_record.trans_count,
      artist_record.artist_count;
  END LOOP;
  
  -- 3. Detailed breakdown by artist
  RAISE NOTICE '';
  RAISE NOTICE '3. Detailed breakdown by artist:';
  RAISE NOTICE '   %-30s %-12s %-12s %-15s %-15s %s', 
    'Artist', 'Statements', 'Trans', 'Total Income', 'Total Expense', 'Balance';
  RAISE NOTICE '   %', REPEAT('-', 120);
  
  FOR artist_record IN 
    SELECT 
      a.name,
      COUNT(DISTINCT s.id) as stmt_count,
      COUNT(st.id) as trans_count,
      COALESCE(SUM(CASE WHEN st.transaction_type = 'income' THEN st.amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN st.transaction_type = 'expense' THEN ABS(st.amount) ELSE 0 END), 0) as total_expense,
      COALESCE(SUM(CASE WHEN st.transaction_type = 'income' THEN st.amount ELSE -ABS(st.amount) END), 0) as balance
    FROM artists a
    LEFT JOIN artist_statements s ON a.id = s.artist_id
    LEFT JOIN statement_transactions st ON s.id = st.statement_id
    GROUP BY a.id, a.name
    ORDER BY a.name
  LOOP
    RAISE NOTICE '   %-30s %-12s %-12s $%-14s $%-14s $%s', 
      artist_record.name,
      artist_record.stmt_count,
      artist_record.trans_count,
      TO_CHAR(artist_record.total_income, 'FM999,999,999.00'),
      TO_CHAR(artist_record.total_expense, 'FM999,999,999.00'),
      TO_CHAR(artist_record.balance, 'FM999,999,999.00');
  END LOOP;
  
  -- 4. Check for data quality issues
  RAISE NOTICE '';
  RAISE NOTICE '4. Data quality checks:';
  
  -- Check for duplicate statements
  SELECT COUNT(*) INTO total_statements
  FROM (
    SELECT artist_id, statement_month, COUNT(*) as count
    FROM artist_statements
    GROUP BY artist_id, statement_month
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF total_statements > 0 THEN
    RAISE WARNING '   ⚠ Found % duplicate statements (same artist+month)', total_statements;
  ELSE
    RAISE NOTICE '   ✓ No duplicate statements found';
  END IF;
  
  -- Check for orphan transactions
  SELECT COUNT(*) INTO total_transactions
  FROM statement_transactions st
  WHERE NOT EXISTS (
    SELECT 1 FROM artist_statements s WHERE s.id = st.statement_id
  );
  
  IF total_transactions > 0 THEN
    RAISE WARNING '   ⚠ Found % orphan transactions (no statement)', total_transactions;
  ELSE
    RAISE NOTICE '   ✓ No orphan transactions found';
  END IF;
  
  -- Check for mismatched artist_ids
  SELECT COUNT(*) INTO total_transactions
  FROM statement_transactions st
  JOIN artist_statements s ON st.statement_id = s.id
  WHERE st.artist_id != s.artist_id;
  
  IF total_transactions > 0 THEN
    RAISE WARNING '   ⚠ Found % transactions with mismatched artist_id', total_transactions;
  ELSE
    RAISE NOTICE '   ✓ No mismatched artist_ids found';
  END IF;
  
  -- Check for statements with zero transactions
  SELECT COUNT(*) INTO total_statements
  FROM artist_statements s
  WHERE NOT EXISTS (
    SELECT 1 FROM statement_transactions st WHERE st.statement_id = s.id
  );
  
  IF total_statements > 0 THEN
    RAISE WARNING '   ⚠ Found % statements with zero transactions', total_statements;
  ELSE
    RAISE NOTICE '   ✓ All statements have transactions';
  END IF;
  
  -- 5. Show sample transactions for verification
  RAISE NOTICE '';
  RAISE NOTICE '5. Sample transactions (first 10):';
  RAISE NOTICE '   %-15s %-20s %-30s %-12s %s', 'Date', 'Artist', 'Concept', 'Type', 'Amount';
  RAISE NOTICE '   %', REPEAT('-', 120);
  
  FOR artist_record IN 
    SELECT 
      st.transaction_date,
      a.name as artist_name,
      LEFT(st.concept, 30) as concept,
      st.transaction_type,
      st.amount
    FROM statement_transactions st
    JOIN artist_statements s ON st.statement_id = s.id
    JOIN artists a ON s.artist_id = a.id
    ORDER BY st.transaction_date DESC, st.created_at DESC
    LIMIT 10
  LOOP
    RAISE NOTICE '   %-15s %-20s %-30s %-12s $%s', 
      artist_record.transaction_date,
      LEFT(artist_record.artist_name, 20),
      artist_record.concept,
      artist_record.transaction_type,
      TO_CHAR(artist_record.amount, 'FM999,999,999.00');
  END LOOP;
  
  -- 6. Final summary
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION SUMMARY';
  RAISE NOTICE '========================================';
  
  SELECT COUNT(*) INTO total_artists FROM artists;
  SELECT COUNT(*) INTO total_statements FROM artist_statements;
  SELECT COUNT(*) INTO total_transactions FROM statement_transactions;
  
  RAISE NOTICE 'Total Artists: %', total_artists;
  RAISE NOTICE 'Total Statements: %', total_statements;
  RAISE NOTICE 'Total Transactions: %', total_transactions;
  RAISE NOTICE 'Average Transactions per Statement: %', 
    CASE WHEN total_statements > 0 THEN total_transactions / total_statements ELSE 0 END;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION COMPLETED';
  RAISE NOTICE '========================================';
  
END $$;
