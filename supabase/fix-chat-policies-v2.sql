-- =====================================================
-- FIX V2: Eliminar TODAS las policies y crear versión ultra-simple
-- =====================================================

-- 1. DESHABILITAR RLS temporalmente para testing
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODAS las policies existentes
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON conversation_participants;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

DROP POLICY IF EXISTS "Users can view typing indicators in their conversations" ON typing_indicators;
DROP POLICY IF EXISTS "Users can update their typing status" ON typing_indicators;

-- 3. RE-HABILITAR RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- 4. Crear policies ULTRA SIMPLES (sin subqueries complejos)

-- =====================================================
-- CONVERSATIONS
-- =====================================================

-- Ver conversaciones (cualquier usuario autenticado puede ver todas por ahora)
CREATE POLICY "Enable read access for authenticated users"
  ON conversations FOR SELECT
  TO authenticated
  USING (true);

-- Crear conversaciones
CREATE POLICY "Enable insert for authenticated users"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Actualizar conversaciones
CREATE POLICY "Enable update for authenticated users"
  ON conversations FOR UPDATE
  TO authenticated
  USING (true);

-- =====================================================
-- CONVERSATION_PARTICIPANTS
-- =====================================================

-- Ver participantes
CREATE POLICY "Enable read access for authenticated users"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (true);

-- Insertar participantes
CREATE POLICY "Enable insert for authenticated users"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Actualizar participantes (solo tu propio registro)
CREATE POLICY "Enable update for own record"
  ON conversation_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- MESSAGES
-- =====================================================

-- Ver mensajes
CREATE POLICY "Enable read access for authenticated users"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

-- Enviar mensajes
CREATE POLICY "Enable insert for authenticated users"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Actualizar mensajes (solo los propios)
CREATE POLICY "Enable update for own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

-- Eliminar mensajes (solo los propios)
CREATE POLICY "Enable delete for own messages"
  ON messages FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

-- =====================================================
-- TYPING_INDICATORS
-- =====================================================

-- Ver typing indicators
CREATE POLICY "Enable read access for authenticated users"
  ON typing_indicators FOR SELECT
  TO authenticated
  USING (true);

-- Insertar/actualizar typing indicators (solo los propios)
CREATE POLICY "Enable all for own typing status"
  ON typing_indicators FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- VERIFICAR
-- =====================================================

SELECT 
  schemaname, 
  tablename, 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'typing_indicators')
ORDER BY tablename, policyname;
