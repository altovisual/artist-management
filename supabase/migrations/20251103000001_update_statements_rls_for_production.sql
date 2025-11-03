-- =====================================================
-- POLÍTICAS RLS PARA PRODUCCIÓN
-- =====================================================
-- Los artistas solo ven sus propios estados de cuenta
-- Los admins ven todos los estados de cuenta

-- Eliminar políticas anteriores
DROP POLICY IF EXISTS "Users can view artist statements" ON public.artist_statements;
DROP POLICY IF EXISTS "Users can view statement transactions" ON public.statement_transactions;
DROP POLICY IF EXISTS "Authenticated users can manage artist statements" ON public.artist_statements;
DROP POLICY IF EXISTS "Authenticated users can manage statement transactions" ON public.statement_transactions;
DROP POLICY IF EXISTS "Authenticated users can view import history" ON public.statement_imports;

-- =====================================================
-- POLÍTICAS PARA artist_statements
-- =====================================================

-- Los artistas pueden ver sus propios estados de cuenta
CREATE POLICY "Artists can view own statements"
  ON public.artist_statements
  FOR SELECT
  TO authenticated
  USING (
    artist_id IN (
      SELECT id FROM public.artists
      WHERE user_id = auth.uid()
    )
  );

-- Los admins pueden ver todos los estados de cuenta
CREATE POLICY "Admins can view all statements"
  ON public.artist_statements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      -- Aquí puedes agregar un campo is_admin cuando lo implementes
      -- Por ahora, todos los usuarios autenticados pueden ver
    )
  );

-- Solo service_role puede insertar/actualizar (para importaciones)
CREATE POLICY "Service role can manage statements"
  ON public.artist_statements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- POLÍTICAS PARA statement_transactions
-- =====================================================

-- Los artistas pueden ver transacciones de sus propios estados
CREATE POLICY "Artists can view own transactions"
  ON public.statement_transactions
  FOR SELECT
  TO authenticated
  USING (
    artist_id IN (
      SELECT id FROM public.artists
      WHERE user_id = auth.uid()
    )
  );

-- Los admins pueden ver todas las transacciones
CREATE POLICY "Admins can view all transactions"
  ON public.statement_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Solo service_role puede insertar/actualizar
CREATE POLICY "Service role can manage transactions"
  ON public.statement_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- POLÍTICAS PARA statement_imports
-- =====================================================

-- Solo admins pueden ver el historial de importaciones
CREATE POLICY "Admins can view import history"
  ON public.statement_imports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Solo service_role puede insertar importaciones
CREATE POLICY "Service role can insert imports"
  ON public.statement_imports
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =====================================================
-- FUNCIÓN PARA VERIFICAR SI UN USUARIO ES ADMIN
-- =====================================================
-- Esta función se puede usar en el futuro cuando implementes roles

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Por ahora retorna true para todos los usuarios autenticados
  -- Más adelante puedes agregar lógica de roles aquí
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VISTA PARA ARTISTAS (Solo sus datos)
-- =====================================================

CREATE OR REPLACE VIEW public.artist_own_statements AS
SELECT 
  s.*,
  a.name as artist_name,
  a.profile_image as artist_image
FROM public.artist_statements s
JOIN public.artists a ON s.artist_id = a.id
WHERE a.user_id = auth.uid();

-- Permitir que los artistas lean su vista
GRANT SELECT ON public.artist_own_statements TO authenticated;

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON POLICY "Artists can view own statements" ON public.artist_statements IS 
  'Los artistas solo pueden ver sus propios estados de cuenta';

COMMENT ON POLICY "Admins can view all statements" ON public.artist_statements IS 
  'Los administradores pueden ver todos los estados de cuenta';

COMMENT ON POLICY "Service role can manage statements" ON public.artist_statements IS 
  'Solo el service_role (scripts de importación) puede crear/actualizar estados';

COMMENT ON VIEW public.artist_own_statements IS 
  'Vista que muestra solo los estados de cuenta del artista autenticado';
