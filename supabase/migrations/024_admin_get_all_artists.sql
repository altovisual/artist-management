-- A security-definer function to get all artists and their related data for the admin dashboard.
-- This bypasses RLS issues with complex JOINs for the admin role.
CREATE OR REPLACE FUNCTION get_all_artists_for_admin()
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Ensure only admins can run this function
    IF get_my_role() <> 'admin' THEN
        RAISE EXCEPTION 'Only admins can call this function.';
    END IF;

    RETURN (
        SELECT json_agg(artist_data)
        FROM (
            SELECT
                a.id,
                a.created_at,
                a.name,
                a.genre,
                a.country,
                a.profile_image,
                a.bio,
                a.monthly_listeners,
                a.total_streams,
                a.user_id,
                (SELECT json_agg(sa.*) FROM social_accounts sa WHERE sa.artist_id = a.id) as social_accounts,
                (SELECT json_agg(da.*) FROM distribution_accounts da WHERE da.artist_id = a.id) as distribution_accounts,
                (
                    SELECT json_agg(p_assets)
                    FROM (
                        SELECT 
                            p.name, 
                            p.release_date,
                            (SELECT json_agg(assets.*) FROM assets WHERE assets.project_id = p.id) as assets
                        FROM projects p
                        WHERE p.artist_id = a.id
                    ) p_assets
                ) as projects
            FROM
                artists a
        ) artist_data
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_artists_for_admin() TO authenticated;