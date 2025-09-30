# 🚀 Quick Start - Sistema de Links Compartibles

## ⚡ Configuración Rápida (5 minutos)

### 1️⃣ Aplicar Migración

```bash
cd c:\Users\altov\Downloads\artist-management
supabase db push --include-all
```

✅ Esto crea las tablas necesarias en Supabase.

---

### 2️⃣ Crear Bucket de Audio en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Storage** en el menú lateral
4. Click en **"New bucket"**
5. Nombre: `audio-tracks`
6. **Marca como público** ✅
7. Click "Create bucket"

---

### 3️⃣ Subir Tu Primera Canción

**En Supabase Storage:**

1. Click en el bucket `audio-tracks`
2. Click "Upload file"
3. Selecciona tu archivo MP3/WAV
4. Una vez subido, click en el archivo
5. Click "Get URL" o "Copy URL"
6. **Guarda esta URL** - la necesitarás

**Ejemplo de URL:**
```
https://[tu-proyecto].supabase.co/storage/v1/object/public/audio-tracks/mi-cancion.mp3
```

---

### 4️⃣ Crear Link Compartible

**En tu app:**

1. Navega a: `http://localhost:3000/share-tracks`
2. Click en **"Create Share Link"**
3. Llena el formulario:

```
Track Name: Impaciente
Artist Name: Borngud
Audio File URL: [pega la URL de Supabase]
Cover Image URL: https://picsum.photos/400/400 (opcional)
Description: Mi nuevo single (opcional)
Genre: Hip Hop (opcional)
```

4. Click **"Create Share Link"**

✅ ¡Link generado automáticamente!

---

### 5️⃣ Compartir y Medir

**Tu link se verá así:**
```
http://localhost:3000/listen/abc123XY
```

**Compártelo en:**
- 📱 WhatsApp
- 📘 Facebook
- 📸 Instagram Stories
- 🐦 Twitter/X
- 📧 Email
- 💬 Telegram

**Cada persona que lo abra será rastreada automáticamente** ✅

---

### 6️⃣ Ver Analytics

1. Vuelve a `/share-tracks`
2. Verás tu track con stats:
   - 🎧 Total plays
   - 👥 Unique listeners
   - 📊 Completion rate
3. Click **"View Analytics"** para detalles completos

---

## 🎯 Lo que se Mide Automáticamente

Cada vez que alguien escucha tu track:

✅ **Ubicación**: País y ciudad
✅ **Dispositivo**: Mobile/Desktop/Tablet
✅ **Browser**: Chrome, Safari, Firefox, etc.
✅ **Sistema**: Windows, macOS, iOS, Android
✅ **Duración**: Cuánto tiempo escuchó
✅ **Completación**: Si terminó la canción
✅ **Origen**: De dónde vino (referrer)
✅ **Interacciones**: Plays, pauses, seeks

---

## 📊 Dashboard de Analytics

En `/share-tracks` verás:

### Stats Generales:
- **Total Tracks**: Cuántos links has creado
- **Total Plays**: Reproducciones totales
- **Unique Listeners**: Oyentes únicos
- **Avg Completion**: Tasa promedio de completación

### Por Cada Track:
- Plays y listeners específicos
- Link para copiar/compartir
- Botón para ver analytics detallados
- Activar/desactivar link
- Eliminar track

---

## 🎨 Página Pública de Reproducción

Cuando alguien abre tu link (`/listen/abc123XY`):

✨ **Ve un reproductor profesional con:**
- Cover art grande
- Nombre del track y artista
- Controles de reproducción (play/pause)
- Barra de progreso
- Control de volumen
- Botón de compartir
- Diseño hermoso estilo Spotify

🔒 **No necesita login** - Cualquiera puede escuchar
📊 **Todo se registra** - Analytics automáticos

---

## 💡 Tips Rápidos

### Subir Cover Art
1. Sube imagen a Supabase Storage (mismo bucket o uno nuevo)
2. Copia la URL
3. Pégala en "Cover Image URL"

### Desactivar Link Temporalmente
- Click en "Deactivate" en el dashboard
- El link dejará de funcionar
- Puedes reactivarlo cuando quieras

### Eliminar Track
- Click en el botón de basura 🗑️
- Confirma la eliminación
- Se borra el track y todos sus analytics

### Copiar Link Rápido
- Click en el icono de copiar 📋
- Link copiado al clipboard
- Pégalo donde quieras

---

## 🔥 Casos de Uso Rápidos

### 1. Lanzamiento de Single
```
1. Sube el single a Storage
2. Crea link compartible
3. Comparte en redes sociales
4. Mide engagement en tiempo real
```

### 2. Demo para Sello Discográfico
```
1. Sube tu demo
2. Crea link privado
3. Envía solo al sello
4. Ve si lo escucharon y cuánto
```

### 3. Preview para Fans
```
1. Sube versión preview
2. Comparte con fans cercanos
3. Mide feedback (completion rate)
4. Decide si lanzar oficialmente
```

---

## ⚠️ Troubleshooting Rápido

### "Track not found"
- ✅ Verifica que el link esté activo
- ✅ Revisa que no haya expirado
- ✅ Confirma que el share_code es correcto

### "Audio no se reproduce"
- ✅ Verifica que la URL del audio sea pública
- ✅ Confirma que el archivo existe en Storage
- ✅ Revisa la consola del navegador

### "No se registran analytics"
- ✅ Verifica que la migración se aplicó
- ✅ Revisa las RLS policies en Supabase
- ✅ Confirma que el track_id es correcto

---

## 📱 Producción

Para usar en producción:

1. **Actualiza las URLs** en el código:
```tsx
const baseUrl = 'https://tu-dominio.com'
```

2. **Configura CORS** en Supabase Storage

3. **Optimiza imágenes** para web

4. **Agrega CDN** para audio (opcional)

---

## 🎉 ¡Listo!

Ya tienes un sistema completo de distribución de música con analytics profesionales.

**Próximos pasos:**
1. ✅ Sube más canciones
2. ✅ Comparte más links
3. ✅ Analiza los datos
4. ✅ Optimiza tu estrategia

**¡Disfruta midiendo el impacto de tu música! 🎵**
