-- =====================================================
-- VERIFICAR FUNCIONES EXISTENTES
-- =====================================================

-- 1. Ver todas las funciones en el schema public
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%available%'
ORDER BY routine_name;

-- 2. Ver detalles de la función get_available_users
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type,
  p.prosecdef as security_definer
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'get_available_users';

-- 3. Ver permisos de la función
SELECT 
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'get_available_users'
  AND routine_schema = 'public';
