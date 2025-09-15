-- Create a view in the public schema to expose auth.users data
CREATE OR REPLACE VIEW public.users_view AS
SELECT
    id,
    email,
    raw_user_meta_data
FROM
    auth.users;

-- Grant usage on the schema to the anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on the view to the anon and authenticated roles
GRANT SELECT ON TABLE public.users_view TO anon, authenticated;

-- Notify PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';