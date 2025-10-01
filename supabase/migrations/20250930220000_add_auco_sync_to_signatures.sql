-- Add Auco sync fields to signatures table
-- This allows syncing signatures from Auco to our database

-- Add auco_document_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'signatures' AND column_name = 'auco_document_id'
  ) THEN
    ALTER TABLE signatures ADD COLUMN auco_document_id TEXT UNIQUE;
    CREATE INDEX idx_signatures_auco_document_id ON signatures(auco_document_id);
  END IF;
END $$;

-- Add metadata column for storing additional Auco data
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'signatures' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE signatures ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add signer_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'signatures' AND column_name = 'signer_name'
  ) THEN
    ALTER TABLE signatures ADD COLUMN signer_name TEXT;
  END IF;
END $$;

-- Add document_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'signatures' AND column_name = 'document_url'
  ) THEN
    ALTER TABLE signatures ADD COLUMN document_url TEXT;
  END IF;
END $$;

-- Add signed_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'signatures' AND column_name = 'signed_at'
  ) THEN
    ALTER TABLE signatures ADD COLUMN signed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create function to automatically sync from Auco on webhook
CREATE OR REPLACE FUNCTION sync_signature_from_auco()
RETURNS TRIGGER AS $$
BEGIN
  -- When a signature is updated with auco_document_id, mark it as synced
  IF NEW.auco_document_id IS NOT NULL THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-sync
DROP TRIGGER IF EXISTS trigger_sync_signature_from_auco ON signatures;
CREATE TRIGGER trigger_sync_signature_from_auco
  BEFORE UPDATE ON signatures
  FOR EACH ROW
  EXECUTE FUNCTION sync_signature_from_auco();

-- Add comment to table
COMMENT ON COLUMN signatures.auco_document_id IS 'Auco document ID for syncing';
COMMENT ON COLUMN signatures.metadata IS 'Additional Auco metadata (status, dates, etc)';
COMMENT ON COLUMN signatures.signer_name IS 'Name of the person signing';
COMMENT ON COLUMN signatures.document_url IS 'URL to download signed document';
COMMENT ON COLUMN signatures.signed_at IS 'Timestamp when document was signed';
