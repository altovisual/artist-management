
CREATE TABLE public.oauth_state (
    state TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    distribution_account_id UUID REFERENCES public.distribution_accounts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.oauth_state IS 'Stores temporary state values for OAuth 2.0 flows to prevent CSRF attacks.';

CREATE INDEX ON public.oauth_state (created_at);
