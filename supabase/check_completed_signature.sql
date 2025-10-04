-- Ver datos completos del documento PRUEBA2 (completado)
SELECT 
  id,
  document_name,
  signer_email,
  signer_name,
  status,
  signature_platform,
  signature_location,
  reading_time,
  signed_at,
  created_at
FROM public.signatures
WHERE status = 'completed'
ORDER BY created_at DESC
LIMIT 5;
