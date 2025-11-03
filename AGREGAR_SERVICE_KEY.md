# 🔑 Agregar Service Role Key

## ⚠️ Problema
El script necesita permisos de administrador para crear artistas y estados de cuenta.

---

## ✅ Solución Rápida

### 1. **Obtener tu Service Role Key**

Ve a tu Supabase Dashboard:
```
https://supabase.com/dashboard/project/TU_PROJECT/settings/api
```

En la sección **Project API keys**, copia el **`service_role`** key (no el anon key).

### 2. **Agregar a .env.local**

Abre tu archivo `.env.local` y agrega esta línea:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE**: Esta key tiene permisos de administrador, **NUNCA** la expongas en el frontend.

### 3. **Ejecutar nuevamente**

```bash
npx tsx scripts/import-excel-to-db.ts
```

---

## 📋 Tu .env.local debe tener:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ← NUEVA
```

---

## 🔒 Seguridad

✅ **Seguro**: Usar en scripts del servidor
✅ **Seguro**: Usar en API routes de Next.js
❌ **NO SEGURO**: Usar en componentes del cliente
❌ **NO SEGURO**: Exponer en el código del frontend

El script solo se ejecuta en tu máquina local, así que es seguro.

---

## 🎯 Después de Agregar la Key

Ejecuta:
```bash
npx tsx scripts/import-excel-to-db.ts
```

Verás:
```
🔑 Usando Supabase con permisos de administrador...

🚀 Iniciando importación de Estados de Cuenta...

📊 Procesando: Marval
   ✅ Artista creado con ID: xxx
   💾 114 transacciones guardadas
   💰 Balance: $101872.47

============================================================
✅ Importaciones exitosas: 25
============================================================
```

---

## 💡 Alternativa: Deshabilitar RLS Temporalmente

Si no quieres usar la service key, puedes deshabilitar RLS temporalmente:

### En Supabase SQL Editor:
```sql
-- Deshabilitar RLS temporalmente
ALTER TABLE artists DISABLE ROW LEVEL SECURITY;
ALTER TABLE artist_statements DISABLE ROW LEVEL SECURITY;
ALTER TABLE statement_transactions DISABLE ROW LEVEL SECURITY;

-- Ejecutar el script...

-- Volver a habilitar RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE statement_transactions ENABLE ROW LEVEL SECURITY;
```

**⚠️ Solo hazlo en desarrollo, nunca en producción.**

---

## 🚀 ¡Listo!

Una vez agregada la key, el script funcionará perfectamente.
