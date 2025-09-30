-- =====================================================
-- MIGRACIONES NECESARIAS PARA TEAM WORKSPACE
-- Ejecutar en SQL Editor de Supabase Dashboard
-- =====================================================

-- =====================================================
-- 1. FIX: Función get_available_users
-- =====================================================

DROP FUNCTION IF EXISTS get_available_users();

CREATE OR REPLACE FUNCTION get_available_users()
RETURNS TABLE (
  id UUID,
  email TEXT,  -- Cambiado a TEXT para coincidir con auth.users
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
    u.email::TEXT,  -- Cast explícito a TEXT
    COALESCE(u.raw_user_meta_data->>'name', u.email::TEXT) as name,
    u.raw_user_meta_data->>'avatar_url' as avatar,
    EXISTS(SELECT 1 FROM team_members tm WHERE tm.id = u.id) as is_team_member
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_available_users() TO authenticated;

-- =====================================================
-- 2. CREATE: Tabla project_tasks
-- =====================================================

CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee_id ON public.project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON public.project_tasks(status);

-- Enable RLS
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. RLS POLICIES: project_tasks
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to view tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Allow authenticated users to create tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Allow users to update tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Allow users to delete tasks" ON public.project_tasks;

-- Create new policies
CREATE POLICY "Allow authenticated users to view tasks"
  ON public.project_tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to create tasks"
  ON public.project_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to update tasks"
  ON public.project_tasks
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to delete tasks"
  ON public.project_tasks
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- 4. TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_project_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_tasks_updated_at ON public.project_tasks;

CREATE TRIGGER project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_tasks_updated_at();

-- =====================================================
-- 5. VERIFICACIÓN
-- =====================================================

-- Verificar que la función funciona
SELECT 'Testing get_available_users...' as test;
SELECT COUNT(*) as user_count FROM get_available_users();

-- Verificar que la tabla existe
SELECT 'Testing project_tasks table...' as test;
SELECT COUNT(*) as task_count FROM project_tasks;

-- Mostrar estructura
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'project_tasks'
ORDER BY ordinal_position;

SELECT '✅ All migrations applied successfully!' as status;
