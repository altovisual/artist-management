-- =====================================================
-- FIX: Corregir función get_available_users
-- =====================================================
-- El problema es que auth.users.email es VARCHAR(255) no TEXT
-- Necesitamos hacer un CAST explícito

DROP FUNCTION IF EXISTS get_available_users();

CREATE OR REPLACE FUNCTION get_available_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  avatar TEXT,
  is_team_member BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email::TEXT,  -- CAST explícito a TEXT
    COALESCE(u.raw_user_meta_data->>'name', u.email)::TEXT as name,  -- CAST explícito
    (u.raw_user_meta_data->>'avatar_url')::TEXT as avatar,  -- CAST explícito
    EXISTS(SELECT 1 FROM team_members tm WHERE tm.id = u.id) as is_team_member
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que funciona
SELECT * FROM get_available_users();
