-- ========================================
-- SET ADMIN ROLE FOR USER
-- ========================================
-- Run this AFTER running fix_get_my_role_and_policies.sql

-- Set admin role for your user
UPDATE auth.users 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'altovisual.ve@gmail.com';

-- Verify the role was set
SELECT 
  id,
  email,
  raw_app_meta_data->>'role' as role,
  created_at
FROM auth.users 
WHERE email = 'altovisual.ve@gmail.com';

-- Test the is_admin() function (should return true after setting role)
-- Note: You may need to log out and log back in for JWT to refresh
SELECT is_admin() as am_i_admin;
