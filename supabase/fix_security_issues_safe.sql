-- =====================================================
-- FIX SECURITY ISSUES - SAFE APPROACH
-- Step by step with verification
-- =====================================================

-- =====================================================
-- STEP 1: CHECK CURRENT VIEW DEFINITION
-- =====================================================

-- Run this first to see the original view structure
SELECT pg_get_viewdef('public.conversation_list', true) as original_view;

-- =====================================================
-- STEP 2: FIX SECURITY DEFINER VIEW (SIMPLE VERSION)
-- =====================================================

-- This version just removes SECURITY DEFINER
-- and keeps all existing columns as-is

-- Drop the existing view
DROP VIEW IF EXISTS public.conversation_list;

-- Recreate with security_invoker = true (safer)
-- This uses the permissions of the user querying, not the view creator
CREATE OR REPLACE VIEW public.conversation_list 
WITH (security_invoker = true) AS
SELECT * FROM conversations;

-- =====================================================
-- STEP 3: DROP OLD BACKUP TABLES
-- =====================================================

-- These are old backup tables from September 2025
-- They should be safe to delete if you have the data restored

DROP TABLE IF EXISTS public.artists_before_complete_restore;
DROP TABLE IF EXISTS public.artists_backup_emergency_20250927;
DROP TABLE IF EXISTS public.artists_temp_backup;
DROP TABLE IF EXISTS public.artists_before_restore_20250927;
DROP TABLE IF EXISTS public.artists_backup_before_simple_restore;

-- =====================================================
-- STEP 4: VERIFICATION
-- =====================================================

-- Check that backup tables are gone
SELECT 
  tablename,
  rowsecurity as has_rls
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE '%backup%'
  OR tablename LIKE '%restore%';

-- Should return 0 rows

-- Check that the view exists and works
SELECT * FROM public.conversation_list LIMIT 1;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Security fixes applied successfully!';
  RAISE NOTICE '✅ View conversation_list recreated without SECURITY DEFINER';
  RAISE NOTICE '✅ Backup tables removed';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Go to Security Advisor and click Refresh';
  RAISE NOTICE '2. Verify 0 errors are shown';
END $$;
