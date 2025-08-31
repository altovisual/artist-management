-- 028_create_transactions_table.sql

CREATE TABLE public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES public.transaction_categories(id) ON DELETE RESTRICT, -- RESTRICT to prevent deleting category if transactions exist
    amount numeric(10, 2) NOT NULL,
    description text,
    transaction_date date NOT NULL,
    type text NOT NULL -- 'income' or 'expense'
);

COMMENT ON COLUMN public.transactions.artist_id IS 'The artist this transaction belongs to.';
COMMENT ON COLUMN public.transactions.user_id IS 'The user who owns this transaction.';
COMMENT ON COLUMN public.transactions.category_id IS 'The category of this transaction.';
COMMENT ON COLUMN public.transactions.amount IS 'The amount of the transaction.';
COMMENT ON COLUMN public.transactions.description IS 'Description of the transaction.';
COMMENT ON COLUMN public.transactions.transaction_date IS 'The date the transaction occurred.';
COMMENT ON COLUMN public.transactions.type IS 'Type of the transaction (income or expense).';

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable CRUD for owners and admins on transactions" ON public.transactions
FOR ALL
USING (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = transactions.artist_id AND artists.user_id = auth.uid())
)
WITH CHECK (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM artists WHERE artists.id = transactions.artist_id AND artists.user_id = auth.uid())
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_artist_id ON public.transactions(artist_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);