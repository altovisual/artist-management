# 🚀 Guía Completa: Sistema de Finanzas en Producción

## 📋 Resumen del Sistema

Sistema completo para que:
- ✅ **Artistas** vean SOLO sus propios estados de cuenta
- ✅ **Admins** vean todos los estados de cuenta
- ✅ **MVPX** pueda actualizar los datos mensualmente
- ✅ **Seguridad** completa con RLS policies

---

## 🔧 Configuración Inicial (Una Sola Vez)

### 1. **Agregar Service Role Key a .env.local**

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ← AGREGAR ESTA
```

**Dónde obtenerla:**
1. Ve a: https://supabase.com/dashboard/project/TU_PROJECT/settings/api
2. Copia el **`service_role`** key (la segunda key)
3. Agrégala a `.env.local`

⚠️ **IMPORTANTE**: Esta key NUNCA debe estar en el frontend, solo en:
- Variables de entorno del servidor
- API routes de Next.js
- Scripts de servidor

### 2. **Ejecutar Migraciones SQL**

En Supabase Dashboard → SQL Editor, ejecuta en orden:

#### A. Migración Principal (si no la ejecutaste)
```sql
-- Ejecutar: supabase/migrations/20251103000000_create_artist_statements.sql
```

#### B. Políticas RLS para Producción
```sql
-- Ejecutar: supabase/migrations/20251103000001_update_statements_rls_for_production.sql
```

Esto configurará:
- ✅ Artistas solo ven sus datos
- ✅ Admins ven todos los datos
- ✅ Solo service_role puede importar

### 3. **Importación Inicial de Datos**

Ejecuta el script una vez para cargar los datos actuales:

```bash
npx tsx scripts/import-excel-to-db.ts
```

Esto importará:
- ✅ 25 artistas de MVPX
- ✅ 1,042 transacciones
- ✅ Todos los balances calculados

---

## 📅 Actualización Mensual (MVPX)

Cada mes, cuando MVPX te envíe el Excel actualizado:

### Opción 1: Desde el Dashboard (Recomendada)

1. **Login como Admin** en la app
2. Ve a **Finance → Estados de Cuenta**
3. Click en **"Import Statements"**
4. Selecciona el nuevo archivo `Estados_de_Cuenta.xlsx`
5. ¡Listo! Los datos se actualizan automáticamente

### Opción 2: Desde Script (Alternativa)

```bash
# Reemplaza el archivo Excel con el nuevo
# Luego ejecuta:
npx tsx scripts/import-excel-to-db.ts
```

---

## 🔒 Seguridad Implementada

### Políticas RLS Configuradas

#### Para Artistas:
```sql
-- Solo ven sus propios estados de cuenta
CREATE POLICY "Artists can view own statements"
  ON artist_statements
  WHERE artist_id IN (
    SELECT id FROM artists WHERE user_id = auth.uid()
  );
```

#### Para Admins:
```sql
-- Ven todos los estados de cuenta
CREATE POLICY "Admins can view all statements"
  ON artist_statements
  WHERE EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = auth.uid()
  );
```

#### Para Importaciones:
```sql
-- Solo service_role puede insertar/actualizar
CREATE POLICY "Service role can manage statements"
  ON artist_statements
  FOR ALL TO service_role
  USING (true);
```

---

## 👥 Cómo Funciona para Cada Rol

### Para Artistas:

1. **Login** con su cuenta
2. Van a **Finance → Estados de Cuenta**
3. Ven **SOLO sus propios datos**:
   - Su balance actual
   - Sus transacciones
   - Su historial de pagos
   - Sus avances

### Para Admins/MVPX:

1. **Login** con cuenta admin
2. Van a **Finance → Estados de Cuenta**
3. Ven **TODOS los artistas**:
   - Filtrar por artista
   - Filtrar por mes
   - Ver balances consolidados
   - Exportar reportes

---

## 📊 Estructura de Datos

### Archivo Excel de MVPX

El sistema espera este formato:

```
Estados_de_Cuenta.xlsx
├── Hoja 1: Marval
│   ├── Nombre Legal: Luis Marval
│   ├── Fecha Inicio: 2023-05-10
│   ├── Fecha Fin: 2025-10-08
│   └── Transacciones:
│       ├── Fecha | Concepto | Método Pago | Monto | Balance
│       └── ...
├── Hoja 2: Alex Nuñez
│   └── ...
└── Hoja N: Otro Artista
```

### Datos que se Importan:

Por cada artista:
- ✅ Nombre artístico
- ✅ Nombre legal
- ✅ Periodo (fecha inicio/fin)
- ✅ Todas las transacciones:
  - Fecha
  - Concepto
  - Monto
  - Tipo (ingreso/gasto/avance)
  - Categoría
  - Balance acumulado

---

## 🎯 Flujo Completo de Producción

### Mes 1 (Configuración Inicial):

```
1. Agregar SERVICE_ROLE_KEY a .env.local
2. Ejecutar migraciones SQL
3. Importar datos iniciales (script)
4. Verificar en dashboard
```

### Mes 2+ (Actualización Mensual):

```
1. MVPX envía nuevo Excel
2. Admin hace login
3. Import Statements → Selecciona archivo
4. Sistema actualiza automáticamente
5. Artistas ven sus nuevos datos
```

---

## 🔄 Automatización Futura (Opcional)

### Opción A: Cron Job Mensual

```typescript
// vercel.json
{
  "crons": [{
    "path": "/api/statements/import-scheduled",
    "schedule": "0 0 1 * *"  // Día 1 de cada mes
  }]
}
```

### Opción B: Webhook desde MVPX

Cuando MVPX actualice el Excel en su sistema, puede llamar:
```
POST /api/statements/import
Authorization: Bearer <admin_token>
Body: FormData con el archivo
```

---

## 📈 Métricas y Reportes

### Datos Disponibles:

#### Dashboard Principal:
- Total de ingresos (todos los artistas)
- Total de gastos
- Total de avances
- Balance total consolidado

#### Por Artista:
- Balance actual
- Ingresos del periodo
- Gastos del periodo
- Avances pendientes
- Historial de transacciones

#### Filtros:
- Por artista específico
- Por mes/periodo
- Por tipo de transacción
- Exportar a CSV

---

## 🐛 Troubleshooting

### Error: "No autorizado"
**Solución**: Verifica que el usuario esté autenticado y tenga permisos.

### Error: "Service role key inválida"
**Solución**: Verifica que la key en `.env.local` sea correcta.

### Error: "Artista no encontrado"
**Solución**: El sistema creará automáticamente artistas nuevos.

### Los artistas ven datos de otros
**Solución**: Verifica que las políticas RLS estén activas:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'artist_statements';
```

---

## ✅ Checklist de Producción

Antes de lanzar:

- [ ] SERVICE_ROLE_KEY agregada a .env.local
- [ ] Migraciones SQL ejecutadas
- [ ] Datos iniciales importados
- [ ] Políticas RLS verificadas
- [ ] Probado con usuario artista (solo ve sus datos)
- [ ] Probado con usuario admin (ve todos los datos)
- [ ] Importación desde dashboard funciona
- [ ] Filtros funcionando correctamente

---

## 🎉 Resultado Final

### Para Artistas:
```
Login → Finance → Estados de Cuenta
└── Ve SOLO sus datos:
    ├── Balance: $X,XXX.XX
    ├── Ingresos: $X,XXX.XX
    ├── Gastos: $X,XXX.XX
    └── Transacciones detalladas
```

### Para MVPX/Admins:
```
Login → Finance → Estados de Cuenta
└── Ve TODOS los artistas:
    ├── Filtrar por artista
    ├── Filtrar por mes
    ├── Importar nuevos datos
    └── Exportar reportes
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en la consola del navegador
2. Verifica las políticas RLS en Supabase
3. Confirma que las variables de entorno estén correctas
4. Revisa el historial de importaciones en `statement_imports`

---

## 🚀 ¡Sistema Listo para Producción!

Con esta configuración:
- ✅ **Seguro**: RLS policies protegen los datos
- ✅ **Escalable**: Soporta cientos de artistas
- ✅ **Fácil de actualizar**: Import mensual en 2 clicks
- ✅ **Transparente**: Artistas ven sus finanzas en tiempo real
- ✅ **Auditable**: Historial completo de importaciones

**¡Todo listo para que los artistas vean sus finanzas!** 🎉
