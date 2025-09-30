-- =====================================================
-- FIX: Tipos de datos en get_available_users
-- =====================================================

DROP FUNCTION IF EXISTS get_available_users();

CREATE OR REPLACE FUNCTION get_available_users()
RETURNS TABLE (
  id UUID,
  email VARCHAR(255),  -- Cambiado de TEXT a VARCHAR(255)
  name TEXT,
  avatar TEXT,
  is_team_member BOOLEAN
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email::VARCHAR(255),  -- Cast explícito
    COALESCE(u.raw_user_meta_data->>'name', u.email) as name,
    u.raw_user_meta_data->>'avatar_url' as avatar,
    EXISTS(SELECT 1 FROM team_members tm WHERE tm.id = u.id) as is_team_member
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_available_users() TO authenticated;

-- Verificar
SELECT * FROM get_available_users() LIMIT 3;
