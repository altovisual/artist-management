-- ============================================
-- ARREGLAR RLS POLICIES PARA ARTISTS
-- ============================================
-- Este script arregla los permisos para que los usuarios puedan crear artistas

-- Ver las policies actuales
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'artists';

-- Eliminar policies existentes que puedan estar causando problemas
DROP POLICY IF EXISTS "Users can create artists" ON public.artists;
DROP POLICY IF EXISTS "Users can view artists" ON public.artists;
DROP POLICY IF EXISTS "Users can update their artists" ON public.artists;
DROP POLICY IF EXISTS "Artists can view their own artist profile" ON public.artists;

-- Crear nuevas policies que permitan a los usuarios crear y gestionar artistas

-- 1. Permitir a usuarios autenticados crear artistas
CREATE POLICY "Authenticated users can create artists"
ON public.artists
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Permitir a usuarios ver artistas
CREATE POLICY "Authenticated users can view artists"
ON public.artists
FOR SELECT
TO authenticated
USING (
    -- Pueden ver su propio artista
    auth.uid() = user_id
    OR
    -- O si son managers (tienen user_type = 'manager')
    auth.uid() IN (
        SELECT user_id FROM public.user_profiles WHERE user_type = 'manager'
    )
);

-- 3. Permitir a usuarios actualizar sus propios artistas
CREATE POLICY "Users can update their own artists"
ON public.artists
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Permitir a usuarios eliminar sus propios artistas (opcional)
CREATE POLICY "Users can delete their own artists"
ON public.artists
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verificar que las policies se crearon correctamente
SELECT 
    'POLICIES CREADAS' as status,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'artists'
ORDER BY cmd, policyname;

-- Verificar que RLS está habilitado
SELECT 
    'RLS STATUS' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'artists';
