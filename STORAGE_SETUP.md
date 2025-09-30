# Configuración de Storage en Supabase

## Error: "Bucket not found"

Este error ocurre cuando el bucket `artist-images` no existe en Supabase Storage.

## Solución

### Opción 1: Crear el Bucket desde la UI de Supabase (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, selecciona **Storage**
3. Click en **New bucket**
4. Configura el bucket:
   - **Name**: `artist-images`
   - **Public bucket**: ✅ Activado (para que las imágenes sean públicas)
   - **File size limit**: 5 MB (recomendado)
   - **Allowed MIME types**: `image/*` (solo imágenes)
5. Click en **Create bucket**

### Opción 2: Crear el Bucket con SQL

1. Ve a **SQL Editor** en Supabase Dashboard
2. Ejecuta el archivo `supabase/storage-buckets.sql`:

```sql
-- Create storage bucket for artist images
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-images', 'artist-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'artist-images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artist-images' 
  AND auth.role() = 'authenticated'
);
```

## Políticas de Seguridad

El bucket está configurado con las siguientes políticas:

- ✅ **Lectura pública**: Cualquiera puede ver las imágenes
- ✅ **Upload autenticado**: Solo usuarios autenticados pueden subir
- ✅ **Update/Delete**: Solo el usuario que subió puede modificar/eliminar

## Manejo de Errores en el Código

El código ya está preparado para manejar el error gracefully:

- Si el bucket no existe, el artista se crea **sin imagen**
- Se muestra un toast warning al usuario
- El proceso continúa normalmente

## Verificar que Funciona

1. Crea el bucket en Supabase
2. Intenta crear un nuevo artista con imagen
3. La imagen debería subirse correctamente
4. Verifica en Storage > artist-images que la imagen está ahí

## Estructura de Archivos

Los archivos se guardan con el formato:
```
{timestamp}-{random}.{extension}
```

Ejemplo: `1234567890-abc123.jpg`

## Troubleshooting

### Error: "new row violates row-level security policy"
- Verifica que las políticas de RLS estén creadas
- Asegúrate de estar autenticado

### Error: "File size exceeds limit"
- Reduce el tamaño de la imagen
- Ajusta el límite en la configuración del bucket

### Las imágenes no se ven
- Verifica que el bucket sea público
- Revisa la URL generada en la consola
