-- This function may already exist, so we use CREATE OR REPLACE
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add all missing columns to the distribution_accounts table
ALTER TABLE public.distribution_accounts
ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS service TEXT,
ADD COLUMN IF NOT EXISTS provider TEXT;

-- Add a trigger to automatically update the updated_at column on row update
-- We drop it first to avoid errors if it already exists from a previous failed migration.
DROP TRIGGER IF EXISTS set_distribution_accounts_timestamp ON public.distribution_accounts;
CREATE TRIGGER set_distribution_accounts_timestamp
BEFORE UPDATE ON public.distribution_accounts
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
