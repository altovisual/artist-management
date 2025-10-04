-- ========================================
-- ADD: Columna 'archived' a tabla signatures
-- ========================================
-- Para sistema de archivado/eliminación

-- 1. Agregar columna archived (default false)
ALTER TABLE public.signatures
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- 2. Agregar columna deleted_at para soft delete
ALTER TABLE public.signatures
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 3. Crear índice para mejorar performance de queries
CREATE INDEX IF NOT EXISTS idx_signatures_archived 
ON public.signatures(archived) 
WHERE archived = false;

CREATE INDEX IF NOT EXISTS idx_signatures_deleted 
ON public.signatures(deleted_at) 
WHERE deleted_at IS NULL;

-- 4. Verificar estructura actualizada
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'signatures'
AND column_name IN ('archived', 'deleted_at')
ORDER BY ordinal_position;

-- 5. Ver documentos actuales con nuevas columnas
SELECT 
  id,
  document_name,
  status,
  archived,
  deleted_at,
  created_at
FROM public.signatures
ORDER BY created_at DESC
LIMIT 10;
