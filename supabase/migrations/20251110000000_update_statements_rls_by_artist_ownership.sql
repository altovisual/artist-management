-- =====================================================
-- ACTUALIZACIÓN DE POLÍTICAS RLS PARA ESTADOS DE CUENTA
-- =====================================================
-- Los usuarios solo ven estados de cuenta de SUS artistas
-- Los admins siguen viendo todo
-- Fecha: 2025-11-10

-- =====================================================
-- 1. ELIMINAR POLÍTICAS ANTERIORES
-- =====================================================

DROP POLICY IF EXISTS "Artists can view own statements" ON public.artist_statements;
DROP POLICY IF EXISTS "Admins can view all statements" ON public.artist_statements;
DROP POLICY IF EXISTS "Service role can manage statements" ON public.artist_statements;

DROP POLICY IF EXISTS "Artists can view own transactions" ON public.statement_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.statement_transactions;
DROP POLICY IF EXISTS "Service role can manage transactions" ON public.statement_transactions;

DROP POLICY IF EXISTS "Admins can view import history" ON public.statement_imports;
DROP POLICY IF EXISTS "Service role can insert imports" ON public.statement_imports;

-- =====================================================
-- 2. NUEVAS POLÍTICAS PARA artist_statements
-- =====================================================
-- NOTA: Usamos la función is_admin() que ya existe en el sistema

-- Los usuarios pueden ver estados de cuenta de artistas que les pertenecen
CREATE POLICY "Users can view own artist statements"
  ON public.artist_statements
  FOR SELECT
  TO authenticated
  USING (
    -- El usuario es dueño del artista
    artist_id IN (
      SELECT id FROM public.artists
      WHERE user_id = auth.uid()
    )
    OR
    -- O es admin
    public.is_admin()
  );

-- Solo service_role puede insertar/actualizar (para importaciones)
CREATE POLICY "Service role can manage statements"
  ON public.artist_statements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. NUEVAS POLÍTICAS PARA statement_transactions
-- =====================================================

-- Los usuarios pueden ver transacciones de artistas que les pertenecen
CREATE POLICY "Users can view own artist transactions"
  ON public.statement_transactions
  FOR SELECT
  TO authenticated
  USING (
    -- El usuario es dueño del artista
    artist_id IN (
      SELECT id FROM public.artists
      WHERE user_id = auth.uid()
    )
    OR
    -- O es admin
    public.is_admin()
  );

-- Solo service_role puede insertar/actualizar
CREATE POLICY "Service role can manage transactions"
  ON public.statement_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. NUEVAS POLÍTICAS PARA statement_imports
-- =====================================================

-- Solo admins pueden ver el historial de importaciones
CREATE POLICY "Only admins can view import history"
  ON public.statement_imports
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Solo service_role puede insertar importaciones
CREATE POLICY "Service role can insert imports"
  ON public.statement_imports
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =====================================================
-- 5. ACTUALIZAR VISTA PARA ARTISTAS
-- =====================================================

-- Recrear la vista para que use las nuevas políticas
DROP VIEW IF EXISTS public.artist_own_statements;

CREATE OR REPLACE VIEW public.artist_own_statements AS
SELECT 
  s.*,
  a.name as artist_name,
  a.profile_image as artist_image
FROM public.artist_statements s
JOIN public.artists a ON s.artist_id = a.id
WHERE a.user_id = auth.uid();

-- Permitir que los usuarios autenticados lean su vista
GRANT SELECT ON public.artist_own_statements TO authenticated;

-- =====================================================
-- 6. COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON POLICY "Users can view own artist statements" ON public.artist_statements IS 
  'Los usuarios solo pueden ver estados de cuenta de artistas que les pertenecen (artists.user_id = auth.uid()) o si son admins';

COMMENT ON POLICY "Users can view own artist transactions" ON public.statement_transactions IS 
  'Los usuarios solo pueden ver transacciones de artistas que les pertenecen (artists.user_id = auth.uid()) o si son admins';

COMMENT ON POLICY "Only admins can view import history" ON public.statement_imports IS 
  'Solo los administradores pueden ver el historial de importaciones';

COMMENT ON VIEW public.artist_own_statements IS 
  'Vista que muestra solo los estados de cuenta de artistas que pertenecen al usuario autenticado';

-- =====================================================
-- 7. VERIFICACIÓN DE SEGURIDAD
-- =====================================================

-- Esta query debe retornar solo los artistas del usuario actual
-- SELECT * FROM artist_own_statements;

-- Esta query debe retornar solo transacciones de artistas del usuario
-- SELECT * FROM statement_transactions WHERE artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid());
