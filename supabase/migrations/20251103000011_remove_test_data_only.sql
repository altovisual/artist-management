-- Remove ONLY test/sample data, keep real Excel imports
-- This migration is SAFE and only removes data created by migration scripts

DO $$
DECLARE
  deleted_statements int;
  deleted_transactions int;
  remaining_statements int;
  remaining_transactions int;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'REMOVING TEST DATA (KEEPING REAL DATA)';
  RAISE NOTICE '========================================';
  
  -- 1. Identify and remove test statements (created in November 2024 by migration)
  RAISE NOTICE '';
  RAISE NOTICE '1. Removing test statements from November 2024...';
  
  -- Delete transactions first (to avoid foreign key issues)
  WITH test_statements AS (
    SELECT id 
    FROM artist_statements 
    WHERE statement_month = '2024-11'
    AND period_start = '2024-11-01'
    AND period_end = '2024-11-30'
  )
  DELETE FROM statement_transactions
  WHERE statement_id IN (SELECT id FROM test_statements);
  
  GET DIAGNOSTICS deleted_transactions = ROW_COUNT;
  RAISE NOTICE '   ✓ Deleted % test transactions', deleted_transactions;
  
  -- Now delete the statements
  DELETE FROM artist_statements
  WHERE statement_month = '2024-11'
  AND period_start = '2024-11-01'
  AND period_end = '2024-11-30';
  
  GET DIAGNOSTICS deleted_statements = ROW_COUNT;
  RAISE NOTICE '   ✓ Deleted % test statements', deleted_statements;
  
  -- 2. Verify remaining data
  RAISE NOTICE '';
  RAISE NOTICE '2. Verifying remaining data...';
  
  SELECT COUNT(*) INTO remaining_statements FROM artist_statements;
  RAISE NOTICE '   ✓ Remaining statements: %', remaining_statements;
  
  SELECT COUNT(*) INTO remaining_transactions FROM statement_transactions;
  RAISE NOTICE '   ✓ Remaining transactions: %', remaining_transactions;
  
  -- 3. Show breakdown by month (to verify we kept real data)
  RAISE NOTICE '';
  RAISE NOTICE '3. Remaining data by month:';
  
  DECLARE
    month_name TEXT;
    stmt_count INT;
    trans_count INT;
  BEGIN
    FOR month_name, stmt_count, trans_count IN 
      SELECT 
        s.statement_month,
        COUNT(DISTINCT s.id)::INT as statements,
        COUNT(st.id)::INT as transactions
      FROM artist_statements s
      LEFT JOIN statement_transactions st ON s.id = st.statement_id
      GROUP BY s.statement_month
      ORDER BY s.statement_month DESC
    LOOP
      RAISE NOTICE '   % - % statements, % transactions', 
        month_name,
        stmt_count, 
        trans_count;
    END LOOP;
  END;
  
  -- 4. Final cleanup - remove duplicates if any
  RAISE NOTICE '';
  RAISE NOTICE '4. Final cleanup - removing any duplicates...';
  
  WITH duplicates AS (
    SELECT 
      id,
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
  
  GET DIAGNOSTICS deleted_statements = ROW_COUNT;
  RAISE NOTICE '   ✓ Deleted % duplicate statements', deleted_statements;
  
  -- Update summaries for remaining statements
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
    total_transactions = COALESCE((
      SELECT COUNT(*) 
      FROM statement_transactions 
      WHERE statement_id = s.id
    ), 0),
    balance = COALESCE((
      SELECT SUM(amount) 
      FROM statement_transactions 
      WHERE statement_id = s.id AND transaction_type = 'income'
    ), 0) - COALESCE((
      SELECT SUM(ABS(amount)) 
      FROM statement_transactions 
      WHERE statement_id = s.id AND transaction_type = 'expense'
    ), 0),
    updated_at = NOW();
  
  RAISE NOTICE '   ✓ Updated all statement summaries';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CLEANUP COMPLETED - REAL DATA PRESERVED';
  RAISE NOTICE '========================================';
  
END $$;
