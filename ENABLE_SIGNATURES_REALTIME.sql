-- Enable Realtime for signatures table
-- This allows the app to receive notifications when contracts are signed

-- 1. Enable Realtime publication for signatures table
ALTER PUBLICATION supabase_realtime ADD TABLE signatures;

-- 2. Verify Realtime is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'signatures';

-- 3. Check current publications
SELECT * FROM pg_publication_tables WHERE tablename = 'signatures';

-- 4. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON signatures TO authenticated;
GRANT SELECT, INSERT, UPDATE ON signatures TO anon;

-- 5. Enable Row Level Security if not already enabled
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- 6. Create or update RLS policies for signatures
-- Allow authenticated users to see all signatures
DROP POLICY IF EXISTS "Users can view all signatures" ON signatures;
CREATE POLICY "Users can view all signatures" 
ON signatures FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to update signatures (for webhook updates)
DROP POLICY IF EXISTS "Users can update signatures" ON signatures;
CREATE POLICY "Users can update signatures" 
ON signatures FOR UPDATE 
TO authenticated 
USING (true);

-- 7. Verify the setup
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'signatures';

-- Instructions:
-- 1. Copy and paste this entire SQL into Supabase SQL Editor
-- 2. Click "Run" to execute
-- 3. Verify that all commands executed successfully
-- 4. Check that the table appears in Database > Replication settings
-- 5. Test by signing a contract and checking if notification appears

-- Note: If you see "publication already exists" errors, that's OK - it means it's already enabled
