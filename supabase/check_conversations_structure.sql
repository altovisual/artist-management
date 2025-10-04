-- =====================================================
-- CHECK CONVERSATIONS TABLE STRUCTURE
-- =====================================================

-- Check if conversations table exists and its columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'conversations'
ORDER BY ordinal_position;

-- Check the original view definition
SELECT 
  pg_get_viewdef('public.conversation_list', true) as view_definition;
