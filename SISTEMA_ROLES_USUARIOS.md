# Sistema de Roles de Usuario - Artist Management

## Resumen

Se ha implementado un sistema completo de roles de usuario que diferencia entre **Artists**, **Managers** y **Others**, con flujos de onboarding específicos para cada tipo.

## Características Principales

### 1. Selección de Rol en Sign Up

- **Página de Selección**: `/auth/role-selection`
- Los usuarios eligen su rol antes de crear la cuenta:
  - **Artist**: Artistas que crean su propio perfil
  - **Manager**: Managers que gestionan múltiples artistas
  - **Other**: Otros tipos de usuarios

### 2. Flujos de Onboarding Diferenciados

#### Para Artists (`/auth/artist-onboarding`)
- Crean directamente su perfil de artista
- Campos del formulario:
  - Legal Name (nombre legal)
  - Stage Name / Artist Name (nombre artístico)
  - Genre (género musical)
  - Location (ubicación)
  - Birth Date (fecha de nacimiento)
  - Bio (biografía)
- **Restricción**: Un artista solo puede tener UN perfil asociado a su cuenta
- El perfil se vincula automáticamente a `user_profiles.artist_profile_id`

#### Para Managers (`/auth/manager-onboarding`)
- Configuran su perfil de manager
- Campos del formulario:
  - Full Name (nombre completo)
  - Username (nombre de usuario)
  - Company / Label (compañía o sello)
  - Bio (biografía)
- **Capacidad**: Pueden crear y gestionar múltiples artistas

#### Para Others
- Van al flujo estándar de onboarding

### 3. Redirección Automática para Artists

- Cuando un artista inicia sesión, es redirigido automáticamente a su perfil de artista
- No ven el dashboard de gestión de múltiples artistas
- Su experiencia es personalizada como artista individual

### 4. Cambios en Base de Datos

**Nueva Migración**: `20251115000000_add_user_type_and_artist_profile.sql`

**Nuevo Enum**:
```sql
CREATE TYPE public.user_type AS ENUM ('artist', 'manager', 'other');
```

**Nuevas Columnas en `user_profiles`**:
- `user_type`: Tipo de usuario (artist, manager, other)
- `artist_profile_id`: Para artists, enlace a su perfil único en la tabla `artists`
- `username`: Nombre de usuario para display
- `avatar_url`: URL del avatar del usuario

### 5. Componentes Creados

1. **`/app/auth/role-selection/page.tsx`**
   - Página de selección de rol con diseño moderno
   - Radio buttons para Artist, Manager, Other
   - Guarda la selección en sessionStorage

2. **`/app/auth/artist-onboarding/page.tsx`**
   - Formulario completo para crear perfil de artista
   - Validaciones y campos requeridos
   - Crea el artista y vincula a user_profiles

3. **`/app/auth/manager-onboarding/page.tsx`**
   - Formulario para configurar perfil de manager
   - Actualiza user_profiles con información del manager

4. **`/components/artist-redirect-wrapper.tsx`**
   - Wrapper que detecta si el usuario es un artista
   - Redirige automáticamente a su perfil de artista
   - Muestra loading state durante la verificación

### 6. Actualizaciones en Sign Up

**`/app/auth/sign-up/page.tsx`**:
- Verifica que el usuario haya seleccionado un rol
- Crea el usuario en Supabase Auth
- Crea el perfil en `user_profiles` con el rol seleccionado
- Redirige según el tipo de usuario:
  - Artist → `/auth/artist-onboarding`
  - Manager → `/auth/manager-onboarding`
  - Other → `/auth/sign-up-success`

### 7. Navegación Actualizada

- Todos los enlaces de "Sign up" ahora apuntan a `/auth/role-selection`
- Páginas actualizadas:
  - `/app/page.tsx` (landing page)
  - `/app/auth/login/page.tsx`

## Flujo Completo de Usuario

### Para un Artista (ej: ECBY)

1. **Sign Up**:
   - Visita `/auth/role-selection`
   - Selecciona "Artist"
   - Completa formulario de sign up básico
   - Es redirigido a `/auth/artist-onboarding`

2. **Onboarding**:
   - Completa su perfil de artista (nombre artístico: ECBY, género, etc.)
   - El sistema crea:
     - Usuario en `auth.users`
     - Perfil en `user_profiles` con `user_type = 'artist'`
     - Artista en `artists` vinculado a su cuenta
     - Actualiza `user_profiles.artist_profile_id`

3. **Experiencia**:
   - Al hacer login, es redirigido automáticamente a `/artists/{su_id}`
   - Ve su perfil de artista directamente
   - No necesita "añadir" un artista, **ÉL ES el artista**
   - Solo puede tener un perfil de artista

### Para un Manager

1. **Sign Up**:
   - Visita `/auth/role-selection`
   - Selecciona "Manager"
   - Completa formulario de sign up básico
   - Es redirigido a `/auth/manager-onboarding`

2. **Onboarding**:
   - Completa su perfil de manager
   - El sistema crea:
     - Usuario en `auth.users`
     - Perfil en `user_profiles` con `user_type = 'manager'`

3. **Experiencia**:
   - Al hacer login, ve el dashboard completo
   - Puede crear y gestionar múltiples artistas
   - Tiene acceso a todas las funcionalidades de gestión

## Seguridad y Restricciones

### Para Artists
- **Restricción de Base de Datos**: Solo pueden tener un `artist_profile_id` en `user_profiles`
- **Restricción de UI**: El formulario de artist onboarding solo permite crear un perfil
- **Redirección Automática**: Siempre van a su perfil, no al dashboard de gestión

### Para Managers
- Pueden crear múltiples artistas
- Tienen acceso completo al dashboard de gestión
- Pueden gestionar contratos, finanzas, etc.

## RLS Policies

**Nueva Policy en `artists`**:
```sql
CREATE POLICY "Artists can view their own artist profile"
  ON public.artists
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_profiles 
      WHERE user_type = 'artist' AND artist_profile_id = artists.id
    )
    OR
    auth.uid() IN (
      SELECT user_id FROM public.user_profiles 
      WHERE user_type = 'manager'
    )
  );
```

Esto asegura que:
- Los artistas solo ven su propio perfil
- Los managers ven todos los artistas que gestionan

## Próximos Pasos Recomendados

1. **Ejecutar la Migración**:
   ```bash
   # En Supabase SQL Editor
   # Ejecutar: supabase/migrations/20251115000000_add_user_type_and_artist_profile.sql
   ```

2. **Probar el Flujo**:
   - Crear una cuenta como Artist
   - Crear una cuenta como Manager
   - Verificar las redirecciones y permisos

3. **Ajustes Opcionales**:
   - Personalizar más la experiencia del artista
   - Agregar más campos específicos por rol
   - Implementar notificaciones específicas por tipo de usuario

## Archivos Modificados/Creados

### Nuevos Archivos
- `supabase/migrations/20251115000000_add_user_type_and_artist_profile.sql`
- `app/auth/role-selection/page.tsx`
- `app/auth/artist-onboarding/page.tsx`
- `app/auth/manager-onboarding/page.tsx`
- `components/artist-redirect-wrapper.tsx`
- `SISTEMA_ROLES_USUARIOS.md`

### Archivos Modificados
- `app/auth/sign-up/page.tsx`
- `app/page.tsx`
- `app/auth/login/page.tsx`
- `app/dashboard/page.tsx`

## Notas Importantes

- **SessionStorage**: Se usa para pasar el rol seleccionado entre páginas
- **Validación**: El sistema valida que el usuario haya seleccionado un rol antes de permitir el sign up
- **Experiencia Personalizada**: Cada tipo de usuario tiene una experiencia adaptada a sus necesidades
- **Escalabilidad**: El sistema está diseñado para agregar más tipos de usuarios en el futuro
