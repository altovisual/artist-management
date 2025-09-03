ALTER TABLE royalty_reports
ADD COLUMN artist_id UUID REFERENCES artists(id);