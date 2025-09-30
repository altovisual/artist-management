-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert plays" ON shareable_track_plays;
DROP POLICY IF EXISTS "Anyone can update plays" ON shareable_track_plays;
DROP POLICY IF EXISTS "Anyone can view plays" ON shareable_track_plays;

-- Create new policies that work for anonymous users
CREATE POLICY "Enable insert for anonymous users"
ON shareable_track_plays FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Enable update for anonymous users"
ON shareable_track_plays FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable select for anonymous users"
ON shareable_track_plays FOR SELECT
TO anon
USING (true);

-- Also allow for authenticated users
CREATE POLICY "Enable insert for authenticated users"
ON shareable_track_plays FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON shareable_track_plays FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users"
ON shareable_track_plays FOR SELECT
TO authenticated
USING (true);
