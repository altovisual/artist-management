-- =====================================================
-- Agregar columna 'hidden' para soft delete
-- =====================================================
-- Permite ocultar registros sin eliminarlos permanentemente

-- Agregar columna hidden a artist_statements
ALTER TABLE public.artist_statements 
ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;

-- Agregar columna hidden a statement_transactions
ALTER TABLE public.statement_transactions 
ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_artist_statements_hidden 
ON public.artist_statements(hidden) WHERE hidden = FALSE;

CREATE INDEX IF NOT EXISTS idx_statement_transactions_hidden 
ON public.statement_transactions(hidden) WHERE hidden = FALSE;

-- Actualizar políticas RLS para filtrar registros ocultos automáticamente
-- (Los admins pueden ver todos, los usuarios normales solo los no ocultos)

-- Política para artist_statements
DROP POLICY IF EXISTS "Enable read for owners and admins on artist_statements" ON public.artist_statements;

CREATE POLICY "Enable read for owners and admins on artist_statements" 
ON public.artist_statements
FOR SELECT
USING (
  (
    -- Admins ven todo
    public.is_admin()
  ) OR (
    -- Usuarios normales solo ven los no ocultos de sus artistas
    (hidden = FALSE OR hidden IS NULL) AND
    EXISTS (
      SELECT 1 FROM public.artists 
      WHERE artists.id = artist_statements.artist_id 
      AND artists.user_id = auth.uid()
    )
  )
);

-- Política para statement_transactions
DROP POLICY IF EXISTS "Enable read for owners and admins on statement_transactions" ON public.statement_transactions;

CREATE POLICY "Enable read for owners and admins on statement_transactions" 
ON public.statement_transactions
FOR SELECT
USING (
  (
    -- Admins ven todo
    public.is_admin()
  ) OR (
    -- Usuarios normales solo ven los no ocultos de sus artistas
    (hidden = FALSE OR hidden IS NULL) AND
    EXISTS (
      SELECT 1 FROM public.artists 
      WHERE artists.id = statement_transactions.artist_id 
      AND artists.user_id = auth.uid()
    )
  )
);

-- Comentarios
COMMENT ON COLUMN public.artist_statements.hidden IS 'Soft delete: TRUE oculta el registro sin eliminarlo';
COMMENT ON COLUMN public.statement_transactions.hidden IS 'Soft delete: TRUE oculta el registro sin eliminarlo';
