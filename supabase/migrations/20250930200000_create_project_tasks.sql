-- Create project_tasks table
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee_id ON public.project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON public.project_tasks(status);

-- Enable RLS
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to view all tasks
CREATE POLICY "Allow authenticated users to view tasks"
  ON public.project_tasks
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create tasks
CREATE POLICY "Allow authenticated users to create tasks"
  ON public.project_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update tasks
CREATE POLICY "Allow users to update tasks"
  ON public.project_tasks
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow users to delete tasks
CREATE POLICY "Allow users to delete tasks"
  ON public.project_tasks
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_project_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_tasks_updated_at();
