-- ========================================
-- DIAGNOSE ADMIN ROLE ISSUE
-- ========================================

-- 1. Ver el estado actual de tu usuario
SELECT 
  id,
  email,
  raw_app_meta_data,
  raw_app_meta_data->>'role' as role_extracted,
  created_at
FROM auth.users 
WHERE email = 'altovisual.ve@gmail.com';

-- 2. Forzar actualización del rol (método alternativo)
UPDATE auth.users 
SET raw_app_meta_data = 
  CASE 
    WHEN raw_app_meta_data IS NULL THEN '{"role": "admin"}'::jsonb
    ELSE jsonb_set(raw_app_meta_data, '{role}', '"admin"')
  END
WHERE email = 'altovisual.ve@gmail.com';

-- 3. Verificar que se actualizó
SELECT 
  email,
  raw_app_meta_data,
  raw_app_meta_data->>'role' as role_value
FROM auth.users 
WHERE email = 'altovisual.ve@gmail.com';

-- 4. Probar la función is_admin() directamente
SELECT 
  auth.uid() as current_user_id,
  (auth.jwt()->>'app_metadata')::jsonb->>'role' as jwt_role,
  is_admin() as is_admin_result;

-- 5. Ver todos los usuarios y sus roles (para comparar)
SELECT 
  email,
  raw_app_meta_data->>'role' as role
FROM auth.users
ORDER BY created_at;
