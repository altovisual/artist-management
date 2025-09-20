-- Drop the old insecure policy on the contracts table
DROP POLICY IF EXISTS "Allow read access to all users" ON public.contracts;

-- Create a new policy that allows users to see contracts they are a part of
CREATE POLICY "Users can view contracts they are a part of"
ON public.contracts
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.participants p
    JOIN public.contract_participants cp ON p.id = cp.participant_id
    WHERE cp.contract_id = contracts.id
    AND p.user_id = auth.uid()
  )
);

-- Create secure policies for INSERT, UPDATE, DELETE
-- Only users with the 'admin' role can perform these actions.
CREATE POLICY "Allow admin to insert new contracts"
ON public.contracts
FOR INSERT
WITH CHECK ( get_my_role() = 'admin' );


CREATE POLICY "Allow admin to update contracts"
ON public.contracts
FOR UPDATE
USING ( get_my_role() = 'admin' );


CREATE POLICY "Allow admin to delete contracts"
ON public.contracts
FOR DELETE
USING ( get_my_role() = 'admin' );