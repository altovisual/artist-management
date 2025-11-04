-- Remove duplicate artist_statements
-- Keep only the oldest statement for each artist+month combination

DO $$
DECLARE
  deleted_count int;
BEGIN
  -- Delete duplicate statements, keeping only the oldest one for each artist+month
  WITH duplicates AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY artist_id, statement_month 
        ORDER BY created_at ASC
      ) as rn
    FROM artist_statements
  )
  DELETE FROM artist_statements
  WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % duplicate statements', deleted_count;
  
  -- Show remaining statements count per artist
  RAISE NOTICE 'Remaining statements per artist:';
  FOR deleted_count IN 
    SELECT COUNT(*) as count
    FROM artist_statements
    GROUP BY artist_id
  LOOP
    RAISE NOTICE '  Artist has % statements', deleted_count;
  END LOOP;
  
END $$;
