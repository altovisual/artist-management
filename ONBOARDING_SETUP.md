# 🎯 Setup del Sistema de Onboarding

Guía completa para configurar el sistema de onboarding en Supabase.

## 📋 Prerequisitos

- Acceso al dashboard de Supabase
- Proyecto de Supabase configurado
- Permisos de administrador

## 🗄️ Paso 1: Aplicar Migraciones SQL

### Migración 1: Crear tabla user_profiles

1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Crea una nueva query
3. Copia y pega el contenido de:
   ```
   supabase/migrations/20251022000000_create_user_profiles_onboarding.sql
   ```
4. Ejecuta la query
5. Verifica que la tabla `user_profiles` se creó correctamente

### Migración 2: Crear bucket de avatars

**⚠️ IMPORTANTE**: Si obtienes un error de permisos al ejecutar esta migración, sigue la guía `CREAR_BUCKET_AVATARS.md` para crear el bucket manualmente desde el dashboard.

**Opción A - Ejecutar migración SQL:**
1. En **SQL Editor**, crea otra nueva query
2. Copia y pega el contenido de:
   ```
   supabase/migrations/20251022000001_create_avatars_bucket.sql
   ```
3. Ejecuta la query
4. Si hay error de permisos, ve a la Opción B

**Opción B - Crear manualmente (RECOMENDADO):**
1. Sigue la guía completa en `CREAR_BUCKET_AVATARS.md`
2. Es más simple y garantiza que funcione correctamente

## 🖼️ Paso 2: Verificar Storage

1. Ve a **Storage** en el dashboard
2. Deberías ver el bucket `avatars`
3. Configuración del bucket:
   - **Public**: ✅ Sí
   - **File size limit**: 5MB
   - **Allowed MIME types**: image/jpeg, image/jpg, image/png, image/gif, image/webp

## 🔒 Paso 3: Verificar RLS Policies

### Para tabla user_profiles:

```sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

Deberías ver 3 policies:
- ✅ Users can view own profile (SELECT)
- ✅ Users can insert own profile (INSERT)
- ✅ Users can update own profile (UPDATE)

### Para bucket avatars:

```sql
-- Verificar policies de storage
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';
```

Deberías ver 4 policies:
- ✅ Avatar images are publicly accessible (SELECT)
- ✅ Users can upload their own avatar (INSERT)
- ✅ Users can update their own avatar (UPDATE)
- ✅ Users can delete their own avatar (DELETE)

## 🧪 Paso 4: Probar el Sistema

### Crear usuario de prueba:

1. Crea un nuevo usuario (no admin) desde Auth
2. Inicia sesión con ese usuario
3. El onboarding debería aparecer automáticamente

### Verificar flujo completo:

1. **Paso 1 - Bienvenida**: ✅ Debe mostrar features
2. **Paso 2 - Perfil**: 
   - ✅ Debe permitir ingresar username
   - ✅ Debe permitir subir avatar (probar con imagen < 5MB)
3. **Paso 3 - Primer Artista**: 
   - ✅ Debe permitir crear artista
   - ✅ Debe permitir saltar
4. **Paso 4 - Tour**: 
   - ✅ Debe mostrar botón "Iniciar Tour Guiado"
   - ✅ Tour debe funcionar con Driver.js
   - ✅ Debe completar onboarding al finalizar

### Verificar en base de datos:

```sql
-- Ver perfil creado
SELECT * FROM user_profiles WHERE user_id = 'USER_ID_AQUI';

-- Debería mostrar:
-- onboarding_completed: true
-- onboarding_completed_at: timestamp
```

## 🔧 Troubleshooting

### Error: "Bucket not found"

**Solución**: Ejecuta la migración `20251022000001_create_avatars_bucket.sql`

### Error: "Permission denied"

**Solución**: Verifica que las RLS policies estén creadas correctamente

### El onboarding no aparece

**Verificar**:
1. Usuario no es admin (admins no ven onboarding)
2. Tabla `user_profiles` existe
3. Usuario no tiene `onboarding_completed = true`

### Avatar no se sube

**Verificar**:
1. Bucket `avatars` existe y es público
2. Imagen es < 5MB
3. Formato es válido (JPG, PNG, GIF, WEBP)
4. RLS policies de storage están activas

## 🎨 Personalización

### Cambiar pasos del onboarding:

Edita `hooks/use-onboarding.ts`:

```typescript
const [steps, setSteps] = useState<OnboardingStep[]>([
  {
    id: "welcome",
    title: "Tu Título",
    description: "Tu descripción",
    completed: false,
  },
  // Agrega más pasos aquí
]);
```

### Cambiar contenido del tour:

Edita `components/onboarding/guided-tour.tsx`:

```typescript
steps: [
  {
    element: "#tu-elemento-id",
    popover: {
      title: "Tu Título",
      description: "Tu descripción",
      side: "bottom",
    },
  },
]
```

## 📊 Monitoreo

### Query para ver estadísticas:

```sql
-- Total de usuarios con onboarding completado
SELECT 
  COUNT(*) FILTER (WHERE onboarding_completed = true) as completed,
  COUNT(*) FILTER (WHERE onboarding_completed = false) as pending,
  COUNT(*) as total
FROM user_profiles;

-- Usuarios que completaron onboarding hoy
SELECT COUNT(*) 
FROM user_profiles 
WHERE DATE(onboarding_completed_at) = CURRENT_DATE;
```

## ✅ Checklist Final

- [ ] Migración user_profiles ejecutada
- [ ] Migración avatars bucket ejecutada
- [ ] RLS policies verificadas
- [ ] Bucket avatars es público
- [ ] Probado con usuario nuevo
- [ ] Upload de avatar funciona
- [ ] Tour guiado funciona
- [ ] Onboarding se completa correctamente
- [ ] Admins NO ven onboarding

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs del navegador (Console)
2. Revisa los logs de Supabase (Database > Logs)
3. Verifica que todas las migraciones se ejecutaron
4. Confirma que el usuario no es admin

## 📚 Recursos

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Driver.js Docs](https://driverjs.com/)
