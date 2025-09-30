-- =====================================================
-- FIX: Permisos para get_available_users
-- =====================================================

-- 1. Eliminar función anterior
DROP FUNCTION IF EXISTS get_available_users();

-- 2. Crear función con permisos correctos
CREATE OR REPLACE FUNCTION get_available_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  avatar TEXT,
  is_team_member BOOLEAN
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as name,
    u.raw_user_meta_data->>'avatar_url' as avatar,
    EXISTS(SELECT 1 FROM team_members tm WHERE tm.id = u.id) as is_team_member
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION get_available_users() TO authenticated;

-- 4. Verificar que funciona
SELECT * FROM get_available_users() LIMIT 5;
