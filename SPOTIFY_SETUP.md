# 🎵 Configuración de Spotify API

Para que el dashboard de rendimiento muestre datos reales de Spotify, necesitas configurar las credenciales de la API de Spotify.

## 📋 Pasos para Obtener Credenciales

### 1. Crear una App en Spotify Developer Dashboard

1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Inicia sesión con tu cuenta de Spotify
3. Click en **"Create an App"**
4. Completa el formulario:
   - **App name**: Artist Management Analytics
   - **App description**: Dashboard para ver métricas de artistas
   - **Redirect URIs**: `http://localhost:3000/api/auth/callback/spotify`
   - Acepta los términos de servicio
5. Click en **"Create"**

### 2. Obtener Client ID y Client Secret

1. En la página de tu app, verás:
   - **Client ID**: Copia este valor
   - **Client Secret**: Click en "Show Client Secret" y copia el valor

### 3. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# Spotify API Credentials
SPOTIFY_CLIENT_ID=tu_client_id_aqui
SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
```

### 4. Reiniciar el Servidor de Desarrollo

```bash
# Detén el servidor (Ctrl + C)
# Inicia nuevamente
npm run dev
```

## ✅ Verificar que Funciona

1. Ve a **Analytics** en el dashboard
2. Click en cualquier artista que tenga Spotify conectado
3. Deberías ver:
   - ✅ Número real de followers
   - ✅ Popularidad del artista
   - ✅ Top 5 tracks con covers reales
   - ✅ Botón de play para escuchar previews

## 🔒 Seguridad

- **NUNCA** compartas tu Client Secret públicamente
- **NO** lo subas a GitHub (ya está en `.gitignore`)
- Usa variables de entorno en producción (Vercel, etc.)

## 🚀 En Producción (Vercel)

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
4. Redeploy tu aplicación

## 📊 Datos que se Obtienen

### Del Artista:
- Followers totales
- Popularidad (0-100)
- Géneros musicales
- Imágenes del perfil

### De los Tracks:
- Top 5 canciones más populares
- Nombre y popularidad de cada track
- Cover art del álbum
- Duración de la canción
- Preview URL (30 segundos)
- Enlace directo a Spotify

## ❓ Troubleshooting

### Error: "Failed to get Spotify token"
- Verifica que `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET` estén correctos
- Asegúrate de haber reiniciado el servidor después de agregar las variables

### Error: "Failed to fetch artist data"
- Verifica que el `spotify_artist_id` del artista sea correcto
- El ID debe ser el ID de Spotify (ej: `3TVXtAsR1Inumwj472S9r4`)

### No se muestran datos
- Verifica que el artista tenga `spotify_artist_id` en la base de datos
- Revisa la consola del navegador para ver errores específicos

## 🎯 Próximos Pasos

Una vez configurado, podrás:
- Ver métricas reales de todos tus artistas
- Comparar popularidad entre tracks
- Escuchar previews directamente desde el dashboard
- Acceder rápidamente a los perfiles de Spotify
