-- Add INSERT policy for participants
-- Allow admins to create participants (the existing ALL policy should cover this, but let's be explicit)
-- Also allow users to create participant records for themselves

-- Allow users to create their own participant record
CREATE POLICY "Users can create their own participant record."
ON public.participants FOR INSERT
WITH CHECK ( auth.uid() = user_id OR user_id IS NULL );

-- Note: The existing "Admins have full access to participants." policy with FOR ALL 
-- should already cover INSERT for admins, but if there are issues, we can add:
-- CREATE POLICY "Admins can create any participant."
-- ON public.participants FOR INSERT
-- WITH CHECK ( get_my_role() = 'admin' );
