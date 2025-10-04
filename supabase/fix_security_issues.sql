-- =====================================================
-- FIX SECURITY ISSUES - Supabase Database Linter
-- =====================================================

-- =====================================================
-- 1. FIX SECURITY DEFINER VIEW: conversation_list
-- =====================================================

-- Drop the existing view
DROP VIEW IF EXISTS public.conversation_list;

-- Recreate the view WITHOUT SECURITY DEFINER
-- This will use the permissions of the querying user instead
CREATE OR REPLACE VIEW public.conversation_list AS
SELECT 
  c.id,
  c.created_at,
  c.updated_at,
  c.user_id,
  c.artist_id,
  c.last_message,
  c.last_message_at,
  c.unread_count,
  a.name as artist_name,
  a.image_url as artist_image
FROM conversations c
LEFT JOIN artists a ON c.artist_id = a.id;

-- Enable RLS on the view (if needed)
ALTER VIEW public.conversation_list SET (security_invoker = true);

-- =====================================================
-- 2. ENABLE RLS ON BACKUP TABLES
-- =====================================================

-- These are backup tables that should have RLS enabled
-- or be moved to a private schema

-- Option A: Enable RLS on backup tables
ALTER TABLE public.artists_before_complete_restore ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists_backup_emergency_20250927 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists_temp_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists_before_restore_20250927 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists_backup_before_simple_restore ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies (only admins can access backup tables)
CREATE POLICY "Only admins can view backup tables - artists_before_complete_restore"
  ON public.artists_before_complete_restore
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can view backup tables - artists_backup_emergency_20250927"
  ON public.artists_backup_emergency_20250927
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can view backup tables - artists_temp_backup"
  ON public.artists_temp_backup
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can view backup tables - artists_before_restore_20250927"
  ON public.artists_before_restore_20250927
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can view backup tables - artists_backup_before_simple_restore"
  ON public.artists_backup_before_simple_restore
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- OPTIONAL: Move backup tables to a private schema
-- =====================================================

-- Uncomment these lines if you prefer to move backups to a private schema
-- This is the recommended approach for backup tables

/*
-- Create a private schema for backups
CREATE SCHEMA IF NOT EXISTS backups;

-- Move all backup tables to the private schema
ALTER TABLE public.artists_before_complete_restore SET SCHEMA backups;
ALTER TABLE public.artists_backup_emergency_20250927 SET SCHEMA backups;
ALTER TABLE public.artists_temp_backup SET SCHEMA backups;
ALTER TABLE public.artists_before_restore_20250927 SET SCHEMA backups;
ALTER TABLE public.artists_backup_before_simple_restore SET SCHEMA backups;

-- Grant access only to postgres role
GRANT ALL ON SCHEMA backups TO postgres;
REVOKE ALL ON SCHEMA backups FROM public;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if RLS is enabled on all public tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%backup%'
ORDER BY tablename;

-- Check views with SECURITY DEFINER
SELECT 
  n.nspname as schema_name,
  c.relname as view_name,
  CASE 
    WHEN c.relkind = 'v' THEN 'view'
    WHEN c.relkind = 'm' THEN 'materialized view'
  END as view_type
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('v', 'm')
  AND n.nspname = 'public'
  AND c.relname = 'conversation_list';
