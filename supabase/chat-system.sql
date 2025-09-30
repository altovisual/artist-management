-- =====================================================
-- SISTEMA DE CHAT INTERNO
-- =====================================================
-- Este archivo crea todas las tablas necesarias para un sistema de chat
-- con conversaciones directas, mensajes en tiempo real y RLS policies

-- =====================================================
-- 1. TABLA DE CONVERSACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  name TEXT, -- Nombre del grupo (null para conversaciones directas)
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);

-- =====================================================
-- 2. TABLA DE PARTICIPANTES
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(conversation_id, user_id)
);

-- Índices para performance
CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_participants_active ON conversation_participants(user_id, is_active);

-- =====================================================
-- 3. TABLA DE MENSAJES
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
  metadata JSONB DEFAULT '{}', -- Para archivos, imágenes, reacciones, etc.
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- =====================================================
-- 4. TABLA DE TYPING INDICATORS
-- =====================================================
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Índice para performance
CREATE INDEX idx_typing_conversation ON typing_indicators(conversation_id);

-- =====================================================
-- 5. FUNCIÓN PARA ACTUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. FUNCIÓN PARA ACTUALIZAR ÚLTIMA ACTIVIDAD
-- =====================================================
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp de conversación al enviar mensaje
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES PARA CONVERSATIONS
-- =====================================================

-- Ver conversaciones donde el usuario es participante
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Crear conversaciones
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Actualizar conversaciones (solo el creador o admins)
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = id 
      AND user_id = auth.uid() 
      AND is_active = true
    )
  );

-- =====================================================
-- POLICIES PARA CONVERSATION_PARTICIPANTS
-- =====================================================

-- Ver participantes de conversaciones donde el usuario participa
CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Agregar participantes (solo el creador o admins)
CREATE POLICY "Users can add participants to their conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE created_by = auth.uid()
    )
  );

-- Actualizar participantes (marcar como inactivo, actualizar last_read)
CREATE POLICY "Users can update their participation"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- POLICIES PARA MESSAGES
-- =====================================================

-- Ver mensajes de conversaciones donde el usuario participa
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Enviar mensajes a conversaciones donde el usuario participa
CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Actualizar mensajes (solo el remitente puede editar)
CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Eliminar mensajes (solo el remitente)
CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (sender_id = auth.uid());

-- =====================================================
-- POLICIES PARA TYPING_INDICATORS
-- =====================================================

-- Ver indicadores de escritura en conversaciones activas
CREATE POLICY "Users can view typing indicators in their conversations"
  ON typing_indicators FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Insertar/actualizar indicador de escritura
CREATE POLICY "Users can update their typing status"
  ON typing_indicators FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 8. FUNCIÓN HELPER: Crear conversación directa
-- =====================================================
CREATE OR REPLACE FUNCTION create_direct_conversation(
  other_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
  existing_conversation UUID;
BEGIN
  -- Verificar si ya existe una conversación directa entre estos usuarios
  SELECT c.id INTO existing_conversation
  FROM conversations c
  INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
  INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE c.type = 'direct'
    AND cp1.user_id = auth.uid()
    AND cp2.user_id = other_user_id
    AND cp1.is_active = true
    AND cp2.is_active = true
  LIMIT 1;

  -- Si existe, retornar el ID
  IF existing_conversation IS NOT NULL THEN
    RETURN existing_conversation;
  END IF;

  -- Si no existe, crear nueva conversación
  INSERT INTO conversations (type, created_by)
  VALUES ('direct', auth.uid())
  RETURNING id INTO conversation_id;

  -- Agregar ambos participantes
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES 
    (conversation_id, auth.uid()),
    (conversation_id, other_user_id);

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. FUNCIÓN HELPER: Obtener contador de mensajes no leídos
-- =====================================================
CREATE OR REPLACE FUNCTION get_unread_count(conv_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
  user_last_read TIMESTAMPTZ;
BEGIN
  -- Obtener última lectura del usuario
  SELECT last_read_at INTO user_last_read
  FROM conversation_participants
  WHERE conversation_id = conv_id AND user_id = auth.uid();

  -- Contar mensajes después de la última lectura
  SELECT COUNT(*) INTO unread_count
  FROM messages
  WHERE conversation_id = conv_id
    AND created_at > COALESCE(user_last_read, '1970-01-01'::TIMESTAMPTZ)
    AND sender_id != auth.uid();

  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. VISTA: Conversaciones con información adicional
-- =====================================================
CREATE OR REPLACE VIEW conversation_list AS
SELECT 
  c.id,
  c.type,
  c.name,
  c.created_by,
  c.created_at,
  c.updated_at,
  -- Último mensaje
  (
    SELECT json_build_object(
      'id', m.id,
      'content', m.content,
      'sender_id', m.sender_id,
      'created_at', m.created_at
    )
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) as last_message,
  -- Participantes
  (
    SELECT json_agg(
      json_build_object(
        'user_id', cp.user_id,
        'joined_at', cp.joined_at,
        'is_active', cp.is_active
      )
    )
    FROM conversation_participants cp
    WHERE cp.conversation_id = c.id
  ) as participants,
  -- Contador de no leídos
  get_unread_count(c.id) as unread_count
FROM conversations c
WHERE c.id IN (
  SELECT conversation_id 
  FROM conversation_participants 
  WHERE user_id = auth.uid() AND is_active = true
);

-- =====================================================
-- COMPLETADO
-- =====================================================
-- El sistema de chat está listo para usar
-- 
-- Próximos pasos:
-- 1. Ejecutar este SQL en Supabase SQL Editor
-- 2. Crear hook useChat en hooks/use-chat.ts
-- 3. Crear componentes de chat en components/chat/
-- 4. Integrar en CompactWorkspaceWidget
