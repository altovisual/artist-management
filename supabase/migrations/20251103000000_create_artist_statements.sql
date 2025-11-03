-- =====================================================
-- SISTEMA DE ESTADOS DE CUENTA DE ARTISTAS
-- =====================================================
-- Migración para gestionar estados de cuenta mensuales
-- de artistas con importación automática desde Excel

-- Tabla principal de estados de cuenta por artista
CREATE TABLE IF NOT EXISTS public.artist_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  
  -- Información del periodo
  period_start DATE NOT NULL,
  period_end DATE,
  statement_month VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
  
  -- Información legal del artista
  legal_name TEXT,
  
  -- Resumen financiero del periodo
  total_income DECIMAL(12, 2) DEFAULT 0,
  total_expenses DECIMAL(12, 2) DEFAULT 0,
  total_advances DECIMAL(12, 2) DEFAULT 0,
  balance DECIMAL(12, 2) DEFAULT 0,
  
  -- Metadata
  total_transactions INTEGER DEFAULT 0,
  last_import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  import_source TEXT DEFAULT 'excel', -- excel, manual, api
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Un estado de cuenta por artista por mes
  UNIQUE(artist_id, statement_month)
);

-- Tabla de transacciones detalladas del estado de cuenta
CREATE TABLE IF NOT EXISTS public.statement_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL REFERENCES public.artist_statements(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  
  -- Información de la transacción
  transaction_date DATE NOT NULL,
  concept TEXT NOT NULL,
  payment_method TEXT,
  
  -- Montos
  amount DECIMAL(12, 2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- income, expense, advance, payment
  
  -- Categorización
  category TEXT, -- Factura, Avance, Pago por servicios, Gastos de producción, etc.
  subcategory TEXT,
  
  -- Detalles financieros adicionales
  bank_charges DECIMAL(12, 2) DEFAULT 0,
  fee_percentage DECIMAL(5, 2) DEFAULT 0,
  commission_percentage DECIMAL(5, 2) DEFAULT 0,
  legal_percentage DECIMAL(5, 2) DEFAULT 0,
  tax_withholding DECIMAL(12, 2) DEFAULT 0,
  
  -- Balance acumulado hasta esta transacción
  running_balance DECIMAL(12, 2),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial de importaciones
CREATE TABLE IF NOT EXISTS public.statement_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del archivo
  file_name TEXT NOT NULL,
  file_size INTEGER,
  import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Resultados de la importación
  total_artists INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  successful_imports INTEGER DEFAULT 0,
  failed_imports INTEGER DEFAULT 0,
  
  -- Detalles
  import_summary JSONB, -- Resumen detallado por artista
  errors JSONB, -- Errores encontrados durante la importación
  
  -- Usuario que realizó la importación
  imported_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_artist_statements_artist_id ON public.artist_statements(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_statements_month ON public.artist_statements(statement_month);
CREATE INDEX IF NOT EXISTS idx_artist_statements_period ON public.artist_statements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_statement_transactions_statement_id ON public.statement_transactions(statement_id);
CREATE INDEX IF NOT EXISTS idx_statement_transactions_artist_id ON public.statement_transactions(artist_id);
CREATE INDEX IF NOT EXISTS idx_statement_transactions_date ON public.statement_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_statement_transactions_type ON public.statement_transactions(transaction_type);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_artist_statements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER artist_statements_updated_at
  BEFORE UPDATE ON public.artist_statements
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_statements_updated_at();

CREATE TRIGGER statement_transactions_updated_at
  BEFORE UPDATE ON public.statement_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_statements_updated_at();

-- Función para calcular resumen de estado de cuenta
CREATE OR REPLACE FUNCTION calculate_statement_summary(p_statement_id UUID)
RETURNS void AS $$
DECLARE
  v_total_income DECIMAL(12, 2);
  v_total_expenses DECIMAL(12, 2);
  v_total_advances DECIMAL(12, 2);
  v_balance DECIMAL(12, 2);
  v_transaction_count INTEGER;
BEGIN
  -- Calcular totales
  SELECT 
    COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN ABS(amount) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'advance' THEN amount ELSE 0 END), 0),
    COUNT(*)
  INTO v_total_income, v_total_expenses, v_total_advances, v_transaction_count
  FROM public.statement_transactions
  WHERE statement_id = p_statement_id;
  
  -- Calcular balance
  v_balance := v_total_income - v_total_expenses + v_total_advances;
  
  -- Actualizar el estado de cuenta
  UPDATE public.artist_statements
  SET 
    total_income = v_total_income,
    total_expenses = v_total_expenses,
    total_advances = v_total_advances,
    balance = v_balance,
    total_transactions = v_transaction_count,
    updated_at = NOW()
  WHERE id = p_statement_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener resumen financiero de un artista
CREATE OR REPLACE FUNCTION get_artist_financial_summary(p_artist_id UUID)
RETURNS TABLE (
  total_income DECIMAL(12, 2),
  total_expenses DECIMAL(12, 2),
  total_advances DECIMAL(12, 2),
  current_balance DECIMAL(12, 2),
  total_transactions INTEGER,
  months_count INTEGER,
  first_statement_date DATE,
  last_statement_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.total_income), 0)::DECIMAL(12, 2),
    COALESCE(SUM(s.total_expenses), 0)::DECIMAL(12, 2),
    COALESCE(SUM(s.total_advances), 0)::DECIMAL(12, 2),
    COALESCE(SUM(s.balance), 0)::DECIMAL(12, 2),
    COALESCE(SUM(s.total_transactions), 0)::INTEGER,
    COUNT(DISTINCT s.statement_month)::INTEGER,
    MIN(s.period_start),
    MAX(COALESCE(s.period_end, s.period_start))
  FROM public.artist_statements s
  WHERE s.artist_id = p_artist_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE public.artist_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statement_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statement_imports ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios autenticados pueden ver estados de cuenta
CREATE POLICY "Users can view artist statements"
  ON public.artist_statements
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Los usuarios autenticados pueden ver transacciones
CREATE POLICY "Users can view statement transactions"
  ON public.statement_transactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Usuarios autenticados pueden insertar/actualizar estados de cuenta
-- (Puedes restringir esto más adelante si necesitas control por roles)
CREATE POLICY "Authenticated users can manage artist statements"
  ON public.artist_statements
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Usuarios autenticados pueden gestionar transacciones
CREATE POLICY "Authenticated users can manage statement transactions"
  ON public.statement_transactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Usuarios autenticados pueden ver historial de importaciones
CREATE POLICY "Authenticated users can view import history"
  ON public.statement_imports
  FOR SELECT
  TO authenticated
  USING (true);

-- Comentarios para documentación
COMMENT ON TABLE public.artist_statements IS 'Estados de cuenta mensuales de artistas con resumen financiero';
COMMENT ON TABLE public.statement_transactions IS 'Transacciones detalladas de cada estado de cuenta';
COMMENT ON TABLE public.statement_imports IS 'Historial de importaciones de estados de cuenta desde Excel';
COMMENT ON FUNCTION calculate_statement_summary IS 'Calcula y actualiza el resumen financiero de un estado de cuenta';
COMMENT ON FUNCTION get_artist_financial_summary IS 'Obtiene el resumen financiero completo de un artista';
