-- Complete data cleanup and verification
-- This migration ensures no duplicates and data consistency

DO $$
DECLARE
  duplicate_statements int;
  duplicate_transactions int;
  orphan_transactions int;
  total_artists int;
  total_statements int;
  total_transactions int;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STARTING DATA CLEANUP AND VERIFICATION';
  RAISE NOTICE '========================================';
  
  -- 1. Remove duplicate artist_statements (keep oldest)
  RAISE NOTICE '';
  RAISE NOTICE '1. Checking for duplicate artist_statements...';
  
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
  
  GET DIAGNOSTICS duplicate_statements = ROW_COUNT;
  RAISE NOTICE '   ✓ Deleted % duplicate statements', duplicate_statements;
  
  -- 2. Remove duplicate statement_transactions
  RAISE NOTICE '';
  RAISE NOTICE '2. Checking for duplicate statement_transactions...';
  
  WITH duplicates AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY statement_id, artist_id, transaction_date, concept, amount 
        ORDER BY created_at ASC, id ASC
      ) as rn
    FROM statement_transactions
  )
  DELETE FROM statement_transactions
  WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
  );
  
  GET DIAGNOSTICS duplicate_transactions = ROW_COUNT;
  RAISE NOTICE '   ✓ Deleted % duplicate transactions', duplicate_transactions;
  
  -- 3. Remove orphan transactions (transactions without valid statement)
  RAISE NOTICE '';
  RAISE NOTICE '3. Checking for orphan transactions...';
  
  DELETE FROM statement_transactions st
  WHERE NOT EXISTS (
    SELECT 1 FROM artist_statements s WHERE s.id = st.statement_id
  );
  
  GET DIAGNOSTICS orphan_transactions = ROW_COUNT;
  RAISE NOTICE '   ✓ Deleted % orphan transactions', orphan_transactions;
  
  -- 4. Verify data consistency
  RAISE NOTICE '';
  RAISE NOTICE '4. Verifying data consistency...';
  
  -- Check for transactions with mismatched artist_id
  WITH mismatched AS (
    SELECT COUNT(*) as count
    FROM statement_transactions st
    JOIN artist_statements s ON st.statement_id = s.id
    WHERE st.artist_id != s.artist_id
  )
  SELECT count INTO orphan_transactions FROM mismatched;
  
  IF orphan_transactions > 0 THEN
    RAISE WARNING '   ⚠ Found % transactions with mismatched artist_id', orphan_transactions;
    
    -- Fix mismatched artist_ids
    UPDATE statement_transactions st
    SET artist_id = s.artist_id
    FROM artist_statements s
    WHERE st.statement_id = s.id AND st.artist_id != s.artist_id;
    
    RAISE NOTICE '   ✓ Fixed % mismatched artist_ids', orphan_transactions;
  ELSE
    RAISE NOTICE '   ✓ No mismatched artist_ids found';
  END IF;
  
  -- 5. Update statement summaries
  RAISE NOTICE '';
  RAISE NOTICE '5. Updating statement summaries...';
  
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
    updated_at = NOW();
  
  RAISE NOTICE '   ✓ Updated all statement summaries';
  
  -- Calculate balance
  UPDATE artist_statements
  SET balance = total_income - total_expenses - total_advances;
  
  -- 6. Final statistics
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FINAL STATISTICS';
  RAISE NOTICE '========================================';
  
  SELECT COUNT(*) INTO total_artists FROM artists;
  RAISE NOTICE 'Total Artists: %', total_artists;
  
  SELECT COUNT(*) INTO total_statements FROM artist_statements;
  RAISE NOTICE 'Total Statements: %', total_statements;
  
  SELECT COUNT(*) INTO total_transactions FROM statement_transactions;
  RAISE NOTICE 'Total Transactions: %', total_transactions;
  
  -- Show detailed breakdown
  RAISE NOTICE '';
  RAISE NOTICE 'Detailed breakdown by artist:';
  DECLARE
    artist_name TEXT;
    stmt_count INT;
    trans_count INT;
  BEGIN
    FOR artist_name, stmt_count, trans_count IN 
      SELECT 
        a.name,
        COUNT(DISTINCT s.id)::INT as statements,
        COUNT(st.id)::INT as transactions
      FROM artists a
      LEFT JOIN artist_statements s ON a.id = s.artist_id
      LEFT JOIN statement_transactions st ON s.id = st.statement_id
      GROUP BY a.id, a.name
      ORDER BY a.name
    LOOP
      RAISE NOTICE '  % - % statements, % transactions', 
        RPAD(artist_name, 25), 
        stmt_count, 
        trans_count;
    END LOOP;
  END;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CLEANUP COMPLETED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  
END $$;
