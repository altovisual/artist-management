# 🖼️ Crear Bucket de Avatars Manualmente

Si la migración SQL no funciona por permisos, sigue estos pasos para crear el bucket manualmente desde el dashboard de Supabase.

## 📋 Pasos para Crear el Bucket

### 1. Ir a Storage

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **Storage**

### 2. Crear Nuevo Bucket

1. Haz clic en **"New bucket"** o **"Create a new bucket"**
2. Completa el formulario:

   **Configuración del Bucket:**
   ```
   Name: avatars
   Public bucket: ✅ SÍ (activar)
   File size limit: 5 MB
   Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp
   ```

3. Haz clic en **"Create bucket"**

### 3. Configurar Políticas RLS

Después de crear el bucket, necesitas configurar las políticas de seguridad.

#### Opción A: Desde el Dashboard

1. Ve a **Storage** > **Policies**
2. Selecciona el bucket **avatars**
3. Haz clic en **"New Policy"**

#### Opción B: Desde SQL Editor

1. Ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega este código:

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- 1. Permitir lectura pública de avatares
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 2. Permitir a usuarios subir su propio avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Permitir a usuarios actualizar su propio avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Permitir a usuarios eliminar su propio avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

4. Ejecuta la query

## ✅ Verificar Configuración

### Verificar que el bucket existe:

```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

Deberías ver:
```
id: avatars
name: avatars
public: true
file_size_limit: 5242880
allowed_mime_types: {image/jpeg, image/jpg, image/png, image/gif, image/webp}
```

### Verificar políticas:

```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%avatar%';
```

Deberías ver 4 políticas:
- ✅ Avatar images are publicly accessible
- ✅ Users can upload their own avatar
- ✅ Users can update their own avatar
- ✅ Users can delete their own avatar

## 🧪 Probar Upload

1. Ve a tu aplicación
2. Inicia sesión con un usuario
3. Ve al onboarding paso 2 (Perfil)
4. Intenta subir una imagen
5. Debería funcionar sin errores

## 🔧 Troubleshooting

### Error: "Bucket not found"
- Verifica que el bucket se llame exactamente `avatars` (minúsculas)
- Verifica que el bucket existe en Storage

### Error: "Permission denied"
- Verifica que las 4 políticas RLS estén creadas
- Verifica que el bucket sea público

### Error: "File too large"
- La imagen debe ser menor a 5MB
- Verifica el `file_size_limit` del bucket

### Error: "Invalid file type"
- Solo se permiten: JPG, JPEG, PNG, GIF, WEBP
- Verifica los `allowed_mime_types` del bucket

## 📸 Screenshots de Referencia

### Crear Bucket:
```
Storage > New Bucket
├── Name: avatars
├── Public: ✅
├── File size limit: 5 MB
└── Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp
```

### Políticas Creadas:
```
Storage > Policies > avatars
├── ✅ Avatar images are publicly accessible (SELECT)
├── ✅ Users can upload their own avatar (INSERT)
├── ✅ Users can update their own avatar (UPDATE)
└── ✅ Users can delete their own avatar (DELETE)
```

## 🎯 Siguiente Paso

Una vez creado el bucket y configuradas las políticas, el sistema de onboarding debería funcionar completamente. Prueba:

1. Crear un usuario nuevo (no admin)
2. Iniciar sesión
3. Completar el onboarding
4. Subir un avatar en el paso 2

¡Listo! 🎉
