# 🎵 Sistema de Links Compartibles - Guía Completa

## 🎯 ¿Qué es esto?

Un sistema completo para **subir canciones, generar links únicos y medir analytics** de cada persona que escucha tu música.

### Flujo Completo:

1. **Subes una canción** → Sistema genera un link único
2. **Compartes el link** → `yourapp.com/listen/abc123`
3. **Personas escuchan** → Se registra todo automáticamente
4. **Ves analytics** → Quién, cuándo, cuánto tiempo, desde dónde

---

## ✅ Lo que se Implementó

### 1. **Base de Datos** ✅

**Tabla `shareable_tracks`:**
- Información del track (nombre, artista, álbum, cover, audio URL)
- Link único generado automáticamente
- Configuración (activo/inactivo, público/privado, password, límites)
- Analytics agregados (plays, listeners, completion rate)

**Tabla `shareable_track_plays`:**
- Cada reproducción registrada
- Info del oyente (país, ciudad, IP hasheada)
- Info del dispositivo (mobile/desktop, browser, OS)
- Métricas de escucha (duración, completion, seeks, pauses)
- Referrer y UTM tracking

### 2. **Hooks de React** ✅

**`useShareableTracks()`** - Para gestionar tus tracks:
- `createTrack()` - Crear nuevo track compartible
- `updateTrack()` - Actualizar track
- `deleteTrack()` - Eliminar track
- `toggleActive()` - Activar/desactivar link
- `getTrackAnalytics()` - Obtener analytics detallados

**`usePublicTrack(shareCode)`** - Para acceso público:
- Obtiene track por código sin autenticación
- Usado en la página pública de reproducción

### 3. **Páginas** ✅

**Dashboard de Gestión** (`/share-tracks`):
- Lista de todos tus tracks compartidos
- Stats generales (total plays, listeners, completion)
- Crear nuevos links
- Copiar/compartir links
- Ver analytics por track
- Activar/desactivar tracks

**Página Pública** (`/listen/[code]`):
- Reproductor profesional estilo Spotify
- Sin necesidad de login
- Registra analytics automáticamente
- Botón de compartir integrado
- Responsive y hermoso

---

## 🚀 Cómo Usar

### Paso 1: Aplicar Migración

```bash
supabase db push --include-all
```

Esto creará las tablas `shareable_tracks` y `shareable_track_plays`.

### Paso 2: Subir Audio a Supabase Storage

1. Ve a Supabase Dashboard → Storage
2. Crea un bucket llamado `audio-tracks` (público)
3. Sube tu archivo de audio (MP3, WAV, etc.)
4. Copia la URL pública del archivo

### Paso 3: Crear Track Compartible

1. Ve a `/share-tracks` en tu app
2. Click en "Create Share Link"
3. Llena el formulario:
   - **Track Name**: Nombre de la canción
   - **Artist Name**: Nombre del artista
   - **Audio File URL**: URL del archivo en Storage
   - **Cover Image URL**: (Opcional) URL de la portada
   - **Description**: (Opcional) Descripción
   - **Genre**: (Opcional) Género musical

4. Click "Create Share Link"

### Paso 4: Compartir el Link

El sistema genera automáticamente:
```
https://tu-app.com/listen/abc123XY
```

Comparte este link en:
- ✅ Redes sociales (Instagram, Twitter, Facebook)
- ✅ WhatsApp, Telegram
- ✅ Email
- ✅ Cualquier lugar

### Paso 5: Ver Analytics

1. En `/share-tracks`, click en "View Analytics" de cualquier track
2. Verás:
   - Total de reproducciones
   - Oyentes únicos
   - Tiempo total de escucha
   - Tasa de completación
   - Países de origen
   - Dispositivos usados
   - Referrers (de dónde vienen)
   - Gráfica de plays por día

---

## 📊 Datos que se Miden

### Por Cada Reproducción:

**Información del Oyente:**
- ✅ País y ciudad (vía IP geolocation)
- ✅ IP hasheada (privacidad)
- ✅ User ID (si está logueado)

**Información del Dispositivo:**
- ✅ Tipo (mobile/desktop/tablet)
- ✅ Browser (Chrome, Safari, Firefox, etc.)
- ✅ Sistema operativo (Windows, macOS, iOS, Android)

**Información de Origen:**
- ✅ Referrer URL (de dónde vino)
- ✅ UTM parameters (source, medium, campaign)

**Métricas de Escucha:**
- ✅ Duración de escucha (en milisegundos)
- ✅ Posición máxima alcanzada
- ✅ Porcentaje de completación
- ✅ Si completó la canción (>90%)
- ✅ Número de plays, pauses, seeks

**Timestamps:**
- ✅ Cuándo empezó a escuchar
- ✅ Cuándo terminó

---

## 🎨 Características Avanzadas

### 1. **Password Protection** (Próximamente)
```tsx
await createTrack({
  // ...
  password: 'mi-password-secreto'
})
```

### 2. **Límite de Reproducciones**
```tsx
await createTrack({
  // ...
  max_plays: 1000 // Solo 1000 reproducciones
})
```

### 3. **Fecha de Expiración**
```tsx
await createTrack({
  // ...
  expires_at: '2025-12-31T23:59:59Z'
})
```

### 4. **Activar/Desactivar**
```tsx
await toggleActive(trackId, false) // Desactiva el link
```

---

## 📈 Queries SQL Útiles

### Ver Todos los Plays de un Track
```sql
SELECT * FROM shareable_track_plays
WHERE shareable_track_id = 'track-uuid'
ORDER BY started_at DESC;
```

### Top Países por Plays
```sql
SELECT 
  listener_country,
  COUNT(*) as plays
FROM shareable_track_plays
WHERE shareable_track_id = 'track-uuid'
GROUP BY listener_country
ORDER BY plays DESC;
```

### Analytics Completos
```sql
SELECT * FROM get_shareable_track_analytics(
  'track-uuid',
  NOW() - INTERVAL '30 days',
  NOW()
);
```

### Tracks Más Populares
```sql
SELECT 
  track_name,
  artist_name,
  total_plays,
  unique_listeners,
  avg_completion_rate
FROM shareable_tracks
WHERE is_active = TRUE
ORDER BY total_plays DESC
LIMIT 10;
```

---

## 🔒 Seguridad y Privacidad

### RLS Policies Implementadas:

**Shareable Tracks:**
- ✅ Usuarios solo ven sus propios tracks
- ✅ Público puede ver tracks activos por share_code
- ✅ Admins pueden ver todos los tracks

**Track Plays:**
- ✅ Dueños de tracks pueden ver sus plays
- ✅ Cualquiera puede insertar plays (para tracking anónimo)
- ✅ Admins pueden ver todos los plays

### Privacidad:
- ✅ IPs son hasheadas, no se guardan en texto plano
- ✅ Geolocation es solo país/ciudad, no dirección exacta
- ✅ No se guarda información personal sin consentimiento

---

## 🎯 Casos de Uso

### 1. **Lanzamiento de Single**
- Sube tu nuevo single
- Comparte el link en redes sociales
- Mide el engagement en tiempo real
- Ve desde qué países te escuchan más

### 2. **Demo para Sellos**
- Sube tu demo
- Envía el link al sello discográfico
- Ve si lo escucharon y cuánto tiempo
- Tracking de engagement profesional

### 3. **Feedback de Fans**
- Comparte versiones preview
- Mide qué partes saltan (seeks)
- Ve la tasa de completación
- Decide qué tracks lanzar oficialmente

### 4. **Campañas de Marketing**
- Usa UTM parameters en tus links
- Mide qué campaña trae más oyentes
- Optimiza tu estrategia de marketing
- ROI medible

---

## 🛠️ Personalización

### Cambiar Diseño del Reproductor

Edita: `app/listen/[code]/page.tsx`

```tsx
// Cambiar colores
className="bg-gradient-to-br from-purple-900 via-pink-800 to-black"

// Cambiar tamaño del cover
className="w-full md:w-80 aspect-square"

// Agregar más info
{track.genre && <Badge>{track.genre}</Badge>}
```

### Agregar Campos Personalizados

1. Agrega columna en migración:
```sql
ALTER TABLE shareable_tracks 
ADD COLUMN custom_field TEXT;
```

2. Actualiza interfaces en `hooks/use-shareable-tracks.ts`

3. Usa en formulario de creación

---

## 📱 Integración con Redes Sociales

### Open Graph Tags (Próximamente)

Agrega en `app/listen/[code]/page.tsx`:

```tsx
export async function generateMetadata({ params }) {
  const track = await getTrackByCode(params.code)
  
  return {
    title: `${track.track_name} - ${track.artist_name}`,
    description: track.description,
    openGraph: {
      images: [track.cover_image_url],
      audio: track.audio_file_url
    }
  }
}
```

### Botones de Compartir

Ya incluidos en la página pública:
- ✅ Share API nativo (mobile)
- ✅ Copy to clipboard (desktop)
- ✅ Fácil de extender con más redes

---

## 🎉 Resultado Final

Tienes un sistema completo de distribución de música con:

✅ **Upload fácil** - Sube y crea links en segundos
✅ **Links únicos** - Cada track tiene su propio código
✅ **Reproductor profesional** - Diseño hermoso estilo Spotify
✅ **Analytics completos** - Mide todo lo importante
✅ **Sin login requerido** - Cualquiera puede escuchar
✅ **Tracking automático** - Todo se registra solo
✅ **Dashboard intuitivo** - Gestiona todo desde un lugar
✅ **Escalable** - Soporta miles de tracks y millones de plays

---

## 🚀 Próximos Pasos

1. **Aplicar migración**: `supabase db push --include-all`
2. **Crear bucket de audio** en Supabase Storage
3. **Subir tu primera canción**
4. **Crear tu primer link** en `/share-tracks`
5. **Compartir y medir** 🎉

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que la migración se aplicó correctamente
2. Asegúrate de que el audio está en Storage público
3. Revisa la consola del navegador para errores
4. Verifica las RLS policies en Supabase

**¡Tu sistema de distribución de música con analytics está listo! 🎵**
