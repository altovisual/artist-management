# 🔔 Setup de Notificaciones de Contratos

## Problema
Las notificaciones de contratos firmados no aparecen en la app.

## Causa
La tabla `signatures` no tiene habilitado Realtime en Supabase.

## Solución

### Paso 1: Habilitar Realtime en Supabase

1. **Abrir Supabase Dashboard**
   - Ve a tu proyecto en https://supabase.com

2. **Ir a SQL Editor**
   - Click en "SQL Editor" en el menú lateral

3. **Ejecutar el script**
   - Copia todo el contenido de `ENABLE_SIGNATURES_REALTIME.sql`
   - Pégalo en el editor
   - Click en "Run"

4. **Verificar en Replication**
   - Ve a Database > Replication
   - Busca la tabla `signatures`
   - Debe aparecer en la lista de tablas con Realtime habilitado

### Paso 2: Verificar que eres Admin

1. **Abrir la consola del navegador** (F12)
2. **Buscar estos logs:**
   ```
   🔍 Checking admin status: { isAdmin: true, role: 'admin' }
   ✅ Admin detected - subscribing to contract notifications
   📡 Contract channel status: SUBSCRIBED
   ```

3. **Si ves:**
   ```
   ❌ Not admin - contract notifications disabled
   ```
   Entonces necesitas configurar tu rol de admin.

### Paso 3: Configurar Rol de Admin

**Opción A: Desde Supabase Dashboard**
```sql
-- Ejecuta en SQL Editor
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'tu-email@ejemplo.com';
```

**Opción B: Desde tabla profiles**
```sql
-- Ejecuta en SQL Editor
UPDATE profiles 
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

### Paso 4: Probar las Notificaciones

1. **Enviar un contrato**
   - Ve a Management > Signatures
   - Envía un nuevo contrato

2. **Firmar el contrato**
   - Abre el link de firma
   - Completa la firma

3. **Verificar notificaciones**
   - Deberías ver en la consola:
     ```
     📄 Contract event received: { eventType: 'UPDATE', ... }
     📄 Event details: { eventType: 'UPDATE', status: 'completed', id: '...' }
     ```
   - Deberías recibir:
     - 🔊 Sonido de notificación
     - 💥 Badge animado
     - 📬 Toast notification
     - 🔔 Badge con contador
     - 📱 Browser notification (si está permitido)

## Tipos de Notificaciones de Contratos

### 1. Contrato Enviado (INSERT)
```
📄 Contract sent to john@example.com
```
- Aparece cuando se envía un contrato
- Programa recordatorio automático para 5 horas

### 2. Contrato Firmado (UPDATE)
```
✅ Contract signed by john@example.com
```
- Aparece cuando se firma el contrato
- Prioridad HIGH
- Sonido + animación + browser notification

### 3. Recordatorio (5 horas después)
```
⏰ Reminder: Contract pending signature
```
- Solo si el contrato sigue pendiente
- Prioridad HIGH
- Sonido + animación llamativa

## Debugging

### Ver logs en consola:
1. Abre DevTools (F12)
2. Ve a la pestaña Console
3. Busca estos emojis: 🔍 📄 ✅ ⏰ 📡

### Verificar suscripción:
```javascript
// En la consola del navegador
console.log('Channels:', supabase.getChannels())
```

### Verificar Realtime:
```sql
-- En Supabase SQL Editor
SELECT * FROM pg_publication_tables WHERE tablename = 'signatures';
```

## Troubleshooting

### ❌ No aparecen notificaciones
1. Verifica que eres admin (ver logs)
2. Verifica que Realtime está habilitado
3. Verifica que el canal está suscrito (ver logs)
4. Recarga la página

### ❌ Solo aparecen algunas notificaciones
1. Verifica los logs de la consola
2. Verifica que el evento sea UPDATE con status='completed'
3. Verifica que el artist_id existe en la tabla artists

### ❌ No suena el sonido
1. Verifica que el volumen no esté en mute
2. Verifica que el navegador permite sonidos
3. Interactúa con la página antes (click en cualquier lugar)

## Notas Importantes

- ✅ Solo los **admins** reciben notificaciones de contratos
- ✅ Los recordatorios se programan automáticamente
- ✅ Si el contrato se firma antes de 5h, el recordatorio no se envía
- ✅ Las notificaciones se guardan en el estado local
- ✅ El contador se actualiza automáticamente

## Verificación Final

Checklist para confirmar que todo funciona:

- [ ] Realtime habilitado en tabla `signatures`
- [ ] Usuario tiene rol de admin
- [ ] Logs muestran "Admin detected"
- [ ] Canal muestra status "SUBSCRIBED"
- [ ] Al enviar contrato aparece notificación
- [ ] Al firmar contrato aparece notificación
- [ ] Sonido se reproduce correctamente
- [ ] Badge se anima y muestra contador
- [ ] Toast aparece con el mensaje correcto
