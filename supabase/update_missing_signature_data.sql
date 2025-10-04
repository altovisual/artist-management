-- ========================================
-- UPDATE: Agregar datos faltantes a signatures completadas
-- ========================================
-- Problema: signature_location y reading_time están NULL
-- Solución: Actualizar con datos de ejemplo o esperar sync de Auco

-- 1. Ver documentos completados sin datos adicionales
SELECT 
  id,
  document_name,
  signer_email,
  status,
  signature_location,
  reading_time,
  signed_at
FROM public.signatures
WHERE status = 'completed'
AND (signature_location IS NULL OR reading_time IS NULL);

-- 2. OPCIÓN A: Actualizar con datos de ejemplo (para testing)
-- Descomenta estas líneas si quieres agregar datos de prueba:

/*
UPDATE public.signatures
SET 
  signature_location = 'Buenos Aires, Argentina',
  reading_time = '2m 30s',
  signature_platform = 'Web Browser'
WHERE status = 'completed'
AND signature_location IS NULL;
*/

-- 3. OPCIÓN B: Marcar para re-sincronización
-- Esto forzará que el próximo sync intente obtener los datos de Auco

-- 4. Verificar después de actualizar
SELECT 
  id,
  document_name,
  signer_email,
  status,
  signature_location,
  reading_time,
  signed_at,
  created_at
FROM public.signatures
WHERE status = 'completed'
ORDER BY created_at DESC;
