-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('royalty-reports', 'royalty-reports', false);

-- Create the trigger function
CREATE OR REPLACE FUNCTION handle_royalty_report_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger the edge function
  PERFORM net.http_post(
    url := 'https://tdbomtxyevggobphozdu.supabase.co/functions/v1/process-royalty-report',
    body := jsonb_build_object('record', NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the storage.objects table
CREATE TRIGGER on_royalty_report_upload
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'royalty-reports')
EXECUTE FUNCTION handle_royalty_report_upload();
