CREATE OR REPLACE FUNCTION get_contracts_with_details(
  is_admin boolean,
  user_id_param uuid
)
RETURNS TABLE (
  id uuid,
  work_id uuid,
  template_id integer,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  work_name text,
  template_type text,
  template_version text,
  participants json
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.work_id,
    c.template_id,
    c.status,
    c.created_at,
    c.updated_at,
    w.name as work_name,
    t.type as template_type,
    t.version as template_version,
    json_agg(json_build_object('id', p.id, 'name', p.name, 'role', cp.role)) as participants
  FROM public.contracts c
  LEFT JOIN public.projects w ON c.work_id = w.id
  LEFT JOIN public.templates t ON c.template_id = t.id
  LEFT JOIN public.contract_participants cp ON c.id = cp.contract_id
  LEFT JOIN public.participants p ON cp.participant_id = p.id
  WHERE is_admin OR c.id IN (
    SELECT contract_id FROM public.contract_participants WHERE participant_id IN (
      SELECT id FROM public.participants WHERE user_id = user_id_param
    )
  )
  GROUP BY c.id, w.name, t.type, t.version;
END;
$$ LANGUAGE plpgsql;