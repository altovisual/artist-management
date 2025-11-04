-- Add sample transactions for testing
-- This migration adds sample transaction data to populate the finance dashboard

-- First, let's get some artist IDs (assuming artists exist)
DO $$
DECLARE
  artist_id_1 uuid;
  artist_id_2 uuid;
  user_id_1 uuid;
  user_id_2 uuid;
  category_income_id uuid;
  category_expense_id uuid;
BEGIN
  -- Get first two artists with their user_ids
  SELECT id, user_id INTO artist_id_1, user_id_1 FROM artists ORDER BY created_at LIMIT 1;
  SELECT id, user_id INTO artist_id_2, user_id_2 FROM artists ORDER BY created_at OFFSET 1 LIMIT 1;
  
  -- Get or create income category
  SELECT id INTO category_income_id FROM transaction_categories WHERE type = 'income' LIMIT 1;
  IF category_income_id IS NULL THEN
    INSERT INTO transaction_categories (name, type, description)
    VALUES ('Streaming Revenue', 'income', 'Revenue from streaming platforms')
    RETURNING id INTO category_income_id;
  END IF;
  
  -- Get or create expense category
  SELECT id INTO category_expense_id FROM transaction_categories WHERE type = 'expense' LIMIT 1;
  IF category_expense_id IS NULL THEN
    INSERT INTO transaction_categories (name, type, description)
    VALUES ('Marketing', 'expense', 'Marketing and promotion expenses')
    RETURNING id INTO category_expense_id;
  END IF;
  
  -- Only insert if we have artists
  IF artist_id_1 IS NOT NULL AND user_id_1 IS NOT NULL THEN
    -- Insert sample income transactions
    INSERT INTO transactions (user_id, artist_id, category_id, amount, description, transaction_date, type)
    VALUES 
      (user_id_1, artist_id_1, category_income_id, 1500.00, 'Spotify streaming revenue - October', CURRENT_DATE - INTERVAL '5 days', 'income'),
      (user_id_1, artist_id_1, category_income_id, 2300.50, 'Apple Music streaming revenue - October', CURRENT_DATE - INTERVAL '3 days', 'income'),
      (user_id_1, artist_id_1, category_income_id, 890.75, 'YouTube revenue - October', CURRENT_DATE - INTERVAL '2 days', 'income'),
      (user_id_1, artist_id_1, category_expense_id, 450.00, 'Social media advertising campaign', CURRENT_DATE - INTERVAL '7 days', 'expense'),
      (user_id_1, artist_id_1, category_expense_id, 320.00, 'Playlist promotion', CURRENT_DATE - INTERVAL '4 days', 'expense');
    
    -- Insert for second artist if exists
    IF artist_id_2 IS NOT NULL AND user_id_2 IS NOT NULL THEN
      INSERT INTO transactions (user_id, artist_id, category_id, amount, description, transaction_date, type)
      VALUES 
        (user_id_2, artist_id_2, category_income_id, 1800.00, 'Spotify streaming revenue - October', CURRENT_DATE - INTERVAL '6 days', 'income'),
        (user_id_2, artist_id_2, category_income_id, 1200.00, 'Live performance', CURRENT_DATE - INTERVAL '10 days', 'income'),
        (user_id_2, artist_id_2, category_expense_id, 600.00, 'Studio recording session', CURRENT_DATE - INTERVAL '8 days', 'expense');
    END IF;
    
    RAISE NOTICE 'Sample transactions created successfully';
  ELSE
    RAISE NOTICE 'No artists found. Please create artists first.';
  END IF;
END $$;
