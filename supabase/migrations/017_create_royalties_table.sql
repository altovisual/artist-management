CREATE TABLE royalties (
    id BIGSERIAL PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES royalty_reports(id) ON DELETE CASCADE,
    song_title TEXT NOT NULL,
    platform TEXT NOT NULL,
    country TEXT NOT NULL,
    revenue NUMERIC(10, 4) NOT NULL,
    quantity INTEGER,
    isrc TEXT
);
