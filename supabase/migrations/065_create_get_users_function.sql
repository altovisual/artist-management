CREATE OR REPLACE FUNCTION public.get_all_users_for_app()
RETURNS TABLE (
  id uuid,
  email text,
  raw_user_meta_data jsonb
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, email, raw_user_meta_data FROM auth.users;
$$;

-- Otorgamos permisos para que la API pueda llamar a esta función
GRANT EXECUTE ON FUNCTION public.get_all_users_for_app() TO authenticated;