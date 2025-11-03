# 📊 Actualizar Sistema con Todos los Campos del Excel

## 🎯 Objetivo
Agregar TODOS los campos del Excel a la base de datos y mostrarlos en el dashboard.

---

## 📋 Pasos para Actualizar

### **PASO 1: Agregar Columnas a la Base de Datos**

En Supabase SQL Editor, ejecuta:

```sql
-- Copiar y ejecutar el contenido de:
-- supabase/migrations/20251103000002_add_excel_fields.sql
```

Esto agregará las columnas:
- ✅ invoice_number (Número de factura)
- ✅ transaction_type_code (Tipo)
- ✅ payment_method_detail (Método de Pago)
- ✅ invoice_value (Valor de la Factura)
- ✅ bank_charges_amount (Cargos Bancarios)
- ✅ country_percentage (80% País)
- ✅ commission_20_percentage (20% Comisión)
- ✅ legal_5_percentage (5% Legal)
- ✅ tax_retention (Retención de IVA)
- ✅ mvpx_payment (Pagado por MVPX)
- ✅ advance_amount (Avance)
- ✅ final_balance (Balance)

---

### **PASO 2: Limpiar Datos Anteriores**

En Supabase SQL Editor:

```sql
-- Eliminar estados de cuenta anteriores (sin todos los campos)
DELETE FROM artist_statements;

-- Esto también eliminará las transacciones por CASCADE
```

---

### **PASO 3: Re-importar con Todos los Campos**

En tu terminal:

```bash
npx tsx scripts/import-excel-to-db.ts
```

Ahora el script capturará TODOS los campos del Excel:
- ✅ Fecha
- ✅ Número (factura)
- ✅ Tipo
- ✅ Método de Pago
- ✅ Nombre
- ✅ Concepto
- ✅ Valor de la Factura
- ✅ Cargos Bancarios
- ✅ 80% País
- ✅ 20% Comisión
- ✅ 5% Legal
- ✅ Retención de IVA
- ✅ Pagado por MVPX
- ✅ Avance
- ✅ Balance

---

### **PASO 4: Actualizar el Frontend (Opcional)**

Si quieres mostrar estos campos en el dashboard, necesitarás actualizar:

**Archivo**: `components/finance/artist-statements-view.tsx`

Agregar columnas a la tabla de transacciones para mostrar:
- Número de factura
- Tipo
- Método de pago
- Valor de factura
- Cargos bancarios
- Porcentajes (País, Comisión, Legal)
- Retención de IVA
- Pagado por MVPX
- Avance

---

## 🎯 Resumen de Cambios

### **Base de Datos:**
- ✅ 12 nuevas columnas en `statement_transactions`
- ✅ Índices para búsquedas rápidas

### **Script de Importación:**
- ✅ Extrae los 15 campos del Excel
- ✅ Mapea correctamente cada columna
- ✅ Guarda toda la información

### **Datos Capturados:**
```
Fecha → transaction_date
Número → invoice_number
Tipo → transaction_type_code
Método de Pago → payment_method_detail
Concepto → concept
Valor Factura → invoice_value
Cargos Bancarios → bank_charges_amount
80% País → country_percentage
20% Comisión → commission_20_percentage
5% Legal → legal_5_percentage
Retención IVA → tax_retention
Pagado por MVPX → mvpx_payment
Avance → advance_amount
Balance → final_balance
```

---

## ✅ Verificación

Después de re-importar, verifica en Supabase:

```sql
-- Ver una transacción con todos los campos
SELECT 
  transaction_date,
  invoice_number,
  transaction_type_code,
  payment_method_detail,
  concept,
  invoice_value,
  bank_charges_amount,
  country_percentage,
  commission_20_percentage,
  legal_5_percentage,
  tax_retention,
  mvpx_payment,
  advance_amount,
  final_balance
FROM statement_transactions
LIMIT 1;
```

Deberías ver todos los campos poblados con datos del Excel.

---

## 🚀 ¡Listo!

Ahora tienes TODA la información del Excel en la base de datos.

**Siguiente paso:** Actualizar el frontend para mostrar estos campos en el dashboard.
