-- MIGRATION: 036_add_analytics_module_tables
-- DESCRIPTION: Extends distribution_accounts and creates streaming_analytics table for Module 2.

-- 1. Extend 'distribution_accounts' table for API integration capabilities
ALTER TABLE public.distribution_accounts
ADD COLUMN analytics_status TEXT DEFAULT 'disconnected' NOT NULL CHECK (analytics_status IN ('connected', 'disconnected', 'error')),
ADD COLUMN access_token TEXT,
ADD COLUMN refresh_token TEXT,
ADD COLUMN token_expires_at TIMESTAMPTZ,
ADD COLUMN last_synced_at TIMESTAMPTZ;

COMMENT ON COLUMN public.distribution_accounts.analytics_status IS 'The status of the analytics connection for this account.';
COMMENT ON COLUMN public.distribution_accounts.access_token IS 'Encrypted API access token provided by the external service.';
COMMENT ON COLUMN public.distribution_accounts.refresh_token IS 'Encrypted API refresh token for re-authenticating.';
COMMENT ON COLUMN public.distribution_accounts.token_expires_at IS 'Timestamp for when the current access token expires.';
COMMENT ON COLUMN public.distribution_accounts.last_synced_at IS 'Timestamp of the last successful data sync.';


-- 2. Create new 'streaming_analytics' table to store time-series metric data
CREATE TABLE public.streaming_analytics (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.distribution_accounts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    date DATE NOT NULL,
    streams BIGINT DEFAULT 0,
    listeners BIGINT DEFAULT 0,
    followers BIGINT DEFAULT 0,
    source_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Ensures one entry per artist, per platform, per day to avoid duplication
    CONSTRAINT unique_daily_analytic UNIQUE (artist_id, platform, date)
);

COMMENT ON TABLE public.streaming_analytics IS 'Stores historical streaming data fetched from platform APIs like Spotify.';
COMMENT ON COLUMN public.streaming_analytics.account_id IS 'FK to the specific distribution account this data was fetched from.';
