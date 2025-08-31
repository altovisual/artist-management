-- 027_create_transaction_categories_table.sql

CREATE TABLE public.transaction_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL, -- 'income' or 'expense'
    CONSTRAINT unique_category_name_per_user UNIQUE (user_id, name)
);

COMMENT ON COLUMN public.transaction_categories.user_id IS 'The user who owns this category.';
COMMENT ON COLUMN public.transaction_categories.name IS 'Name of the category (e.g., Streaming, Merch, Production).';
COMMENT ON COLUMN public.transaction_categories.type IS 'Type of the category (income or expense).';

ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable CRUD for owners and admins on transaction_categories" ON public.transaction_categories
FOR ALL
USING (
  public.is_admin() OR
  auth.uid() = user_id
)
WITH CHECK (
  public.is_admin() OR
  auth.uid() = user_id
);

CREATE INDEX idx_transaction_categories_user_id ON public.transaction_categories(user_id);