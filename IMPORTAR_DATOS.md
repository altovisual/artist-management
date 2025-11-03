# 📊 Importar Todos los Datos del Excel a la Base de Datos

## 🎯 Objetivo
Este script importará automáticamente todos los datos del archivo `Estados_de_Cuenta.xlsx` a la base de datos para que puedas ver cómo funciona el sistema completo.

---

## 📋 Requisitos Previos

✅ Migración SQL ejecutada en Supabase
✅ npm install xlsx (ya completado)
✅ Archivo `Estados_de_Cuenta.xlsx` en la raíz del proyecto

---

## 🚀 Pasos para Importar

### 1. **Instalar tsx (ejecutor de TypeScript)**
```bash
npm install -D tsx
```

### 2. **Verificar que el Excel esté en la raíz**
```bash
# El archivo debe estar en:
# C:\Users\altov\Downloads\artist-management\Estados_de_Cuenta.xlsx
```

### 3. **Ejecutar el script de importación**
```bash
npx tsx scripts/import-excel-to-db.ts
```

---

## 📊 Lo que Hará el Script

### Procesará Automáticamente:
- ✅ **25 artistas** del Excel
- ✅ **1,042 transacciones** totales
- ✅ Creará artistas si no existen
- ✅ Guardará estados de cuenta
- ✅ Importará todas las transacciones
- ✅ Calculará balances automáticamente

### Datos que Importará:

#### Artistas con Balance Positivo:
- **Marval**: +$101,872.47 (114 transacciones)
- **Dimelo Super**: +$59,345.21 (21 transacciones)
- **LANALIZER**: +$8,241.82 (66 transacciones)
- **Divino**: +$6,671.60 (57 transacciones)

#### Artistas con Balance Negativo:
- **Alex Nuñez**: -$1,132,480.63 (104 transacciones)
- **Dayan**: -$34,621.27 (72 transacciones)
- **Cesar Da Gold**: -$15,745.00 (23 transacciones)
- **Jeidi**: -$14,561.13 (71 transacciones)

#### Y 17 artistas más...

---

## 📺 Salida Esperada

```
🚀 Iniciando importación de Estados de Cuenta...

📖 Leyendo archivo Excel...

📊 Procesando: Marval
   ✅ Artista encontrado: Marval
   💾 114 transacciones guardadas
   💰 Balance: $101872.47

📊 Procesando: Alex Nuñez
   ✅ Artista encontrado: Alex Nuñez
   💾 104 transacciones guardadas
   💰 Balance: $-1132480.63

... (continúa con todos los artistas)

============================================================
📈 RESUMEN DE IMPORTACIÓN
============================================================
✅ Artistas procesados: 25
✅ Importaciones exitosas: 25
❌ Importaciones fallidas: 0
📝 Total de transacciones: 1042
============================================================

🎉 ¡Importación completada!
```

---

## 🎨 Después de la Importación

### 1. **Recarga el Dashboard de Finanzas**
```
http://localhost:3000/dashboard/finance
```

### 2. **Ve al tab "Estados de Cuenta"**
Verás:
- ✅ Stats con totales consolidados
- ✅ Lista de 25 artistas
- ✅ Filtros por artista y mes
- ✅ Detalle completo de transacciones

### 3. **Explora los Datos**
- Click en cualquier artista para ver su estado de cuenta
- Usa los filtros para buscar por mes
- Ve el resumen financiero de cada periodo
- Explora las transacciones detalladas

---

## 🔧 Troubleshooting

### Error: "No se encontró el archivo"
**Solución**: Copia `Estados_de_Cuenta.xlsx` a la raíz del proyecto:
```bash
# Debe estar en:
C:\Users\altov\Downloads\artist-management\Estados_de_Cuenta.xlsx
```

### Error: "Artista no encontrado"
**Solución**: El script creará automáticamente los artistas que no existan.

### Error: "Cannot find module 'tsx'"
**Solución**: 
```bash
npm install -D tsx
```

### Error de Supabase
**Solución**: Verifica que las variables de entorno estén correctas en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
```

---

## 📊 Verificar la Importación

### En Supabase Dashboard:
```sql
-- Ver total de estados de cuenta
SELECT COUNT(*) FROM artist_statements;
-- Debería retornar: 25

-- Ver total de transacciones
SELECT COUNT(*) FROM statement_transactions;
-- Debería retornar: 1042

-- Ver balance total
SELECT SUM(balance) FROM artist_statements;
-- Debería retornar: -1048822.52
```

---

## 🎯 Siguiente Paso

Una vez importados los datos:

1. ✅ **Explora el Dashboard** - Ve todos los estados de cuenta
2. ✅ **Prueba los Filtros** - Filtra por artista y mes
3. ✅ **Ve los Detalles** - Click en un artista para ver transacciones
4. ✅ **Exporta Reportes** - Usa el botón de exportar

---

## 🔄 Re-importar Datos

Si necesitas volver a importar (actualiza datos existentes):
```bash
npx tsx scripts/import-excel-to-db.ts
```

El script usa `upsert`, así que:
- ✅ Actualiza estados de cuenta existentes
- ✅ No crea duplicados
- ✅ Reemplaza transacciones del mismo periodo

---

## 📚 Archivos Relacionados

- **Script**: `scripts/import-excel-to-db.ts`
- **Excel**: `Estados_de_Cuenta.xlsx`
- **Migración**: `supabase/migrations/20251103000000_create_artist_statements.sql`
- **Componente**: `components/finance/artist-statements-view.tsx`

---

## 🎉 ¡Listo!

Después de ejecutar el script, tendrás:
- ✅ 25 artistas con estados de cuenta
- ✅ 1,042 transacciones importadas
- ✅ Balances calculados automáticamente
- ✅ Sistema completamente funcional

**¡Disfruta explorando los datos financieros de tus artistas!** 🚀
