-- Set current user as admin
-- This migration adds the role column to profiles and sets the user as admin

-- First, check if the role column exists, if not create it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT NULL;
    RAISE NOTICE 'Column role added to profiles table';
  ELSE
    RAISE NOTICE 'Column role already exists in profiles table';
  END IF;
END $$;

-- Update all existing users to admin (you can change this later per user)
UPDATE profiles 
SET role = 'admin' 
WHERE role IS NULL OR role = '';

-- Verify the update
DO $$
DECLARE
  admin_count int;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
  RAISE NOTICE 'Total admin users: %', admin_count;
END $$;
