-- ============================================
-- CREAR TABLA ARTIST_MANAGERS
-- ============================================
-- Esta tabla relaciona managers con sus artistas
-- Permite que un manager gestione múltiples artistas
-- y que un artista pueda tener múltiples managers

-- Verificar si la tabla ya existe
SELECT 
    'VERIFICANDO TABLA' as info,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'artist_managers';

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS public.artist_managers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- Manager (usuario con user_type = 'manager')
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Artista que gestiona
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    
    -- Información adicional
    role VARCHAR(100), -- Ej: "Primary Manager", "Co-Manager", "Business Manager"
    permissions JSONB DEFAULT '{"view": true, "edit": false, "finance": false}'::jsonb,
    
    -- Evitar duplicados: un manager no puede estar asignado dos veces al mismo artista
    UNIQUE(manager_id, artist_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_artist_managers_manager_id 
ON public.artist_managers(manager_id);

CREATE INDEX IF NOT EXISTS idx_artist_managers_artist_id 
ON public.artist_managers(artist_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_artist_managers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_artist_managers_updated_at ON public.artist_managers;

CREATE TRIGGER trigger_update_artist_managers_updated_at
    BEFORE UPDATE ON public.artist_managers
    FOR EACH ROW
    EXECUTE FUNCTION update_artist_managers_updated_at();

-- Habilitar RLS
ALTER TABLE public.artist_managers ENABLE ROW LEVEL SECURITY;

-- Policies para artist_managers

-- SELECT: Managers ven sus asignaciones, artistas ven quién los gestiona, admins ven todo
DROP POLICY IF EXISTS "View artist managers based on role" ON public.artist_managers;
CREATE POLICY "View artist managers based on role"
ON public.artist_managers
FOR SELECT
TO authenticated
USING (
    -- Si es admin
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
    OR
    -- Si es el manager
    manager_id = auth.uid()
    OR
    -- Si es el artista
    artist_id IN (
        SELECT id FROM public.artists WHERE user_id = auth.uid()
    )
);

-- INSERT: Solo admins pueden asignar managers a artistas
DROP POLICY IF EXISTS "Only admins can assign managers" ON public.artist_managers;
CREATE POLICY "Only admins can assign managers"
ON public.artist_managers
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
);

-- UPDATE: Solo admins pueden actualizar asignaciones
DROP POLICY IF EXISTS "Only admins can update manager assignments" ON public.artist_managers;
CREATE POLICY "Only admins can update manager assignments"
ON public.artist_managers
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
);

-- DELETE: Solo admins pueden eliminar asignaciones
DROP POLICY IF EXISTS "Only admins can delete manager assignments" ON public.artist_managers;
CREATE POLICY "Only admins can delete manager assignments"
ON public.artist_managers
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver la estructura de la tabla
SELECT 
    'ESTRUCTURA DE LA TABLA' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'artist_managers'
ORDER BY ordinal_position;

-- Ver las policies
SELECT 
    'POLICIES CREADAS' as info,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename = 'artist_managers'
ORDER BY cmd, policyname;

-- Ver índices
SELECT 
    'ÍNDICES CREADOS' as info,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'artist_managers';

-- ============================================
-- EJEMPLO DE USO
-- ============================================

/*
-- Asignar un manager a un artista (solo admins)
INSERT INTO public.artist_managers (manager_id, artist_id, role, permissions)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'manager@ejemplo.com'),
    (SELECT id FROM public.artists WHERE name = 'Nombre del Artista'),
    'Primary Manager',
    '{"view": true, "edit": true, "finance": true}'::jsonb
);

-- Ver todos los artistas de un manager
SELECT 
    a.name as artist_name,
    a.genre,
    am.role as manager_role,
    am.permissions,
    am.created_at as assigned_at
FROM public.artist_managers am
JOIN public.artists a ON am.artist_id = a.id
WHERE am.manager_id = auth.uid()
ORDER BY am.created_at DESC;

-- Ver todos los managers de un artista
SELECT 
    au.email as manager_email,
    up.username as manager_username,
    am.role as manager_role,
    am.permissions,
    am.created_at as assigned_at
FROM public.artist_managers am
JOIN auth.users au ON am.manager_id = au.id
JOIN public.user_profiles up ON am.manager_id = up.user_id
WHERE am.artist_id IN (
    SELECT id FROM public.artists WHERE user_id = auth.uid()
)
ORDER BY am.created_at DESC;
*/
