ALTER TABLE public.distribution_accounts
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS analytics_status TEXT DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

COMMENT ON COLUMN public.distribution_accounts.access_token IS 'Encrypted Spotify access token.';
COMMENT ON COLUMN public.distribution_accounts.refresh_token IS 'Encrypted Spotify refresh token.';
COMMENT ON COLUMN public.distribution_accounts.analytics_status IS 'The status of the analytics integration (e.g., connected, disconnected, error).';