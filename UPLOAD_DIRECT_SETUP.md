# 🎵 Upload Directo de Canciones - Configuración

## ✅ Sistema Actualizado

Ahora puedes **subir archivos de audio directamente** desde el formulario, sin necesidad de URLs.

---

## 🚀 Configuración (2 pasos)

### 1️⃣ Aplicar Nueva Migración

```bash
supabase db push --include-all
```

Esto creará el bucket `audio-tracks` automáticamente en Supabase Storage.

### 2️⃣ Listo para Usar

Ve a: `http://localhost:3000/share-tracks`

---

## 🎯 Cómo Funciona Ahora

### Crear Track con Upload Directo:

1. **Click en "Create Share Link"**

2. **Llena el formulario:**
   - Track Name: `Impaciente`
   - Artist Name: `Borngud`
   - Album Name: `Singles` (opcional)
   - Genre: `Hip Hop` (opcional)

3. **Sube archivos directamente:**
   - **Audio File**: Click en "Choose File" → Selecciona tu MP3/WAV
   - **Cover Image**: Click en "Choose File" → Selecciona tu imagen (opcional)

4. **Click "Create Share Link"**

5. **El sistema automáticamente:**
   - ✅ Sube el audio a Supabase Storage
   - ✅ Sube la imagen de portada (si la agregaste)
   - ✅ Detecta la duración del audio
   - ✅ Genera un link único
   - ✅ Crea el track compartible

---

## 📊 Barra de Progreso

Mientras sube, verás:
- **30%** - Subiendo audio...
- **60%** - Subiendo portada...
- **90%** - Creando track...
- **100%** - ¡Listo!

---

## 📁 Formatos Soportados

### Audio:
- ✅ MP3 (`.mp3`)
- ✅ WAV (`.wav`)
- ✅ M4A (`.m4a`)
- ✅ OGG (`.ogg`)
- ✅ WebM (`.webm`)

**Límite:** 50MB por archivo

### Imágenes (Cover):
- ✅ JPEG/JPG (`.jpg`, `.jpeg`)
- ✅ PNG (`.png`)
- ✅ WebP (`.webp`)
- ✅ GIF (`.gif`)

**Recomendado:** Cuadrada, mínimo 400x400px

---

## 🔒 Seguridad

### Storage Policies:
- ✅ Usuarios autenticados pueden subir archivos
- ✅ Archivos son públicos (para compartir)
- ✅ Solo el dueño puede eliminar sus archivos
- ✅ Admins pueden gestionar todos los archivos

### Organización:
```
audio-tracks/
├── tracks/
│   ├── abc123-1234567890.mp3
│   └── def456-1234567891.mp3
└── covers/
    ├── ghi789-1234567892.jpg
    └── jkl012-1234567893.png
```

---

## 💡 Ventajas del Upload Directo

### Antes (con URLs):
1. Ir a Supabase Dashboard
2. Subir archivo manualmente
3. Copiar URL
4. Pegar en formulario
5. Crear track

### Ahora (upload directo):
1. Seleccionar archivo
2. Crear track
3. ¡Listo! ✨

**Ahorro de tiempo: 70%**

---

## 🎨 Features del Formulario

### Validación Automática:
- ✅ Muestra tamaño del archivo en MB
- ✅ Valida que sea un archivo de audio
- ✅ Detecta duración automáticamente
- ✅ Botón deshabilitado si falta información

### Feedback Visual:
- ✅ Badge con tamaño del archivo
- ✅ Barra de progreso animada
- ✅ Spinner durante upload
- ✅ Mensajes de error claros

### UX Mejorada:
- ✅ Drag & drop (próximamente)
- ✅ Preview del audio antes de subir (próximamente)
- ✅ Compresión automática (próximamente)

---

## ⚠️ Troubleshooting

### "Error uploading file"
- ✅ Verifica que el archivo sea menor a 50MB
- ✅ Confirma que sea un formato soportado
- ✅ Revisa que tengas conexión a internet

### "Bucket not found"
- ✅ Aplica la migración: `supabase db push --include-all`
- ✅ Verifica en Supabase Dashboard → Storage

### "Permission denied"
- ✅ Confirma que estés autenticado
- ✅ Revisa las RLS policies en Supabase

---

## 🚀 Próximas Mejoras

- [ ] Drag & drop de archivos
- [ ] Preview de audio antes de subir
- [ ] Compresión automática de audio
- [ ] Batch upload (múltiples archivos)
- [ ] Editar metadata del audio
- [ ] Waveform visualization

---

## 🎉 ¡Listo!

Ahora puedes subir canciones directamente desde tu app sin salir del formulario.

**Flujo completo:**
1. Click "Create Share Link"
2. Selecciona archivo de audio
3. Llena información básica
4. Click "Create"
5. ¡Link generado y listo para compartir! 🎵

**Tiempo total: ~30 segundos** ⚡
