-- ========================================
-- FIX: Signatures RLS Policies
-- ========================================
-- Problema: Políticas RLS bloqueando lectura de signatures
-- Error: "permission denied for table users"
-- Solución: Actualizar políticas para usar is_admin() y permitir acceso

-- Step 0: Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Users can view signatures for their contracts" ON public.signatures;
DROP POLICY IF EXISTS "Admins have full access to signatures." ON public.signatures;
DROP POLICY IF EXISTS "Admins can view all signatures" ON public.signatures;
DROP POLICY IF EXISTS "Admins can create signatures" ON public.signatures;
DROP POLICY IF EXISTS "Admins can update signatures" ON public.signatures;
DROP POLICY IF EXISTS "Admins can delete signatures" ON public.signatures;
DROP POLICY IF EXISTS "Users can view their own signatures" ON public.signatures;

-- Step 2: Create new policies using is_admin()

-- Allow admins to view all signatures
CREATE POLICY "Admins can view all signatures"
ON public.signatures FOR SELECT
USING (is_admin());

-- Allow admins to create signatures
CREATE POLICY "Admins can create signatures"
ON public.signatures FOR INSERT
WITH CHECK (is_admin());

-- Allow admins to update signatures
CREATE POLICY "Admins can update signatures"
ON public.signatures FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Allow admins to delete signatures
CREATE POLICY "Admins can delete signatures"
ON public.signatures FOR DELETE
USING (is_admin());

-- Allow users to view signatures where they are the signer
CREATE POLICY "Users can view their own signatures"
ON public.signatures FOR SELECT
USING (signer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Step 3: Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'signatures'
ORDER BY policyname;

-- Step 4: Test query (should return signatures for admins)
SELECT 
  COUNT(*) as total_signatures,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent
FROM public.signatures;
