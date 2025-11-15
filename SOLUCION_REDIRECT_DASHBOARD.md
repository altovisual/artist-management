# 🔧 Solución: Usuario va al Dashboard en lugar del Formulario

## ❌ Problema

Después de hacer login con una cuenta nueva de Artist, el usuario es enviado al dashboard en lugar del formulario de onboarding.

**Error en consola**:
```
Error fetching user profile: {}
```

## 🔍 Diagnóstico

### Paso 1: Ejecutar Script de Diagnóstico

1. **Abre Supabase SQL Editor**
2. **Ejecuta**: `supabase/DIAGNOSTICO_PERFILES.sql`
3. **Revisa los resultados**:
   - ¿Hay usuarios sin perfil?
   - ¿El perfil tiene `user_type` = 'artist'?
   - ¿Las columnas existen?

### Paso 2: Verificar en la Consola del Navegador

Después de hacer login, deberías ver estos logs:

```
🔍 ArtistRedirectWrapper: Checking user type...
👤 User found: [user-id]
📋 Profile found: { user_type: 'artist', artist_profile_id: null }
🎵 User is an artist
⚠️ Artist without profile, redirecting to onboarding
```

**Si ves**:
- `❌ Error fetching user profile` → El perfil no existe o hay error de columna
- `⚠️ No profile found for user` → El perfil no se creó durante sign up
- `💼 User is not an artist` → El user_type no es 'artist'

## ✅ Soluciones

### Solución 1: Crear Perfil Manualmente (Temporal)

Si el perfil no se creó durante el sign up, créalo manualmente:

```sql
-- Reemplaza 'USER_ID_AQUI' con el ID del usuario
-- Reemplaza 'artist' con el tipo correcto

INSERT INTO public.user_profiles (user_id, user_type, onboarding_completed)
VALUES ('USER_ID_AQUI', 'artist', false);
```

### Solución 2: Verificar que la Migración se Ejecutó

Ejecuta esto para verificar:

```sql
-- Verificar que la columna user_type existe
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
AND column_name = 'user_type';
```

**Si no devuelve nada**, ejecuta de nuevo:
```
supabase/EJECUTAR_ESTO_PRIMERO.sql
```

### Solución 3: Verificar RLS Policies

Las RLS policies podrían estar bloqueando la lectura del perfil:

```sql
-- Ver las policies actuales
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Temporalmente deshabilitar RLS para probar (SOLO PARA DEBUG)
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Después de probar, VOLVER A HABILITAR
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

### Solución 4: Limpiar y Volver a Intentar

1. **Elimina el usuario de prueba**:
   ```sql
   -- Primero elimina el perfil
   DELETE FROM public.user_profiles WHERE user_id = 'USER_ID_AQUI';
   
   -- Luego elimina el usuario (desde Supabase Dashboard > Authentication > Users)
   ```

2. **Limpia sessionStorage** en el navegador:
   ```javascript
   // En la consola del navegador
   sessionStorage.clear()
   localStorage.clear()
   ```

3. **Recarga la página** (Ctrl+F5)

4. **Registra de nuevo** desde `/auth/role-selection`

## 🎯 Verificación Post-Solución

Después de aplicar la solución, verifica:

1. **En Supabase**:
   ```sql
   SELECT * FROM public.user_profiles 
   WHERE user_type = 'artist' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
   
   Deberías ver:
   - `user_type`: 'artist'
   - `artist_profile_id`: null (porque aún no ha creado su perfil)
   - `onboarding_completed`: false

2. **En la Consola del Navegador** (después de login):
   ```
   🔍 ArtistRedirectWrapper: Checking user type...
   👤 User found: [id]
   📋 Profile found: { user_type: 'artist', artist_profile_id: null }
   🎵 User is an artist
   ⚠️ Artist without profile, redirecting to onboarding
   ```

3. **Deberías ser redirigido a**: `/auth/artist-onboarding`

## 🐛 Debugging Avanzado

### Ver todos los logs del flujo completo

1. **Durante Sign Up**:
   ```
   📝 Creating user profile with data: { user_id: "...", user_type: "artist", ... }
   🔍 Checking user_profiles table...
   🔍 Attempting to insert into user_profiles: { ... }
   📊 Insert result - Data: [...] Error: null
   ✅ User profile created successfully: [...]
   ```

2. **Durante Login**:
   ```
   🔍 ArtistRedirectWrapper: Checking user type...
   👤 User found: [id]
   📋 Profile found: { user_type: 'artist', artist_profile_id: null }
   🎵 User is an artist
   ⚠️ Artist without profile, redirecting to onboarding
   ```

### Si los logs no aparecen

1. **Abre DevTools** (F12)
2. **Ve a Console**
3. **Filtra por**: `🔍` o `Artist` o `profile`
4. **Limpia la consola** antes de hacer login
5. **Copia todos los logs** y compártelos

## 📋 Checklist de Verificación

- [ ] Migración ejecutada (`EJECUTAR_ESTO_PRIMERO.sql`)
- [ ] Columna `user_type` existe en `user_profiles`
- [ ] RLS policies permiten leer el perfil
- [ ] El perfil se crea durante sign up
- [ ] El perfil tiene `user_type = 'artist'`
- [ ] Los logs aparecen en la consola
- [ ] El usuario es redirigido a `/auth/artist-onboarding`

## 🆘 Si Nada Funciona

Comparte estos datos:

1. **Resultado de** `DIAGNOSTICO_PERFILES.sql`
2. **Logs completos** de la consola del navegador
3. **Screenshot** del error
4. **Versión de Supabase** que estás usando

Con esta información podremos identificar exactamente qué está fallando.
