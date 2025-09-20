-- ========= PARTICIPANTS TABLE POLICIES =========

-- 1. Drop the old insecure SELECT policy
DROP POLICY IF EXISTS "Public participants are viewable by everyone." ON public.participants;

-- 2. Allow users to view their own participant record.
CREATE POLICY "Users can view their own participant data."
ON public.participants FOR SELECT
USING ( auth.uid() = user_id );

-- 3. Allow users to update their own participant record.
CREATE POLICY "Users can update their own participant data."
ON public.participants FOR UPDATE
USING ( auth.uid() = user_id );

-- 4. Allow admins to perform any action on participants.
CREATE POLICY "Admins have full access to participants."
ON public.participants FOR ALL
USING ( get_my_role() = 'admin' )
WITH CHECK ( get_my_role() = 'admin' );


-- ========= SIGNATURES TABLE POLICIES =========

-- 1. Drop the old insecure policy if it exists from the initial migration
DROP POLICY IF EXISTS "Allow read access to all users" ON public.signatures;

-- 2. Allow users to see signatures related to contracts they are a part of
CREATE POLICY "Users can view signatures for their contracts"
ON public.signatures
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.contracts c
    JOIN public.contract_participants cp ON c.id = cp.contract_id
    JOIN public.participants p ON cp.participant_id = p.id
    WHERE c.id = signatures.contract_id
    AND p.user_id = auth.uid()
  )
);

-- 3. Allow admins to perform any action on signatures.
CREATE POLICY "Admins have full access to signatures."
ON public.signatures FOR ALL
USING ( get_my_role() = 'admin' )
WITH CHECK ( get_my_role() = 'admin' );
