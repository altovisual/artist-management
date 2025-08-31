-- Enable RLS for royalty_reports table
ALTER TABLE public.royalty_reports ENABLE ROW LEVEL SECURITY;

-- Allow all users to view all royalty reports (for debugging)
CREATE POLICY "Allow all users to view royalty reports" ON public.royalty_reports
  FOR SELECT USING (true);

-- Allow authenticated users to insert royalty reports
CREATE POLICY "Allow authenticated users to insert royalty reports" ON public.royalty_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS for royalties table
ALTER TABLE public.royalties ENABLE ROW LEVEL SECURITY;

-- Allow all users to view all royalties (for debugging)
CREATE POLICY "Allow all users to view royalties" ON public.royalties
  FOR SELECT USING (true);