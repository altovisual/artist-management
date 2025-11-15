-- ============================================
-- ARREGLAR RLS POLICIES PARA FINANZAS
-- ============================================
-- Estructura de permisos:
-- - Artistas: Solo ven sus propias transacciones
-- - Managers: Solo ven transacciones de SUS artistas
-- - Admins: Ven TODAS las transacciones

-- ============================================
-- IMPORTANTE: PREREQUISITOS
-- ============================================
-- ANTES de ejecutar este script, debes haber ejecutado:
-- 1. EJECUTAR_ESTO_PRIMERO.sql
-- 2. AGREGAR_COLUMNA_IS_ADMIN.sql ← Crea la columna is_admin
-- 3. CREAR_TABLA_ARTIST_MANAGERS.sql ← Crea la tabla artist_managers

-- Verificar que los prerequisitos están cumplidos
SELECT 
    'VERIFICANDO PREREQUISITOS' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_profiles' AND column_name = 'is_admin'
        ) THEN '✅ Columna is_admin existe'
        ELSE '❌ ERROR: Ejecuta AGREGAR_COLUMNA_IS_ADMIN.sql primero'
    END as is_admin_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'artist_managers'
        ) THEN '✅ Tabla artist_managers existe'
        ELSE '❌ ERROR: Ejecuta CREAR_TABLA_ARTIST_MANAGERS.sql primero'
    END as artist_managers_status;

-- ============================================
-- 1. TRANSACTIONS
-- ============================================

-- Ver policies actuales
SELECT 'TRANSACTIONS - POLICIES ACTUALES' as info, policyname, cmd
FROM pg_policies WHERE tablename = 'transactions';

-- Eliminar policies existentes
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.transactions;
DROP POLICY IF EXISTS "Artists view own transactions, managers view all" ON public.transactions;
DROP POLICY IF EXISTS "Managers can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Managers can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Managers can delete transactions" ON public.transactions;

-- Habilitar RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT: Artistas ven solo sus transacciones, Managers ven de sus artistas, Admins ven todo
CREATE POLICY "View transactions based on role"
ON public.transactions
FOR SELECT
TO authenticated
USING (
    -- Si el usuario es ADMIN, ve todo
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
    OR
    -- Si el usuario es el ARTISTA de la transacción
    artist_id IN (
        SELECT id FROM public.artists WHERE user_id = auth.uid()
    )
    OR
    -- Si el usuario es MANAGER del artista de la transacción
    (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND user_type = 'manager'
        )
        AND
        artist_id IN (
            SELECT artist_id FROM public.artist_managers 
            WHERE manager_id = auth.uid()
        )
    )
);

-- Policy para INSERT: Solo admins y managers pueden crear transacciones
CREATE POLICY "Admins and managers can create transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (
    -- Si es admin
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
    OR
    -- Si es manager del artista
    (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND user_type = 'manager'
        )
        AND
        artist_id IN (
            SELECT artist_id FROM public.artist_managers 
            WHERE manager_id = auth.uid()
        )
    )
);

-- Policy para UPDATE: Solo admins y managers pueden actualizar
CREATE POLICY "Admins and managers can update transactions"
ON public.transactions
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
    OR
    (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND user_type = 'manager'
        )
        AND
        artist_id IN (
            SELECT artist_id FROM public.artist_managers 
            WHERE manager_id = auth.uid()
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
    OR
    (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND user_type = 'manager'
        )
        AND
        artist_id IN (
            SELECT artist_id FROM public.artist_managers 
            WHERE manager_id = auth.uid()
        )
    )
);

-- Policy para DELETE: Solo admins pueden eliminar
CREATE POLICY "Only admins can delete transactions"
ON public.transactions
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
);

-- ============================================
-- 2. TRANSACTION_CATEGORIES
-- ============================================

SELECT 'TRANSACTION_CATEGORIES - POLICIES ACTUALES' as info, policyname, cmd
FROM pg_policies WHERE tablename = 'transaction_categories';

-- Eliminar policies existentes
DROP POLICY IF EXISTS "Users can view their own categories" ON public.transaction_categories;
DROP POLICY IF EXISTS "Users can create categories" ON public.transaction_categories;
DROP POLICY IF EXISTS "Users can update their categories" ON public.transaction_categories;
DROP POLICY IF EXISTS "Users can delete their categories" ON public.transaction_categories;
DROP POLICY IF EXISTS "Users view own categories, managers view all" ON public.transaction_categories;
DROP POLICY IF EXISTS "Users can create their own categories" ON public.transaction_categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.transaction_categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.transaction_categories;

-- Habilitar RLS
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT: Usuarios ven sus propias categorías, admins ven todas
CREATE POLICY "View categories based on role"
ON public.transaction_categories
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
);

-- Policy para INSERT: Usuarios autenticados pueden crear categorías
CREATE POLICY "Authenticated users can create categories"
ON public.transaction_categories
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy para UPDATE: Usuarios pueden actualizar sus propias categorías, admins todas
CREATE POLICY "Users update own categories, admins update all"
ON public.transaction_categories
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
)
WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
);

-- Policy para DELETE: Usuarios pueden eliminar sus propias categorías, admins todas
CREATE POLICY "Users delete own categories, admins delete all"
ON public.transaction_categories
FOR DELETE
TO authenticated
USING (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
);

-- ============================================
-- 3. ARTIST_STATEMENTS (Estados de Cuenta)
-- ============================================

SELECT 'ARTIST_STATEMENTS - POLICIES ACTUALES' as info, policyname, cmd
FROM pg_policies WHERE tablename = 'artist_statements';

-- Eliminar policies existentes
DROP POLICY IF EXISTS "Artists view own statements" ON public.artist_statements;
DROP POLICY IF EXISTS "Managers view all statements" ON public.artist_statements;
DROP POLICY IF EXISTS "Managers can create statements" ON public.artist_statements;
DROP POLICY IF EXISTS "Artists view own statements, managers view all" ON public.artist_statements;
DROP POLICY IF EXISTS "Managers can create statements" ON public.artist_statements;
DROP POLICY IF EXISTS "Managers can update statements" ON public.artist_statements;

-- Habilitar RLS
ALTER TABLE public.artist_statements ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT: Artistas ven solo sus statements, Managers ven de sus artistas, Admins ven todos
CREATE POLICY "View statements based on role"
ON public.artist_statements
FOR SELECT
TO authenticated
USING (
    -- Si es admin
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
    OR
    -- Si es el artista del statement
    artist_id IN (
        SELECT id FROM public.artists WHERE user_id = auth.uid()
    )
    OR
    -- Si es manager del artista
    (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND user_type = 'manager'
        )
        AND
        artist_id IN (
            SELECT artist_id FROM public.artist_managers 
            WHERE manager_id = auth.uid()
        )
    )
);

-- Policy para INSERT: Solo admins y managers pueden crear statements
CREATE POLICY "Admins and managers can create statements"
ON public.artist_statements
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
    OR
    (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND user_type = 'manager'
        )
        AND
        artist_id IN (
            SELECT artist_id FROM public.artist_managers 
            WHERE manager_id = auth.uid()
        )
    )
);

-- Policy para UPDATE: Solo admins y managers pueden actualizar statements
CREATE POLICY "Admins and managers can update statements"
ON public.artist_statements
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
    OR
    (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND user_type = 'manager'
        )
        AND
        artist_id IN (
            SELECT artist_id FROM public.artist_managers 
            WHERE manager_id = auth.uid()
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
    OR
    (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND user_type = 'manager'
        )
        AND
        artist_id IN (
            SELECT artist_id FROM public.artist_managers 
            WHERE manager_id = auth.uid()
        )
    )
);

-- ============================================
-- 4. STATEMENT_TRANSACTIONS
-- ============================================

SELECT 'STATEMENT_TRANSACTIONS - POLICIES ACTUALES' as info, policyname, cmd
FROM pg_policies WHERE tablename = 'statement_transactions';

-- Eliminar policies existentes
DROP POLICY IF EXISTS "Artists view own statement transactions" ON public.statement_transactions;
DROP POLICY IF EXISTS "Artists view own statement transactions, managers view all" ON public.statement_transactions;
DROP POLICY IF EXISTS "Managers can create statement transactions" ON public.statement_transactions;

-- Habilitar RLS
ALTER TABLE public.statement_transactions ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT: Artistas ven solo sus transacciones, Managers ven de sus artistas, Admins ven todas
CREATE POLICY "View statement transactions based on role"
ON public.statement_transactions
FOR SELECT
TO authenticated
USING (
    -- Si es admin
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
    OR
    -- Si es el artista de la transacción
    artist_id IN (
        SELECT id FROM public.artists WHERE user_id = auth.uid()
    )
    OR
    -- Si es manager del artista
    (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND user_type = 'manager'
        )
        AND
        artist_id IN (
            SELECT artist_id FROM public.artist_managers 
            WHERE manager_id = auth.uid()
        )
    )
);

-- Policy para INSERT: Solo admins y managers pueden crear
CREATE POLICY "Admins and managers can create statement transactions"
ON public.statement_transactions
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_admin = true
    )
    OR
    (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND user_type = 'manager'
        )
        AND
        artist_id IN (
            SELECT artist_id FROM public.artist_managers 
            WHERE manager_id = auth.uid()
        )
    )
);

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Ver todas las policies creadas
SELECT 
    'RESUMEN DE POLICIES' as info,
    tablename,
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE tablename IN ('transactions', 'transaction_categories', 'artist_statements', 'statement_transactions')
ORDER BY tablename, cmd, policyname;

-- Verificar que RLS está habilitado
SELECT 
    'RLS STATUS' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('transactions', 'transaction_categories', 'artist_statements', 'statement_transactions');

-- Verificar columna is_admin
SELECT 
    'COLUMNA IS_ADMIN' as info,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name = 'is_admin';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
/*
ESTRUCTURA DE PERMISOS:

1. ARTISTAS (user_type = 'artist'):
   - Ver: Solo sus propias transacciones y finanzas
   - Crear: NO pueden crear transacciones
   - Actualizar: NO pueden actualizar transacciones
   - Eliminar: NO pueden eliminar transacciones

2. MANAGERS (user_type = 'manager'):
   - Ver: Solo transacciones de SUS artistas (tabla artist_managers)
   - Crear: Solo para sus artistas
   - Actualizar: Solo para sus artistas
   - Eliminar: NO pueden eliminar

3. ADMINS (is_admin = true):
   - Ver: TODAS las transacciones
   - Crear: Para cualquier artista
   - Actualizar: Cualquier transacción
   - Eliminar: Cualquier transacción

ASIGNACIÓN DE ROLES:
- Artistas y Managers: Se asignan durante el sign up
- Admins: Se asignan manualmente actualizando is_admin = true

PARA HACER A UN USUARIO ADMIN:
UPDATE public.user_profiles 
SET is_admin = true 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@ejemplo.com');
*/
