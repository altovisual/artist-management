-- ========================================
-- FIX: User Management Page
-- ========================================
-- Para que la página /admin/users funcione correctamente

-- 1. Eliminar función existente primero
DROP FUNCTION IF EXISTS public.get_all_users();

-- 2. Crear función get_all_users
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    COALESCE(au.raw_app_meta_data->>'role', 'user')::TEXT as role
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- 3. Grant permisos
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;

-- 4. Verificar que tu usuario sea admin
-- REEMPLAZA 'tu-email@ejemplo.com' con tu email real
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'altovisual.ve@gmail.com'; -- CAMBIA ESTO POR TU EMAIL

-- 5. Verificar resultado
SELECT 
  id,
  email,
  raw_app_meta_data->>'role' as role
FROM auth.users
WHERE email = 'altovisual.ve@gmail.com'; -- CAMBIA ESTO POR TU EMAIL
