-- ========================================
-- CLEAN OLD SIGNATURES
-- ========================================
-- Este script limpia documentos antiguos que ya no existen en Auco

-- 1. Ver cuántos documentos tienes actualmente
SELECT 
  COUNT(*) as total_signatures,
  COUNT(DISTINCT signature_request_id) as unique_documents,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent
FROM public.signatures;

-- 2. Ver los documentos más antiguos (probablemente los que ya no existen en Auco)
SELECT 
  signature_request_id,
  document_name,
  signer_email,
  status,
  created_at,
  EXTRACT(DAY FROM NOW() - created_at) as days_old
FROM public.signatures
ORDER BY created_at ASC
LIMIT 20;

-- 3. OPCIONAL: Eliminar documentos más antiguos de 30 días
-- Descomenta las siguientes líneas si quieres limpiar documentos viejos:

-- DELETE FROM public.signatures
-- WHERE created_at < NOW() - INTERVAL '30 days';

-- 4. OPCIONAL: Eliminar TODOS los documentos antiguos y empezar de cero
-- ⚠️ CUIDADO: Esto eliminará TODOS los registros de signatures
-- Descomenta solo si estás seguro:

-- TRUNCATE TABLE public.signatures CASCADE;

-- 5. Verificar después de limpiar
SELECT 
  COUNT(*) as remaining_signatures
FROM public.signatures;
