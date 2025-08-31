-- Drop the old function if it exists, just in case.
DROP FUNCTION IF EXISTS public.get_all_users();

-- Re-create the function with the correct return types.
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (id uuid, email text, role text)
AS $$
BEGIN
  -- This function should only be callable by authenticated admins.
  IF get_my_role() <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can call this function.';
  END IF;

  RETURN QUERY
    SELECT u.id, u.email::text, (u.raw_app_meta_data ->> 'role')::text AS role
    FROM auth.users u;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the authenticated role
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;