-- ========================================
-- FIX: Participants RLS Policies
-- ========================================
-- Problem: Missing INSERT policy for admins
-- Solution: Add explicit INSERT policy for admins

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own participant data." ON public.participants;
DROP POLICY IF EXISTS "Users can update their own participant data." ON public.participants;
DROP POLICY IF EXISTS "Admins have full access to participants." ON public.participants;

-- 1. Allow users to view their own participant record
CREATE POLICY "Users can view their own participant data."
ON public.participants FOR SELECT
USING ( auth.uid() = user_id );

-- 2. Allow users to update their own participant record
CREATE POLICY "Users can update their own participant data."
ON public.participants FOR UPDATE
USING ( auth.uid() = user_id )
WITH CHECK ( auth.uid() = user_id );

-- 3. Allow admins to SELECT all participants
CREATE POLICY "Admins can view all participants."
ON public.participants FOR SELECT
USING ( get_my_role() = 'admin' );

-- 4. Allow admins to INSERT new participants
CREATE POLICY "Admins can create participants."
ON public.participants FOR INSERT
WITH CHECK ( get_my_role() = 'admin' );

-- 5. Allow admins to UPDATE any participant
CREATE POLICY "Admins can update any participant."
ON public.participants FOR UPDATE
USING ( get_my_role() = 'admin' )
WITH CHECK ( get_my_role() = 'admin' );

-- 6. Allow admins to DELETE participants
CREATE POLICY "Admins can delete participants."
ON public.participants FOR DELETE
USING ( get_my_role() = 'admin' );

-- Verify the function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_my_role'
  ) THEN
    RAISE EXCEPTION 'Function get_my_role() does not exist. Please create it first.';
  END IF;
END $$;

-- Test query to verify policies (run this after applying)
-- SELECT * FROM public.participants; -- Should work for admins
