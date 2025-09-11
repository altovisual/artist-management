CREATE OR REPLACE FUNCTION get_all_participants()
RETURNS SETOF participants AS $$
  SELECT * FROM public.participants;
$$ LANGUAGE sql;
