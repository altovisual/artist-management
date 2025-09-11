
CREATE TABLE public.templates (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    type TEXT NOT NULL,
    language VARCHAR(10) NOT NULL,
    template_html TEXT NOT NULL,
    version VARCHAR(20) NOT NULL,
    jurisdiction VARCHAR(50)
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all users" ON public.templates FOR SELECT USING (true);
