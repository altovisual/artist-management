-- =====================================================
-- FIX SECURITY ISSUES - SIMPLE APPROACH
-- Drop backup tables and fix view
-- =====================================================

-- =====================================================
-- 1. FIX SECURITY DEFINER VIEW: conversation_list
-- =====================================================

-- First, let's check the original view definition
-- Run this query first to see what columns exist:
-- SELECT pg_get_viewdef('public.conversation_list', true);

-- Drop the existing view
DROP VIEW IF EXISTS public.conversation_list;

-- Recreate the view without SECURITY DEFINER
-- Using a simple approach that just selects from conversations table
-- Adjust the columns based on your actual table structure
CREATE OR REPLACE VIEW public.conversation_list 
WITH (security_invoker = true) AS
SELECT 
  c.*
FROM conversations c;

-- =====================================================
-- 2. DROP OLD BACKUP TABLES (RECOMMENDED)
-- =====================================================

-- These are old backup tables that are no longer needed
-- Make sure you have proper backups before running this!

DROP TABLE IF EXISTS public.artists_before_complete_restore;
DROP TABLE IF EXISTS public.artists_backup_emergency_20250927;
DROP TABLE IF EXISTS public.artists_temp_backup;
DROP TABLE IF EXISTS public.artists_before_restore_20250927;
DROP TABLE IF EXISTS public.artists_backup_before_simple_restore;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify no backup tables remain
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE '%backup%';

-- Should return 0 rows
