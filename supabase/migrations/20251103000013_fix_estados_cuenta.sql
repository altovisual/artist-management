-- Complete verification and fix for Estados de Cuenta section
-- Ensures all artist_statements data is correct and without errors

DO $$
DECLARE
  artist_record RECORD;
  statement_record RECORD;
  issue_count INT := 0;
  fixed_count INT := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ESTADOS DE CUENTA - VERIFICATION & FIX';
  RAISE NOTICE '========================================';
  
  -- 1. Remove test data from November 2024 (created by migrations)
  RAISE NOTICE '';
  RAISE NOTICE '1. Removing test data from November 2024...';
  
  WITH test_statements AS (
    SELECT id 
    FROM artist_statements 
    WHERE statement_month = '2024-11'
    AND period_start = '2024-11-01'
    AND period_end = '2024-11-30'
  )
  DELETE FROM statement_transactions
  WHERE statement_id IN (SELECT id FROM test_statements);
  
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  RAISE NOTICE '   ✓ Deleted % test transactions', fixed_count;
  
  DELETE FROM artist_statements
  WHERE statement_month = '2024-11'
  AND period_start = '2024-11-01'
  AND period_end = '2024-11-30';
  
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  RAISE NOTICE '   ✓ Deleted % test statements', fixed_count;
  
  -- 2. Remove duplicate statements (keep oldest)
  RAISE NOTICE '';
  RAISE NOTICE '2. Checking for duplicate statements...';
  
  WITH duplicates AS (
    SELECT 
      id,
      artist_id,
      statement_month,
      ROW_NUMBER() OVER (
        PARTITION BY artist_id, statement_month 
        ORDER BY created_at ASC, id ASC
      ) as rn
    FROM artist_statements
  )
  DELETE FROM artist_statements
  WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
  );
  
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  
  IF fixed_count > 0 THEN
    RAISE NOTICE '   ✓ Removed % duplicate statements', fixed_count;
  ELSE
    RAISE NOTICE '   ✓ No duplicates found';
  END IF;
  
  -- 3. Verify and fix artist_id consistency
  RAISE NOTICE '';
  RAISE NOTICE '3. Verifying artist_id consistency...';
  
  -- Fix transactions with mismatched artist_id
  UPDATE statement_transactions st
  SET artist_id = s.artist_id
  FROM artist_statements s
  WHERE st.statement_id = s.id 
  AND st.artist_id != s.artist_id;
  
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  
  IF fixed_count > 0 THEN
    RAISE NOTICE '   ✓ Fixed % transactions with wrong artist_id', fixed_count;
  ELSE
    RAISE NOTICE '   ✓ All artist_ids are correct';
  END IF;
  
  -- 4. Remove orphan transactions
  RAISE NOTICE '';
  RAISE NOTICE '4. Checking for orphan transactions...';
  
  DELETE FROM statement_transactions st
  WHERE NOT EXISTS (
    SELECT 1 FROM artist_statements s WHERE s.id = st.statement_id
  );
  
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  
  IF fixed_count > 0 THEN
    RAISE NOTICE '   ✓ Removed % orphan transactions', fixed_count;
  ELSE
    RAISE NOTICE '   ✓ No orphan transactions found';
  END IF;
  
  -- 5. Update all statement summaries
  RAISE NOTICE '';
  RAISE NOTICE '5. Recalculating statement summaries...';
  
  FOR statement_record IN 
    SELECT id FROM artist_statements
  LOOP
    UPDATE artist_statements s
    SET 
      total_income = COALESCE((
        SELECT SUM(amount) 
        FROM statement_transactions 
        WHERE statement_id = s.id AND transaction_type = 'income'
      ), 0),
      total_expenses = COALESCE((
        SELECT SUM(ABS(amount)) 
        FROM statement_transactions 
        WHERE statement_id = s.id AND transaction_type = 'expense'
      ), 0),
      total_advances = COALESCE((
        SELECT SUM(ABS(amount)) 
        FROM statement_transactions 
        WHERE statement_id = s.id AND transaction_type = 'advance'
      ), 0),
      total_transactions = COALESCE((
        SELECT COUNT(*) 
        FROM statement_transactions 
        WHERE statement_id = s.id
      ), 0),
      updated_at = NOW()
    WHERE s.id = statement_record.id;
  END LOOP;
  
  -- Calculate balance
  UPDATE artist_statements
  SET balance = total_income - total_expenses - total_advances;
  
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  RAISE NOTICE '   ✓ Updated % statement summaries', fixed_count;
  
  -- 6. Verify data integrity
  RAISE NOTICE '';
  RAISE NOTICE '6. Final data integrity checks...';
  
  -- Check for statements without transactions
  SELECT COUNT(*) INTO issue_count
  FROM artist_statements s
  WHERE NOT EXISTS (
    SELECT 1 FROM statement_transactions st WHERE st.statement_id = s.id
  );
  
  IF issue_count > 0 THEN
    RAISE WARNING '   ⚠ Found % statements with zero transactions', issue_count;
    
    -- Show which ones
    FOR statement_record IN 
      SELECT s.id, s.statement_month, a.name as artist_name
      FROM artist_statements s
      JOIN artists a ON s.artist_id = a.id
      WHERE NOT EXISTS (
        SELECT 1 FROM statement_transactions st WHERE st.statement_id = s.id
      )
    LOOP
      RAISE WARNING '     - % (%) - statement_id: %', 
        statement_record.artist_name, 
        statement_record.statement_month,
        statement_record.id;
    END LOOP;
  ELSE
    RAISE NOTICE '   ✓ All statements have transactions';
  END IF;
  
  -- 7. Show final statistics
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ESTADOS DE CUENTA - FINAL REPORT';
  RAISE NOTICE '========================================';
  
  -- Overall stats
  SELECT COUNT(*) INTO issue_count FROM artists;
  RAISE NOTICE 'Total Artists: %', issue_count;
  
  SELECT COUNT(*) INTO issue_count FROM artist_statements;
  RAISE NOTICE 'Total Statements: %', issue_count;
  
  SELECT COUNT(*) INTO issue_count FROM statement_transactions;
  RAISE NOTICE 'Total Transactions: %', issue_count;
  
  -- Breakdown by month
  RAISE NOTICE '';
  RAISE NOTICE 'Statements by month:';
  RAISE NOTICE '%-15s %-12s %-15s %s', 'Month', 'Statements', 'Transactions', 'Artists';
  RAISE NOTICE '%', REPEAT('-', 60);
  
  FOR statement_record IN 
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
    RAISE NOTICE '%-15s %-12s %-15s %s', 
      statement_record.statement_month,
      statement_record.stmt_count,
      statement_record.trans_count,
      statement_record.artist_count;
  END LOOP;
  
  -- Breakdown by artist (top 10 by transactions)
  RAISE NOTICE '';
  RAISE NOTICE 'Top 10 artists by transaction count:';
  RAISE NOTICE '%-30s %-12s %-12s %s', 'Artist', 'Statements', 'Trans', 'Balance';
  RAISE NOTICE '%', REPEAT('-', 80);
  
  FOR artist_record IN 
    SELECT 
      a.name,
      COUNT(DISTINCT s.id) as stmt_count,
      COUNT(st.id) as trans_count,
      COALESCE(SUM(s.balance), 0) as total_balance
    FROM artists a
    LEFT JOIN artist_statements s ON a.id = s.artist_id
    LEFT JOIN statement_transactions st ON s.id = st.statement_id
    GROUP BY a.id, a.name
    HAVING COUNT(st.id) > 0
    ORDER BY COUNT(st.id) DESC
    LIMIT 10
  LOOP
    RAISE NOTICE '%-30s %-12s %-12s $%s', 
      artist_record.name,
      artist_record.stmt_count,
      artist_record.trans_count,
      TO_CHAR(artist_record.total_balance, 'FM999,999,999.00');
  END LOOP;
  
  -- Check for issues
  RAISE NOTICE '';
  RAISE NOTICE 'Data quality summary:';
  
  SELECT COUNT(*) INTO issue_count
  FROM (
    SELECT artist_id, statement_month
    FROM artist_statements
    GROUP BY artist_id, statement_month
    HAVING COUNT(*) > 1
  ) dups;
  
  IF issue_count = 0 THEN
    RAISE NOTICE '✓ No duplicate statements';
  ELSE
    RAISE WARNING '⚠ % duplicate statements found', issue_count;
  END IF;
  
  SELECT COUNT(*) INTO issue_count
  FROM statement_transactions st
  WHERE NOT EXISTS (
    SELECT 1 FROM artist_statements s WHERE s.id = st.statement_id
  );
  
  IF issue_count = 0 THEN
    RAISE NOTICE '✓ No orphan transactions';
  ELSE
    RAISE WARNING '⚠ % orphan transactions found', issue_count;
  END IF;
  
  SELECT COUNT(*) INTO issue_count
  FROM artist_statements s
  WHERE NOT EXISTS (
    SELECT 1 FROM statement_transactions st WHERE st.statement_id = s.id
  );
  
  IF issue_count = 0 THEN
    RAISE NOTICE '✓ All statements have transactions';
  ELSE
    RAISE WARNING '⚠ % statements without transactions', issue_count;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION COMPLETED';
  RAISE NOTICE '========================================';
  
END $$;
