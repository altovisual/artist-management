# Chat Troubleshooting Guide

## Error: "Error sending message: {}"

Este error indica que hay un problema al insertar mensajes en la base de datos. Aquí están las soluciones:

### Solución 1: Ejecutar SQL en Supabase Dashboard

1. **Abre tu proyecto en Supabase Dashboard**
   - Ve a: https://supabase.com/dashboard

2. **Abre el SQL Editor**
   - Click en "SQL Editor" en el menú lateral

3. **Ejecuta el script de setup**
   - Copia todo el contenido de `CHAT_SETUP.sql`
   - Pégalo en el editor
   - Click en "Run" o presiona Ctrl+Enter

4. **Verifica que se creó correctamente**
   - Deberías ver mensajes de éxito
   - La última query mostrará las políticas RLS

### Solución 2: Verificar Permisos RLS

El problema más común es que las políticas RLS están bloqueando el insert. Verifica:

```sql
-- Ejecuta esto para ver las políticas actuales
SELECT * FROM pg_policies WHERE tablename = 'team_chat_messages';
```

Deberías ver 4 políticas:
- ✅ Users can view team chat messages
- ✅ Users can insert their own messages
- ✅ Users can update their own messages
- ✅ Users can delete their own messages

### Solución 3: Verificar Usuario Autenticado

El error puede ocurrir si el usuario no está autenticado correctamente:

1. **Verifica en la consola del navegador**:
   ```javascript
   // Pega esto en la consola del navegador
   const { data: { user } } = await supabase.auth.getUser()
   console.log('Current user:', user)
   ```

2. **Si `user` es null**:
   - Cierra sesión y vuelve a iniciar sesión
   - Verifica que el token no haya expirado

### Solución 4: Verificar Variables de Entorno

Asegúrate de que tienes las variables correctas en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### Solución 5: Verificar Logs Detallados

Con el código actualizado, ahora verás logs detallados en la consola:

1. **Abre la consola del navegador** (F12)
2. **Intenta enviar un mensaje**
3. **Busca estos logs**:
   - "Sending message:" → Muestra los datos que se están enviando
   - "Supabase error:" → Muestra el error específico de Supabase
   - "Error details:" → Muestra code, message, details, hint

### Errores Comunes y Soluciones:

#### Error: "new row violates row-level security policy"
**Solución**: Las políticas RLS están bloqueando el insert
- Ejecuta `CHAT_SETUP.sql` para recrear las políticas
- Verifica que `auth.uid()` no sea null

#### Error: "null value in column 'project_id'"
**Solución**: No hay proyecto seleccionado
- Asegúrate de seleccionar un proyecto antes de abrir el chat
- Verifica que `projectId` no sea undefined

#### Error: "null value in column 'sender_id'"
**Solución**: Usuario no autenticado
- Cierra sesión y vuelve a iniciar
- Verifica que el token sea válido

#### Error: "relation 'team_chat_messages' does not exist"
**Solución**: La tabla no está creada
- Ejecuta `CHAT_SETUP.sql` en Supabase Dashboard

### Verificación Final

Después de aplicar las soluciones, verifica que todo funcione:

1. **Selecciona un proyecto** del sidebar
2. **Abre el chat** (botón flotante en mobile o botón Chat en desktop)
3. **Escribe un mensaje** y presiona Enter
4. **Verifica en la consola**:
   - Deberías ver "Message sent successfully:"
   - El mensaje debería aparecer en el chat

### Contacto de Soporte

Si el problema persiste:
1. Copia todos los logs de la consola
2. Copia el resultado de las queries de verificación
3. Comparte los detalles del error

## Logs Útiles para Debugging

```javascript
// Ejecuta esto en la consola para ver el estado actual
console.log('Project ID:', projectId)
console.log('Current User ID:', currentUser?.id)
console.log('Team Members:', teamMembers)
console.log('Messages:', messages)
```
