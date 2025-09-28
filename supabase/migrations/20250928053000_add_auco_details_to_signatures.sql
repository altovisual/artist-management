-- Agregar columnas adicionales para datos detallados de Auco
ALTER TABLE public.signatures 
ADD COLUMN IF NOT EXISTS document_name TEXT,
ADD COLUMN IF NOT EXISTS creator_email TEXT,
ADD COLUMN IF NOT EXISTS signer_name TEXT,
ADD COLUMN IF NOT EXISTS signer_phone TEXT,
ADD COLUMN IF NOT EXISTS signature_platform TEXT DEFAULT 'Email',
ADD COLUMN IF NOT EXISTS signature_location TEXT,
ADD COLUMN IF NOT EXISTS reading_time TEXT,
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_signatures_document_name ON public.signatures(document_name);
CREATE INDEX IF NOT EXISTS idx_signatures_creator_email ON public.signatures(creator_email);
CREATE INDEX IF NOT EXISTS idx_signatures_signer_name ON public.signatures(signer_name);
CREATE INDEX IF NOT EXISTS idx_signatures_signed_at ON public.signatures(signed_at);

-- Comentarios para documentar las nuevas columnas
COMMENT ON COLUMN public.signatures.document_name IS 'Nombre del documento en Auco';
COMMENT ON COLUMN public.signatures.creator_email IS 'Email del creador del documento';
COMMENT ON COLUMN public.signatures.signer_name IS 'Nombre del firmante según Auco';
COMMENT ON COLUMN public.signatures.signer_phone IS 'Teléfono del firmante';
COMMENT ON COLUMN public.signatures.signature_platform IS 'Plataforma usada para firmar (Email, SMS, etc.)';
COMMENT ON COLUMN public.signatures.signature_location IS 'Ubicación donde se firmó el documento';
COMMENT ON COLUMN public.signatures.reading_time IS 'Tiempo de lectura del documento';
COMMENT ON COLUMN public.signatures.signed_at IS 'Fecha y hora exacta de la firma según Auco';
