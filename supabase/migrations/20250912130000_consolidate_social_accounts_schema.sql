-- Add all missing columns to the social_accounts table
ALTER TABLE public.social_accounts
ADD COLUMN IF NOT EXISTS handle TEXT,
ADD COLUMN IF NOT EXISTS password_encrypted TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Add a trigger to automatically update the updated_at column on row update
-- We drop it first to avoid errors if it already exists.
DROP TRIGGER IF EXISTS set_social_accounts_timestamp ON public.social_accounts;
CREATE TRIGGER set_social_accounts_timestamp
BEFORE UPDATE ON public.social_accounts
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
