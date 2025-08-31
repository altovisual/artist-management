CREATE TABLE audience_reports (
    id BIGSERIAL PRIMARY KEY,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    listeners INTEGER,
    streams INTEGER,
    followers INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
