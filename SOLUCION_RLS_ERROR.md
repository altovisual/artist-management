# 🔧 Solución: Error de Row-Level Security (RLS)

## ❌ Error

```
new row violates row-level security policy for table "artists"
```

## 🔍 Causa

La tabla `artists` tiene políticas de seguridad (RLS) que impiden que los usuarios creen artistas. Esto es porque las políticas no están configuradas correctamente o no existen.

## ✅ Solución Inmediata

### **Paso 1: Ejecutar Script de Arreglo**

1. **Abre Supabase SQL Editor**
2. **Ejecuta**: `supabase/ARREGLAR_RLS_ARTISTS.sql`
3. **Verifica** que se crearon las policies correctamente

### **Paso 2: Verificar que Funcionó**

Después de ejecutar el script, deberías ver:

```
POLICIES CREADAS:
- Authenticated users can create artists (INSERT)
- Authenticated users can view artists (SELECT)
- Users can update their own artists (UPDATE)
- Users can delete their own artists (DELETE)
```

### **Paso 3: Probar de Nuevo**

1. **Recarga la aplicación** (F5)
2. **Completa el formulario** de artist onboarding
3. **Haz click en "Complete"**
4. Deberías ver en la consola:
   ```
   📝 Creating artist for user: [user-id]
   Creating artist with payload: { name: "...", genre: "...", user_id: "..." }
   ✅ Artist created successfully
   ```

## 🛠️ Qué Hace el Script

El script `ARREGLAR_RLS_ARTISTS.sql`:

1. **Elimina policies antiguas** que puedan estar causando conflictos
2. **Crea nuevas policies** que permiten:
   - ✅ Usuarios autenticados pueden **crear** artistas (si el `user_id` coincide)
   - ✅ Usuarios pueden **ver** sus propios artistas
   - ✅ Managers pueden **ver** todos los artistas
   - ✅ Usuarios pueden **actualizar** sus propios artistas
   - ✅ Usuarios pueden **eliminar** sus propios artistas
3. **Verifica** que las policies se crearon correctamente

## 🔐 Políticas de Seguridad Implementadas

### **INSERT (Crear)**
```sql
WITH CHECK (auth.uid() = user_id)
```
Solo puedes crear un artista si el `user_id` del artista es tu propio ID.

### **SELECT (Ver)**
```sql
USING (
    auth.uid() = user_id  -- Tu propio artista
    OR
    auth.uid() IN (SELECT user_id FROM user_profiles WHERE user_type = 'manager')  -- O eres manager
)
```

### **UPDATE (Actualizar)**
```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

### **DELETE (Eliminar)**
```sql
USING (auth.uid() = user_id)
```

## 🐛 Si el Error Persiste

### Verificar que el user_id se está enviando

En la consola del navegador, deberías ver:

```
📝 Creating artist for user: [tu-user-id]
Creating artist with payload: {
  name: "Artist Name",
  genre: "pop",
  country: "us",
  user_id: "[tu-user-id]"  ← IMPORTANTE: Debe estar presente
}
```

Si `user_id` no aparece en el payload:
- Verifica que estás autenticado
- Recarga la página
- Intenta hacer logout y login de nuevo

### Verificar que RLS está habilitado

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'artists';
```

Debería mostrar `rowsecurity: true`

### Deshabilitar RLS temporalmente (SOLO PARA DEBUG)

```sql
-- SOLO PARA PROBAR - NO DEJAR ASÍ EN PRODUCCIÓN
ALTER TABLE public.artists DISABLE ROW LEVEL SECURITY;

-- Después de probar, VOLVER A HABILITAR
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
```

## 📋 Checklist

- [ ] Ejecutado `ARREGLAR_RLS_ARTISTS.sql`
- [ ] Verificado que las policies se crearon
- [ ] Recargado la aplicación
- [ ] Verificado que `user_id` está en el payload
- [ ] Probado crear un artista de nuevo

## ✨ Después de Arreglar

Una vez que las policies estén correctas:

1. Los artistas podrán crear su perfil sin problemas
2. Solo verán su propio perfil (no el de otros artistas)
3. Los managers podrán ver todos los artistas
4. Todo funcionará como se diseñó

---

**Nota**: Este error es común cuando se migra la base de datos o se crean nuevas tablas. Las policies de RLS son necesarias para la seguridad, pero deben estar configuradas correctamente para que los usuarios puedan trabajar.
