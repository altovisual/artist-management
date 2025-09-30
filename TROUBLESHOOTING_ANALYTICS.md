# 🔍 Troubleshooting - Analytics No Registra Metadata

## 🐛 Problema

Los plays se registran pero la metadata aparece en 0:
- Seeks = 0
- Pauses = 0
- Listen duration = 0
- Completion = 0%

## 🔧 Diagnóstico con Logs

### 1. Abre la Consola del Navegador

1. Ve a la página pública: `/listen/[code]`
2. Abre DevTools (F12)
3. Ve a la pestaña "Console"
4. Reproduce el audio

### 2. Logs que Deberías Ver

**Al dar Play:**
```
🎵 Play event triggered
📝 Recording play start...
🎯 Getting device info...
📱 Device info: { device_type: "desktop", browser: "Chrome", os: "Windows" }
🌍 Getting location info...
📍 Location info: { country: "United States", city: "New York" }
💾 Inserting play data: { ... }
✅ Play recorded successfully: [...]
⏰ Play start time set: 1706634000000
```

**Cada 5 Segundos (mientras reproduce):**
```
✅ Metrics updated: { 
  listenDuration: 5234, 
  seekCount: 0, 
  pauseCount: 0, 
  completionPct: 12.5 
}
```

**Al Pausar:**
```
⏸️ Pause event triggered
⏸️ Pause count: 1
```

**Al Saltar (Seek):**
```
⏭️ Seeking event triggered
⏭️ Seek count: 1
```

## ❌ Errores Comunes

### Error 1: "No track available"
```
❌ No track available
```
**Solución:** El track no se cargó correctamente. Verifica que el share_code sea válido.

### Error 2: "Error inserting play"
```
❌ Error inserting play: { message: "..." }
```
**Posibles causas:**
1. RLS policies bloqueando el insert
2. Campos faltantes en la tabla
3. Tipos de datos incorrectos

**Solución:**
```sql
-- Verificar que la tabla existe
SELECT * FROM shareable_track_plays LIMIT 1;

-- Verificar RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'shareable_track_plays';
```

### Error 3: "Error updating metrics"
```
❌ Error updating metrics: { message: "..." }
```
**Causa:** No puede actualizar el registro

**Solución:**
```sql
-- Verificar que el registro existe
SELECT * FROM shareable_track_plays 
WHERE session_id = 'tu-session-id';

-- Verificar permisos de UPDATE
```

## 🔍 Verificación Manual en Supabase

### 1. Ver Plays Recientes

```sql
SELECT 
  id,
  session_id,
  track_name,
  started_at,
  listen_duration_ms,
  seek_count,
  pause_count,
  completion_percentage,
  created_at,
  updated_at
FROM shareable_track_plays
ORDER BY created_at DESC
LIMIT 5;
```

### 2. Ver Si Se Está Actualizando

```sql
SELECT 
  session_id,
  listen_duration_ms,
  seek_count,
  pause_count,
  updated_at
FROM shareable_track_plays
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY updated_at DESC;
```

**Si `updated_at` no cambia:** Las actualizaciones no se están guardando.

### 3. Verificar RLS Policies

```sql
-- Ver policies de INSERT
SELECT * FROM pg_policies 
WHERE tablename = 'shareable_track_plays' 
AND cmd = 'INSERT';

-- Ver policies de UPDATE
SELECT * FROM pg_policies 
WHERE tablename = 'shareable_track_plays' 
AND cmd = 'UPDATE';
```

**Debe existir:**
- Policy de INSERT que permita a cualquiera insertar
- Policy de UPDATE que permita actualizar por session_id

## 🛠️ Soluciones

### Solución 1: Verificar Estructura de Tabla

```sql
-- Ver columnas de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'shareable_track_plays'
ORDER BY ordinal_position;
```

**Columnas requeridas:**
- `seek_count` (integer)
- `pause_count` (integer)
- `play_count` (integer)
- `listen_duration_ms` (integer)
- `max_position_reached_ms` (integer)
- `completion_percentage` (decimal)
- `completed` (boolean)

### Solución 2: Recrear RLS Policies

```sql
-- Eliminar policies existentes
DROP POLICY IF EXISTS "Anyone can insert plays" ON shareable_track_plays;
DROP POLICY IF EXISTS "Anyone can update plays" ON shareable_track_plays;

-- Crear nuevas policies
CREATE POLICY "Anyone can insert plays"
ON shareable_track_plays FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Anyone can update plays"
ON shareable_track_plays FOR UPDATE
USING (TRUE);
```

### Solución 3: Verificar Datos Insertados

```sql
-- Ver el último play insertado
SELECT * FROM shareable_track_plays
ORDER BY created_at DESC
LIMIT 1;
```

**Verificar que tenga:**
- `session_id` (UUID válido)
- `shareable_track_id` (UUID válido)
- `started_at` (timestamp)
- Todos los campos inicializados en 0

## 📊 Test Manual

### Script de Test:

```javascript
// En la consola del navegador
const testUpdate = async () => {
  const supabase = createClient()
  
  // Obtener el último play
  const { data: plays } = await supabase
    .from('shareable_track_plays')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
  
  console.log('Last play:', plays[0])
  
  // Intentar actualizar
  const { data, error } = await supabase
    .from('shareable_track_plays')
    .update({
      seek_count: 5,
      pause_count: 3,
      listen_duration_ms: 15000
    })
    .eq('session_id', plays[0].session_id)
    .select()
  
  if (error) {
    console.error('❌ Update failed:', error)
  } else {
    console.log('✅ Update successful:', data)
  }
}

testUpdate()
```

## 🎯 Checklist de Verificación

- [ ] La tabla `shareable_track_plays` existe
- [ ] Todas las columnas necesarias existen
- [ ] RLS está habilitado
- [ ] Policy de INSERT permite insertar
- [ ] Policy de UPDATE permite actualizar
- [ ] Los logs en consola muestran eventos
- [ ] Los logs muestran "Play recorded successfully"
- [ ] Los logs muestran "Metrics updated" cada 5s
- [ ] `updated_at` cambia en la DB
- [ ] Los valores se actualizan en la DB

## 🚨 Si Nada Funciona

### Opción Nuclear: Recrear Tabla

```sql
-- CUIDADO: Esto borra todos los datos
DROP TABLE IF EXISTS shareable_track_plays CASCADE;

-- Volver a ejecutar la migración
-- supabase/migrations/20250930144000_create_shareable_tracks.sql
```

## 📞 Información para Debug

Si sigues teniendo problemas, proporciona:

1. **Logs de consola completos** (copiar todo)
2. **Resultado de esta query:**
```sql
SELECT * FROM shareable_track_plays 
ORDER BY created_at DESC 
LIMIT 1;
```
3. **Resultado de esta query:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'shareable_track_plays';
```

---

## ✅ Resultado Esperado

Después de arreglar, deberías ver:

**En Consola:**
```
✅ Play recorded successfully
✅ Metrics updated: { listenDuration: 5234, seekCount: 2, pauseCount: 1 }
✅ Metrics updated: { listenDuration: 10468, seekCount: 2, pauseCount: 1 }
```

**En Analytics:**
```
Total Seconds: 10s
Seeks: 2
Pauses: 1
Completion: 25%
```
