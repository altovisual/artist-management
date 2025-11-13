-- Function to sync role from profiles table to auth.users app_metadata
-- This ensures that is_admin() function works correctly

-- First, let's update existing admin users
DO $$
DECLARE
  admin_user RECORD;
BEGIN
  -- Find all users with admin role in profiles table
  FOR admin_user IN 
    SELECT id FROM public.profiles WHERE role = 'admin'
  LOOP
    -- Update their app_metadata in auth.users
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', 'admin')
    WHERE id = admin_user.id;
    
    RAISE NOTICE 'Updated app_metadata for user: %', admin_user.id;
  END LOOP;
END $$;

-- Create a trigger function to keep app_metadata in sync
CREATE OR REPLACE FUNCTION public.sync_role_to_app_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users app_metadata when profile role changes
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS sync_role_to_app_metadata_trigger ON public.profiles;

-- Create trigger on profiles table
CREATE TRIGGER sync_role_to_app_metadata_trigger
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_role_to_app_metadata();

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Role synchronization complete. Admin users should now have role in app_metadata.';
END $$;
