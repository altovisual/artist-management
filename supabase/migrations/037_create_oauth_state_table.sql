-- MIGRATION: 037_create_oauth_state_table
-- DESCRIPTION: Creates a table to store temporary state for OAuth2 flows to prevent CSRF and link users.

CREATE TABLE public.oauth_state (
    -- The random state value we generate and pass to the provider.
    -- We will use this value to look up the user who initiated the flow.
    state UUID PRIMARY KEY,

    -- The ID of the user from the auth.users table who initiated the flow.
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Timestamp for when the state was created for potential cleanup.
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.oauth_state IS 'Stores temporary state values for OAuth2 authorization flows to prevent CSRF attacks and link users to their final tokens.';
