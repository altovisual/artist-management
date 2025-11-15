# 📋 Orden de Ejecución de Scripts SQL

Para configurar correctamente la base de datos y los permisos, ejecuta los scripts en este orden:

## ✅ Orden Correcto de Ejecución

### **1. EJECUTAR_ESTO_PRIMERO.sql** ⭐ CRÍTICO
**Qué hace:**
- Crea el enum `user_type` ('artist', 'manager')
- Agrega columnas necesarias a `user_profiles`
- Configura índices y constraints

**Cuándo:** Antes que todo lo demás

---

### **2. AGREGAR_COLUMNA_IS_ADMIN.sql** ⭐ NUEVO - CRÍTICO
**Qué hace:**
- Agrega la columna `is_admin` a `user_profiles`
- Verifica que se creó correctamente
- Muestra usuarios actuales

**Cuándo:** Después de `EJECUTAR_ESTO_PRIMERO.sql` y ANTES de cualquier script que use `is_admin` en policies

**Por qué es importante:** Todos los scripts de RLS usan `is_admin` para verificar permisos de administrador.

---

### **3. CREAR_TABLA_ARTIST_MANAGERS.sql** ⭐ NUEVO
**Qué hace:**
- Crea la tabla `artist_managers` (relación manager-artista)
- Configura RLS policies para la tabla
- Crea índices y triggers

**Cuándo:** Después de `EJECUTAR_ESTO_PRIMERO.sql` y antes de `ARREGLAR_RLS_FINANZAS.sql`

**Por qué es importante:** Las policies de finanzas necesitan esta tabla para verificar qué artistas gestiona cada manager.

---

### **4. ARREGLAR_RLS_ARTISTS.sql**
**Qué hace:**
- Configura RLS policies para la tabla `artists`
- Permite que artistas creen su perfil
- Permite que managers vean artistas

**Cuándo:** Después de crear `artist_managers`

---

### **5. ARREGLAR_RLS_FINANZAS.sql**
**Qué hace:**
- Configura RLS policies para:
  - `transactions`
  - `transaction_categories`
  - `artist_statements`
  - `statement_transactions`

**Cuándo:** Después de `CREAR_TABLA_ARTIST_MANAGERS.sql`

**Importante:** Este script usa la tabla `artist_managers` para determinar qué managers pueden ver qué transacciones.

---

### **6. ASIGNAR_ADMINS_ESPECIFICOS.sql** ⭐ RECOMENDADO
**Qué hace:**
- Asigna `is_admin = true` a los 4 usuarios admin del sistema:
  - gesa@mvpxmusic.com
  - e.perez@mvpxmusic.com
  - admin@mvpxmusic.com
  - manuelalejandromendozasalvarado@gmail.com
- Remueve permisos de admin de otros usuarios
- Verifica que solo estos 4 tengan acceso completo

**Cuándo:** Después de ejecutar todos los scripts anteriores

**Importante:** Este script asegura que SOLO los admins reales tengan acceso completo. Los managers NO verán todas las transacciones.

---

### **7. ASIGNAR_ADMIN.sql** (Alternativa manual)
**Qué hace:**
- Script genérico para asignar admin a cualquier usuario
- Útil para agregar admins adicionales en el futuro

**Cuándo:** Solo si necesitas agregar admins adicionales

---

## 🚀 Resumen Rápido

```bash
1. EJECUTAR_ESTO_PRIMERO.sql          # Base: user_type, columnas
2. AGREGAR_COLUMNA_IS_ADMIN.sql       # ⭐ Columna is_admin (CRÍTICO)
3. CREAR_TABLA_ARTIST_MANAGERS.sql    # Relación manager-artista
4. ARREGLAR_RLS_ARTISTS.sql           # Permisos para artists
5. ARREGLAR_RLS_FINANZAS.sql          # Permisos para finanzas
6. ASIGNAR_ADMINS_ESPECIFICOS.sql     # ⭐ Asignar los 4 admins (RECOMENDADO)
7. ASIGNAR_ADMIN.sql                  # (Alternativa) Asignar admin manual
```

## ⚠️ Errores Comunes y Soluciones

### Error: `column "is_admin" does not exist`
**Solución:** Ejecuta `AGREGAR_COLUMNA_IS_ADMIN.sql` ANTES de `CREAR_TABLA_ARTIST_MANAGERS.sql` y `ARREGLAR_RLS_FINANZAS.sql`

### Error: `relation "public.artist_managers" does not exist`
**Solución:** Ejecuta `CREAR_TABLA_ARTIST_MANAGERS.sql` ANTES de `ARREGLAR_RLS_FINANZAS.sql`

### Error: `invalid input value for enum user_type: "admin"`
**Solución:** Ya está corregido en `ARREGLAR_RLS_FINANZAS.sql` (solo usa `is_admin = true`)

### Error: `new row violates row-level security policy for table "artists"`
**Solución:** Ejecuta `ARREGLAR_RLS_ARTISTS.sql`

## 📊 Scripts de Diagnóstico (Opcionales)

Estos scripts NO modifican la base de datos, solo muestran información:

- **DIAGNOSTICO_PERFILES.sql** - Ver estado de perfiles y artistas
- **VER_COLUMNAS_ARTISTS.sql** - Ver columnas de la tabla artists
- **VERIFICAR_Y_ARREGLAR_USER_PROFILES.sql** - Verificar estructura de user_profiles

## 🎯 Después de Ejecutar Todo

1. **Verifica que todo funcionó:**
   ```sql
   -- Ver todas las policies creadas
   SELECT tablename, policyname, cmd 
   FROM pg_policies 
   WHERE tablename IN ('artists', 'transactions', 'artist_managers')
   ORDER BY tablename, cmd;
   ```

2. **Asigna un admin:**
   ```sql
   UPDATE public.user_profiles 
   SET is_admin = true 
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'tu@email.com');
   ```

3. **Prueba el onboarding de artistas:**
   - Registra un nuevo usuario como artista
   - Completa el formulario de onboarding
   - Verifica que se cree el perfil correctamente

## 📝 Notas Importantes

- **Orden es crucial:** No ejecutes los scripts fuera de orden
- **Backup primero:** Siempre haz backup antes de ejecutar scripts en producción
- **Revisa errores:** Lee los mensajes de error y verifica qué falta
- **Tablas requeridas:** Asegúrate que existen `artists`, `transactions`, `user_profiles`
