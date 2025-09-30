# 💬 Sistema de Chat Interno - Guía de Implementación

## 📋 PASO 1: Ejecutar SQL en Supabase

### Instrucciones:
1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor** (icono de base de datos en el menú lateral)
3. Click en **"New Query"**
4. Copia todo el contenido de `supabase/chat-system.sql`
5. Pégalo en el editor
6. Click en **"Run"** (o presiona Ctrl/Cmd + Enter)
7. Verifica que se ejecutó sin errores

### ✅ Qué se creará:
- ✅ 4 tablas: `conversations`, `conversation_participants`, `messages`, `typing_indicators`
- ✅ Índices para performance
- ✅ Triggers para timestamps automáticos
- ✅ RLS Policies completas
- ✅ Funciones helper (crear conversación, contar no leídos)
- ✅ Vista `conversation_list` con datos agregados

---

## 📋 PASO 2: Crear Hook de Chat

El hook `useChat` manejará toda la lógica del chat:

### Funcionalidades:
- ✅ Obtener lista de conversaciones
- ✅ Crear conversación directa
- ✅ Enviar mensajes
- ✅ Marcar como leído
- ✅ Suscripción en tiempo real
- ✅ Typing indicators
- ✅ Contador de no leídos

### Archivo: `hooks/use-chat.ts`

---

## 📋 PASO 3: Crear Componentes de Chat

### Estructura de carpetas:
```
components/chat/
├── chat-list.tsx           # Lista de conversaciones
├── chat-item.tsx           # Item de conversación individual
├── chat-window.tsx         # Ventana de chat completa
├── message-list.tsx        # Lista de mensajes
├── message-item.tsx        # Mensaje individual
├── message-input.tsx       # Input para escribir
├── chat-header.tsx         # Header del chat
└── typing-indicator.tsx    # Indicador de "escribiendo..."
```

---

## 📋 PASO 4: Integrar en Workspace

### Agregar tab "Messages" en CompactWorkspaceWidget:

```tsx
// En compact-workspace-widget.tsx
const tabs = ['overview', 'notifications', 'projects', 'team', 'messages']

{activeView === 'messages' && (
  <ChatList />
)}
```

---

## 🎯 FEATURES DEL CHAT

### ✅ Fase 1 (Básico):
- [x] Chat 1-a-1 (directo)
- [x] Enviar/recibir mensajes
- [x] Mensajes en tiempo real
- [x] Contador de no leídos
- [x] Marcar como leído
- [x] Scroll automático

### ⏳ Fase 2 (Avanzado):
- [ ] Indicador "escribiendo..."
- [ ] Emojis
- [ ] Búsqueda de mensajes
- [ ] Notificaciones push

### ⏳ Fase 3 (Premium):
- [ ] Grupos
- [ ] Enviar archivos/imágenes
- [ ] Reacciones a mensajes
- [ ] Mensajes de voz

---

## 🔒 SEGURIDAD (RLS)

### Políticas implementadas:
- ✅ Solo participantes pueden ver conversaciones
- ✅ Solo participantes pueden ver mensajes
- ✅ Solo participantes pueden enviar mensajes
- ✅ Solo el remitente puede editar/eliminar sus mensajes
- ✅ Verificación de permisos en todas las operaciones

---

## 📊 ESTRUCTURA DE DATOS

### Conversación:
```typescript
{
  id: UUID
  type: 'direct' | 'group'
  name?: string
  created_by: UUID
  created_at: timestamp
  updated_at: timestamp
}
```

### Mensaje:
```typescript
{
  id: UUID
  conversation_id: UUID
  sender_id: UUID
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  metadata: JSON
  is_edited: boolean
  is_deleted: boolean
  created_at: timestamp
}
```

### Participante:
```typescript
{
  id: UUID
  conversation_id: UUID
  user_id: UUID
  joined_at: timestamp
  last_read_at: timestamp
  is_active: boolean
}
```

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **Ejecutar SQL** en Supabase
2. ⏳ **Crear hook** `useChat`
3. ⏳ **Crear componentes** básicos
4. ⏳ **Integrar** en workspace
5. ⏳ **Probar** entre usuarios
6. ⏳ **Pulir** UX y animaciones

---

## 💡 TIPS DE IMPLEMENTACIÓN

### Performance:
- Usar paginación para mensajes (cargar últimos 50)
- Lazy loading al hacer scroll hacia arriba
- Debounce en typing indicators (500ms)

### UX:
- Scroll automático al enviar mensaje
- Indicador visual de mensaje enviado/entregado
- Sonido opcional para nuevos mensajes
- Badge con contador en tab de Messages

### Tiempo Real:
```typescript
// Suscribirse a nuevos mensajes
supabase
  .channel('messages')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      // Agregar mensaje a la lista
    }
  )
  .subscribe()
```

---

## 🎨 DISEÑO SUGERIDO

### Lista de conversaciones:
```
┌─────────────────────────────┐
│ 💬 Messages            [3]  │
├─────────────────────────────┤
│ 👤 Sarah Johnson       [2]  │
│    Hey, how are you?        │
│    2 min ago                │
├─────────────────────────────┤
│ 👤 Mike Wilson         [1]  │
│    Thanks for the update    │
│    1 hour ago               │
└─────────────────────────────┘
```

### Ventana de chat:
```
┌─────────────────────────────┐
│ ← Sarah Johnson      [•]    │
├─────────────────────────────┤
│                             │
│  Hey! 👋                    │
│  10:30 AM                   │
│                             │
│              How are you? ✓ │
│              10:32 AM       │
│                             │
│  Sarah is typing...         │
├─────────────────────────────┤
│ [😊] Type a message... [→] │
└─────────────────────────────┘
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] SQL ejecutado en Supabase
- [ ] Tablas creadas correctamente
- [ ] RLS policies funcionando
- [ ] Hook `useChat` creado
- [ ] Componente `ChatList` creado
- [ ] Componente `ChatWindow` creado
- [ ] Componente `MessageInput` creado
- [ ] Integrado en workspace
- [ ] Tiempo real funcionando
- [ ] Probado entre usuarios
- [ ] UX pulida

---

¿Listo para continuar? 🚀
