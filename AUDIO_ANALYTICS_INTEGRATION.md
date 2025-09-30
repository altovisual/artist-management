# 🎵 Sistema de Audio Analytics - Guía de Integración

## 📋 Descripción General

Sistema completo de tracking de audio que registra todas las interacciones del usuario con los reproductores de audio en la aplicación.

## 🎯 Eventos Rastreados

### 1. **Play** - Inicio de reproducción
- Se registra cuando el usuario presiona play
- Captura la posición actual del audio
- Inicia el tracking de sesión

### 2. **Pause** - Pausa de reproducción
- Se registra cuando el usuario pausa
- Calcula la duración de escucha desde el último play
- Detiene el tracking de progreso

### 3. **Complete** - Finalización completa
- Se registra cuando el audio termina naturalmente
- Marca la sesión como completada
- Calcula el tiempo total de escucha

### 4. **Seek** - Salto en el audio
- Se registra cuando el usuario salta a otra parte
- Solo si el salto es mayor a 2 segundos
- Guarda la posición anterior y nueva

### 5. **Progress** - Señal de escucha activa
- Se envía cada 30 segundos (configurable)
- Confirma que el usuario sigue escuchando
- Útil para calcular engagement real

### 6. **Error** - Errores de reproducción
- Se registra cuando hay un error en el audio
- Ayuda a identificar problemas técnicos

## 🚀 Instalación

### 1. Ejecutar la migración de Supabase

```bash
# Aplicar la migración en Supabase
supabase migration up
```

O ejecutar manualmente el archivo:
```
supabase/migrations/20250130000000_create_audio_analytics.sql
```

### 2. Instalar dependencia UUID

```bash
npm install uuid
npm install --save-dev @types/uuid
```

## 💻 Uso del Hook

### Ejemplo Básico

```tsx
import { useAudioAnalytics } from '@/hooks/use-audio-analytics'

function MyAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Inicializar analytics
  const { sessionId } = useAudioAnalytics({
    trackInfo: {
      trackId: 'spotify-track-123',
      trackName: 'Impaciente',
      artistName: 'Borngud',
      albumName: 'Singles Collection',
      durationMs: 195000,
      source: 'spotify' // 'spotify' | 'muso_ai' | 'creative_vault' | 'other'
    },
    audioElement: audioRef.current,
    enabled: true, // Activar/desactivar tracking
    progressIntervalMs: 30000 // Intervalo de progreso (30 segundos por defecto)
  })

  return (
    <audio ref={audioRef} src="preview-url.mp3" />
  )
}
```

### Ejemplo Completo con Componente

Ver: `components/audio-player-with-analytics.tsx`

```tsx
import { AudioPlayerWithAnalytics } from '@/components/audio-player-with-analytics'

function MyPage() {
  return (
    <AudioPlayerWithAnalytics
      track={{
        id: 'track-123',
        name: 'Impaciente',
        artist: 'Borngud',
        album: 'Singles',
        albumArt: 'https://...',
        previewUrl: 'https://...',
        durationMs: 195000
      }}
      source="spotify"
      onNext={() => console.log('Next track')}
      onPrevious={() => console.log('Previous track')}
      autoPlay={false}
    />
  )
}
```

## 📊 Panel de Analytics

### Acceder al Dashboard

```
/analytics/audio
```

### Componente Standalone

```tsx
import { AudioAnalyticsPanel } from '@/components/audio-analytics-panel'

function MyAnalyticsPage() {
  return (
    <AudioAnalyticsPanel
      userId="optional-user-id" // Omitir para usuario actual
      dateRange={{
        start: new Date('2025-01-01'),
        end: new Date()
      }}
    />
  )
}
```

## 🔧 Integración en Reproductores Existentes

### Opción 1: Integración Directa

```tsx
// En tu componente existente
import { useAudioAnalytics } from '@/hooks/use-audio-analytics'

function ExistingPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Agregar esta línea
  useAudioAnalytics({
    trackInfo: {
      trackId: track.id,
      trackName: track.name,
      artistName: track.artist,
      durationMs: track.duration_ms,
      source: 'spotify'
    },
    audioElement: audioRef.current,
    enabled: true
  })
  
  // Tu código existente...
}
```

### Opción 2: Wrapper Component

```tsx
// Envolver tu reproductor existente
import { useAudioAnalytics } from '@/hooks/use-audio-analytics'

function AudioPlayerWrapper({ children, trackInfo, audioElement }) {
  useAudioAnalytics({
    trackInfo,
    audioElement,
    enabled: true
  })
  
  return children
}
```

## 📈 Métricas Disponibles

### En el Panel de Analytics

1. **Total Plays**: Número total de reproducciones
2. **Listen Time**: Tiempo total de escucha
3. **Completion Rate**: % de tracks completados
4. **Unique Tracks**: Tracks únicos reproducidos
5. **Seeks**: Número de saltos
6. **Pauses**: Número de pausas

### Top Tracks

- Tracks más reproducidos
- Tiempo total de escucha por track
- Porcentaje de completación promedio
- Número de oyentes únicos

### Actividad Reciente

- Últimos 20 eventos
- Tipo de evento
- Posición en el track
- Timestamp

## 🔍 Queries Disponibles

### Función: get_audio_analytics_summary

```sql
SELECT * FROM get_audio_analytics_summary(
  p_user_id := 'user-uuid',
  p_start_date := '2025-01-01',
  p_end_date := NOW()
);
```

### Función: get_top_audio_tracks

```sql
SELECT * FROM get_top_audio_tracks(
  p_user_id := 'user-uuid',
  p_limit := 10,
  p_start_date := '2025-01-01'
);
```

### Query Manual de Eventos

```sql
SELECT 
  track_name,
  event_type,
  COUNT(*) as event_count,
  AVG(completion_percentage) as avg_completion
FROM audio_events
WHERE user_id = 'user-uuid'
  AND event_timestamp >= NOW() - INTERVAL '30 days'
GROUP BY track_name, event_type
ORDER BY event_count DESC;
```

## 🎨 Personalización

### Cambiar Intervalo de Progress

```tsx
useAudioAnalytics({
  // ...
  progressIntervalMs: 15000 // Cada 15 segundos en lugar de 30
})
```

### Desactivar Tracking Temporalmente

```tsx
const [trackingEnabled, setTrackingEnabled] = useState(true)

useAudioAnalytics({
  // ...
  enabled: trackingEnabled
})
```

### Tracking Manual de Eventos

```tsx
const { trackEvent } = useAudioAnalytics({...})

// Trackear evento personalizado
trackEvent({
  eventType: 'custom',
  currentPositionMs: 15000,
  listenDurationMs: 5000
})
```

## 🔐 Seguridad y Privacidad

### RLS Policies

- ✅ Usuarios solo ven sus propios datos
- ✅ Admins pueden ver todos los datos
- ✅ No se puede modificar datos de otros usuarios

### Datos Almacenados

- User ID (referencia a auth.users)
- Track ID (no datos sensibles)
- Timestamps de eventos
- Posiciones de reproducción
- Device type (mobile/desktop/tablet)
- Source (spotify/muso_ai/etc)

## 📱 Soporte de Dispositivos

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS Safari, Chrome Mobile)
- ✅ Tablet
- ✅ Detección automática de tipo de dispositivo

## 🐛 Debugging

### Modo Development

En desarrollo, el componente muestra el Session ID:

```tsx
{process.env.NODE_ENV === 'development' && (
  <div>Session: {sessionId}</div>
)}
```

### Console Logs

El hook registra eventos en la consola:

```
🎵 Audio Analytics Event: {
  type: 'play',
  track: 'Impaciente',
  position: '15s',
  completion: '25%'
}
```

### Verificar Eventos en Supabase

```sql
SELECT * FROM audio_events 
WHERE session_id = 'session-uuid'
ORDER BY event_timestamp DESC;
```

## 📊 Ejemplos de Análisis

### Tracks con Mayor Engagement

```sql
SELECT 
  track_name,
  AVG(completion_percentage) as avg_completion,
  COUNT(DISTINCT session_id) as sessions,
  SUM(listen_duration_ms) / 1000 / 60 as total_minutes
FROM audio_events
WHERE event_type IN ('play', 'complete', 'progress')
GROUP BY track_name
HAVING COUNT(DISTINCT session_id) > 5
ORDER BY avg_completion DESC;
```

### Horas Pico de Escucha

```sql
SELECT 
  EXTRACT(HOUR FROM event_timestamp) as hour,
  COUNT(*) as plays
FROM audio_events
WHERE event_type = 'play'
GROUP BY hour
ORDER BY plays DESC;
```

### Tasa de Abandono por Posición

```sql
SELECT 
  FLOOR(current_position_ms / 10000) * 10 as position_seconds,
  COUNT(*) FILTER (WHERE event_type = 'pause') as pauses,
  COUNT(*) FILTER (WHERE event_type = 'complete') as completes
FROM audio_events
GROUP BY position_seconds
ORDER BY position_seconds;
```

## 🚀 Próximos Pasos

1. **Ejecutar migración en Supabase**
2. **Integrar hook en reproductores existentes**
3. **Acceder al dashboard en `/analytics/audio`**
4. **Revisar métricas y ajustar según necesidades**

## 📞 Soporte

Para preguntas o problemas:
- Revisar logs en consola del navegador
- Verificar que la migración se ejecutó correctamente
- Confirmar que el usuario está autenticado
- Revisar RLS policies en Supabase

---

**¡Sistema listo para usar!** 🎉
