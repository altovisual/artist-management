-- ========================================
-- FIX: Update document_name for signatures
-- ========================================
-- Problema: document_name es NULL, por eso no se muestran en la UI

-- 1. Ver el estado actual
SELECT 
  s.id,
  s.document_name,
  s.signature_request_id,
  s.signer_email,
  s.status,
  c.internal_reference,
  p.name as project_name
FROM public.signatures s
LEFT JOIN public.contracts c ON s.contract_id = c.id
LEFT JOIN public.projects p ON c.project_id = p.id
ORDER BY s.created_at DESC
LIMIT 10;

-- 2. Actualizar document_name basándose en el contrato
UPDATE public.signatures s
SET document_name = COALESCE(
  'Contrato: ' || p.name,
  'Contrato: ' || c.internal_reference,
  'Documento ' || s.signature_request_id
)
FROM public.contracts c
LEFT JOIN public.projects p ON c.project_id = p.id
WHERE s.contract_id = c.id
AND s.document_name IS NULL;

-- 3. Para signatures sin contrato asociado, usar el código de Auco
UPDATE public.signatures
SET document_name = 'Documento ' || signature_request_id
WHERE document_name IS NULL;

-- 4. Verificar que se actualizaron
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN document_name IS NOT NULL THEN 1 END) as with_name,
  COUNT(CASE WHEN document_name IS NULL THEN 1 END) as without_name
FROM public.signatures;

-- 5. Ver los documentos actualizados
SELECT 
  id,
  document_name,
  signer_email,
  signature_request_id,
  status,
  created_at
FROM public.signatures
ORDER BY created_at DESC
LIMIT 10;
