DROP FUNCTION IF EXISTS public.get_all_users();

create or replace function get_all_users()
returns table (id uuid, email text, role text)
as $$
begin
  -- This function should only be callable by authenticated admins.
  -- RLS policies on the auth.users table will enforce this.
  if get_my_role() <> 'admin' then
    raise exception 'Only admins can call this function.';
  end if;

  return query
    select u.id, u.email::text, (u.raw_app_meta_data ->> 'role')::text as role
    from auth.users u;
end;
$$ language plpgsql security definer;

-- Grant execute permission to the authenticated role
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;