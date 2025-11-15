# 🔧 Cómo Arreglar el Error "Error creating user profile"

## ❌ El Problema

Estás viendo este error en la consola:
```
❌ Error creating user profile with user_type: {}
```

**Causa**: La tabla `user_profiles` no tiene la columna `user_type` porque la migración no se ha ejecutado.

---

## ✅ Solución en 3 Pasos (5 minutos)

### **PASO 1: Abrir Supabase SQL Editor**

1. Ve a https://supabase.com
2. Selecciona tu proyecto
3. En el menú lateral, haz click en **"SQL Editor"**
4. Haz click en **"New query"**

### **PASO 2: Ejecutar el Script de Migración**

1. **Abre el archivo**: `supabase/EJECUTAR_ESTO_PRIMERO.sql`
2. **Copia TODO el contenido** (Ctrl+A, Ctrl+C)
3. **Pégalo** en el SQL Editor de Supabase (Ctrl+V)
4. **Haz click en el botón "Run"** (esquina inferior derecha)

### **PASO 3: Verificar que Funcionó**

Deberías ver mensajes como:
```
✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
Ahora puedes probar el registro de nuevo
```

Y una tabla mostrando las columnas de `user_profiles` incluyendo:
- `user_type`
- `artist_profile_id`
- `username`
- `avatar_url`

---

## 🧪 Probar que Funciona

1. **Recarga tu aplicación** (F5)
2. **Ve a** `/auth/role-selection`
3. **Selecciona** "Artist" o "Manager"
4. **Completa el formulario** de sign up
5. **Deberías ser redirigido** al onboarding sin errores

---

## 🔍 Verificación Adicional (Opcional)

Si quieres verificar que todo está correcto, ejecuta esto en SQL Editor:

```sql
-- Ver las columnas de user_profiles
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Ver los usuarios creados
SELECT 
    id,
    user_id,
    user_type,
    username,
    onboarding_completed,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 5;
```

---

## 📊 Qué Hace el Script

El script `EJECUTAR_ESTO_PRIMERO.sql`:

1. ✅ Verifica el estado actual de la tabla
2. ✅ Crea el enum `user_type` ('artist', 'manager', 'other')
3. ✅ Agrega 4 columnas nuevas:
   - `user_type`: Tipo de usuario
   - `artist_profile_id`: Enlace al perfil de artista (solo para artists)
   - `username`: Nombre de usuario
   - `avatar_url`: URL del avatar
4. ✅ Crea índices para búsquedas rápidas
5. ✅ Muestra el resultado final

**Es seguro ejecutarlo múltiples veces** - no duplicará nada.

---

## 🚨 Si Aún Tienes Problemas

### Error: "relation 'user_profiles' does not exist"

La tabla `user_profiles` no existe. Ejecuta primero:

```sql
-- Crear la tabla user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type public.user_type,
  artist_profile_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  username TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies básicas
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Luego ejecuta `EJECUTAR_ESTO_PRIMERO.sql`.

### Error de Permisos

Si ves un error de permisos, asegúrate de estar usando el **service role key** o ejecutando desde el **SQL Editor de Supabase** (que tiene permisos completos).

### El Error Persiste Después de la Migración

1. **Limpia el caché del navegador** (Ctrl+Shift+Delete)
2. **Recarga la página** (Ctrl+F5)
3. **Verifica en la consola** que ahora ves:
   ```
   ✅ User profile created successfully
   ```

---

## 📝 Logs Mejorados

Con el código actualizado, ahora verás logs detallados en la consola:

```
📝 Creating user profile with data: { user_id: "...", user_type: "artist", ... }
🔍 Attempting to insert into user_profiles: { ... }
📊 Insert result - Data: [...] Error: null
✅ User profile created successfully: [...]
```

Esto te ayudará a diagnosticar cualquier problema.

---

## ✨ Después de Arreglar

Una vez que la migración esté completa:

- ✅ Los artistas podrán crear su perfil único
- ✅ Los managers podrán gestionar múltiples artistas
- ✅ El sistema redirigirá automáticamente según el tipo de usuario
- ✅ Todo funcionará como se diseñó

---

## 🆘 Necesitas Ayuda?

Si después de seguir estos pasos aún tienes problemas:

1. Copia el **error completo** de la consola del navegador (F12)
2. Copia el **resultado** de ejecutar `EJECUTAR_ESTO_PRIMERO.sql`
3. Comparte ambos para diagnóstico adicional
