-- Function to get the role of the currently authenticated user
create or replace function get_my_role()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'role', '')::text;
$$;