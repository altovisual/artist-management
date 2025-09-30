-- =====================================================
-- SISTEMA DE TEAM MEMBERS CON USUARIOS REALES
-- =====================================================

-- 1. Crear tabla de team_members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ,
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_is_online ON team_members(is_online);

-- 3. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_members_updated_at();

-- 4. RLS Policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver team members
CREATE POLICY "Anyone can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

-- Solo admins pueden insertar nuevos miembros
CREATE POLICY "Admins can insert team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON team_members FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Admins pueden actualizar cualquier perfil
CREATE POLICY "Admins can update any profile"
  ON team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admins pueden eliminar miembros
CREATE POLICY "Admins can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Función para agregar miembro del equipo
CREATE OR REPLACE FUNCTION add_team_member(
  user_email TEXT,
  member_role TEXT DEFAULT 'member'
)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
  user_name TEXT;
  user_avatar TEXT;
BEGIN
  -- Buscar usuario por email en auth.users
  SELECT id, 
         COALESCE(raw_user_meta_data->>'name', email) as name,
         raw_user_meta_data->>'avatar_url' as avatar
  INTO user_id, user_name, user_avatar
  FROM auth.users
  WHERE email = user_email;

  -- Si no existe el usuario, retornar null
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Insertar o actualizar team member
  INSERT INTO team_members (id, name, email, avatar, role, invited_by)
  VALUES (user_id, user_name, user_email, user_avatar, member_role, auth.uid())
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = EXCLUDED.role,
    updated_at = NOW();

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para obtener usuarios disponibles para agregar
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
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as name,
    u.raw_user_meta_data->>'avatar_url' as avatar,
    EXISTS(SELECT 1 FROM team_members tm WHERE tm.id = u.id) as is_team_member
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Insertar usuario actual como admin (si no existe)
INSERT INTO team_members (id, name, email, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', email) as name,
  email,
  'admin'
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) DO NOTHING;

-- 8. Verificar datos
SELECT * FROM team_members ORDER BY created_at DESC;
