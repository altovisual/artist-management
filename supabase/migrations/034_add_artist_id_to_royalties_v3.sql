ALTER TABLE royalties
ADD COLUMN artist_id UUID REFERENCES artists(id);