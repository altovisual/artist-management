
ALTER TABLE public.distribution_accounts
ADD COLUMN access_token TEXT,
ADD COLUMN refresh_token TEXT,
ADD COLUMN token_expires_at TIMESTAMPTZ,
ADD COLUMN analytics_status TEXT DEFAULT 'disconnected',
ADD COLUMN last_synced_at TIMESTAMPTZ;

COMMENT ON COLUMN public.distribution_accounts.access_token IS 'Encrypted Spotify access token.';
COMMENT ON COLUMN public.distribution_accounts.refresh_token IS 'Encrypted Spotify refresh token.';
COMMENT ON COLUMN public.distribution_accounts.analytics_status IS 'The status of the analytics integration (e.g., connected, disconnected, error).';
