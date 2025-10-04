-- ========================================
-- FIX: get_my_role() Function and Participants RLS
-- ========================================
-- Problem: Column "role" does not exist error
-- Solution: Fix get_my_role() function and update policies
-- IMPORTANT: We must drop policies FIRST before dropping functions

-- Step 1: Drop existing participants policies that depend on get_my_role()
DROP POLICY IF EXISTS "Users can view their own participant data." ON public.participants;
DROP POLICY IF EXISTS "Users can update their own participant data." ON public.participants;
DROP POLICY IF EXISTS "Admins have full access to participants." ON public.participants;
DROP POLICY IF EXISTS "Admins can view all participants." ON public.participants;
DROP POLICY IF EXISTS "Admins can create participants." ON public.participants;
DROP POLICY IF EXISTS "Admins can update any participant." ON public.participants;
DROP POLICY IF EXISTS "Admins can delete participants." ON public.participants;

-- Step 2: Now we can safely drop and recreate get_my_role() function
DROP FUNCTION IF EXISTS public.get_my_role();

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Try to get role from JWT app_metadata
  BEGIN
    user_role := nullif(
      (auth.jwt()->>'app_metadata')::jsonb->>'role',
      ''
    )::text;
  EXCEPTION WHEN OTHERS THEN
    user_role := NULL;
  END;
  
  RETURN user_role;
END;
$$;

-- Step 3: Create a simpler admin check function as fallback
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Check if user is authenticated first
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Try to get role from JWT
  BEGIN
    user_role := (auth.jwt()->>'app_metadata')::jsonb->>'role';
  EXCEPTION WHEN OTHERS THEN
    user_role := NULL;
  END;
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$$;

-- Step 4: Create new policies using is_admin() function
-- Allow admins to view all participants
CREATE POLICY "Admins can view all participants"
ON public.participants FOR SELECT
USING (is_admin());

-- Allow admins to create participants
CREATE POLICY "Admins can create participants"
ON public.participants FOR INSERT
WITH CHECK (is_admin());

-- Allow admins to update any participant
CREATE POLICY "Admins can update any participant"
ON public.participants FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Allow admins to delete participants
CREATE POLICY "Admins can delete participants"
ON public.participants FOR DELETE
USING (is_admin());

-- Allow users to view their own participant record
CREATE POLICY "Users can view their own participant data"
ON public.participants FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to update their own participant record
CREATE POLICY "Users can update their own participant data"
ON public.participants FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 5: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Step 6: Verify setup
DO $$
BEGIN
  RAISE NOTICE 'Functions created successfully';
  RAISE NOTICE 'Testing is_admin(): %', is_admin();
  RAISE NOTICE 'Testing get_my_role(): %', get_my_role();
END $$;

-- Step 7: Instructions for setting admin role
COMMENT ON FUNCTION public.is_admin() IS 
'Checks if current user has admin role in JWT app_metadata. 
To set a user as admin, run:
UPDATE auth.users 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, ''{}''::jsonb),
  ''{role}'',
  ''"admin"''
)
WHERE email = ''your-email@example.com'';';
