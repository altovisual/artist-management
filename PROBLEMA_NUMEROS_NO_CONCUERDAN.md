# 🔍 Problema: Los Números No Concuerdan

## 📊 Situación Actual

### **En la Plataforma (Finance Page):**
- Total Income: $3,760,356.32
- Total Expenses: $346,765.27
- Net Balance: $3,413,591.05
- Transacciones: 1000

### **En Estados de Cuenta (Tab Estados de Cuenta):**
- Ingresos Totales: $4,598,037.87
- Gastos Totales: $420,987.25
- Avances Totales: $688,612.81
- Balance Total: -$948,619.41

---

## 🎯 Causa del Problema

Hay **DOS TABLAS DIFERENTES** con datos financieros:

### **1. Tabla `transactions`**
- **Usada por:** Finance Page (primera tab)
- **Datos:** Transacciones manuales creadas en la plataforma
- **Total:** ~1000 registros
- **Cálculo:** Solo suma income y expense

### **2. Tabla `statement_transactions`**
- **Usada por:** Estados de Cuenta (segunda tab)
- **Datos:** Transacciones importadas desde Excel
- **Total:** Más registros (incluye todos los artistas del Excel)
- **Cálculo:** Suma income, expense Y advances

---

## 💡 Por Qué Están Separadas

```
TRANSACTIONS (Manual)
├─ Creadas manualmente en la plataforma
├─ Vinculadas a categorías personalizadas
└─ Para gestión diaria

STATEMENT_TRANSACTIONS (Excel)
├─ Importadas desde estados de cuenta
├─ Vinculadas a artist_statements (períodos)
├─ Para reportes oficiales mensuales
└─ Incluyen avances y detalles bancarios
```

---

## ✅ Soluciones

### **Opción 1: Consolidar en una Vista Unificada (Recomendado)**

Crear una vista SQL que combine ambas tablas:

```sql
CREATE VIEW unified_transactions AS
SELECT 
    id,
    artist_id,
    amount,
    'income' as type,
    transaction_date as date,
    description,
    'manual' as source
FROM transactions
WHERE type = 'income'

UNION ALL

SELECT 
    id,
    artist_id,
    amount,
    transaction_type as type,
    transaction_date as date,
    concept as description,
    'statement' as source
FROM statement_transactions
WHERE hidden IS NULL OR hidden = FALSE;
```

Luego actualizar Finance Page para usar esta vista.

---

### **Opción 2: Mostrar Ambas por Separado (Actual)**

Mantener las tabs separadas:
- **Tab 1 (Transacciones):** Solo `transactions` (manual)
- **Tab 2 (Estados de Cuenta):** Solo `statement_transactions` (Excel)

**Ventaja:** Claridad en el origen de los datos
**Desventaja:** Números diferentes pueden confundir

---

### **Opción 3: Migrar Todo a una Sola Tabla**

Migrar datos de `statement_transactions` → `transactions`:

**Ventaja:** Una sola fuente de verdad
**Desventaja:** Se pierde información específica de statements (períodos, detalles bancarios, etc.)

---

## 🎯 Recomendación

**Usar Opción 1:** Vista unificada

### **Beneficios:**
✅ Un solo total consolidado
✅ Mantiene ambas fuentes de datos
✅ Fácil de implementar
✅ No pierde información

### **Implementación:**
1. Crear vista SQL unificada
2. Actualizar Finance Page para usar la vista
3. Agregar filtro "Fuente" (Manual / Excel / Todas)

---

## 📋 Pasos Siguientes

1. **Ejecutar:** `VERIFICAR_DISCREPANCIA_NUMEROS.sql`
2. **Revisar:** Qué datos hay en cada tabla
3. **Decidir:** Qué opción prefieres
4. **Implementar:** La solución elegida

---

## 🔍 Para Verificar Ahora

Ejecuta en Supabase SQL Editor:

```sql
-- Ver totales en cada tabla
SELECT 'transactions' as tabla, COUNT(*) as registros,
       SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as ingresos
FROM transactions

UNION ALL

SELECT 'statement_transactions' as tabla, COUNT(*) as registros,
       SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as ingresos
FROM statement_transactions
WHERE hidden IS NULL OR hidden = FALSE;
```

---

¿Qué opción prefieres implementar? 🚀
