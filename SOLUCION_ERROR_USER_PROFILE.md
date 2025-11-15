# Solución al Error: "Error creating user profile"

## Problema
Al intentar registrarse, aparece el error: `Error creating user profile: {}`

## Causa
La tabla `user_profiles` no tiene las columnas necesarias (`user_type`, `artist_profile_id`, `username`, `avatar_url`) porque la migración no se ha ejecutado.

## Solución Rápida

### Opción 1: Ejecutar la Migración (RECOMENDADO)

1. **Ir a Supabase Dashboard**
   - Abre tu proyecto en https://supabase.com
   - Ve a SQL Editor

2. **Ejecutar el script de migración**
   - Abre el archivo: `supabase/migrations/20251115000000_add_user_type_and_artist_profile.sql`
   - Copia todo el contenido
   - Pégalo en el SQL Editor de Supabase
   - Haz click en "Run"

3. **Verificar que funcionó**
   - Ejecuta este query para verificar:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns
   WHERE table_name = 'user_profiles'
   ORDER BY ordinal_position;
   ```
   - Deberías ver las columnas: `user_type`, `artist_profile_id`, `username`, `avatar_url`

### Opción 2: Script de Verificación y Arreglo

1. **Ejecutar el script de diagnóstico**
   - Abre: `supabase/VERIFICAR_Y_ARREGLAR_USER_PROFILES.sql`
   - Ejecuta las primeras secciones para ver qué falta
   - Si faltan columnas, descomenta la sección de arreglo y ejecútala

### Opción 3: Ejecutar Manualmente (Si las opciones anteriores fallan)

Ejecuta estos comandos en el SQL Editor de Supabase:

```sql
-- 1. Crear el enum user_type
DO $$ BEGIN
    CREATE TYPE public.user_type AS ENUM ('artist', 'manager', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Agregar las columnas faltantes
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS user_type public.user_type,
ADD COLUMN IF NOT EXISTS artist_profile_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_artist_profile ON public.user_profiles(artist_profile_id);
```

## Verificación Post-Migración

Después de ejecutar la migración, verifica que todo funciona:

1. **Prueba el registro**
   - Ve a `/auth/role-selection`
   - Selecciona "Artist" o "Manager"
   - Completa el formulario de sign up
   - Deberías ser redirigido al onboarding correspondiente

2. **Verifica en la base de datos**
   ```sql
   SELECT * FROM public.user_profiles ORDER BY created_at DESC LIMIT 5;
   ```
   - Deberías ver el campo `user_type` poblado

## Código Actualizado

El código de `sign-up/page.tsx` ahora incluye:

✅ **Manejo de errores mejorado**: Muestra detalles completos del error
✅ **Fallback automático**: Si falta la columna `user_type`, intenta crear el perfil sin ella
✅ **Mensajes informativos**: Indica al usuario que necesita ejecutar la migración
✅ **Logging detallado**: Ayuda a diagnosticar problemas

## Notas Importantes

- **El registro seguirá funcionando** incluso si la migración no se ha ejecutado
- El usuario será redirigido al onboarding correspondiente
- Se mostrará un mensaje indicando que se requiere la migración
- Una vez ejecutada la migración, todas las funcionalidades estarán disponibles

## Si el Problema Persiste

1. **Verifica los logs del navegador** (F12 → Console)
   - Busca mensajes que empiecen con 📝, ✅ o ❌
   - Copia el error completo

2. **Verifica los logs de Supabase**
   - Ve a Logs en el dashboard de Supabase
   - Busca errores relacionados con `user_profiles`

3. **Verifica las RLS Policies**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
   ```
   - Asegúrate de que los usuarios pueden insertar en `user_profiles`

4. **Contacta con soporte** con:
   - El error completo de la consola
   - El resultado de las queries de verificación
   - Los logs de Supabase
