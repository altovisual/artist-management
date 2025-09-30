-- =====================================================
-- FIX: Recursión infinita en policies de chat
-- =====================================================
-- Ejecutar este SQL para arreglar las policies problemáticas

-- 1. Eliminar policies existentes que causan recursión
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

-- 2. Crear policies simplificadas SIN recursión

-- Policy para ver participantes (sin subquery recursivo)
CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants FOR SELECT
  USING (
    user_id = auth.uid() OR
    conversation_id IN (
      SELECT cp.conversation_id 
      FROM conversation_participants cp
      WHERE cp.user_id = auth.uid()
    )
  );

-- Policy para actualizar participación (solo tu propio registro)
CREATE POLICY "Users can update their participation"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy para ver mensajes (simplificada)
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id 
        AND cp.user_id = auth.uid()
        AND cp.is_active = true
    )
  );

-- 3. Verificar que las policies se crearon correctamente
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('conversation_participants', 'messages')
ORDER BY tablename, policyname;
