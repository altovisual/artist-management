# 🔍 Diagnosticar Numeric Overflow

## 🎯 Problema
7 artistas fallan con "numeric field overflow"

---

## 📋 Pasos para Diagnosticar

### **Paso 1: Verificar que ejecutaste la migración SQL**

¿Ejecutaste este SQL en Supabase?
```sql
-- Archivo: supabase/migrations/20251103000003_increase_decimal_precision.sql
```

**Si NO lo ejecutaste:**
1. Ve a Supabase Dashboard → SQL Editor
2. Copia TODO el contenido del archivo
3. Pega y ejecuta
4. Vuelve a importar

---

### **Paso 2: Ejecutar Script de Diagnóstico**

```bash
npx tsx scripts/debug-overflow.ts
```

Esto te dirá:
- ✅ Qué valores son muy grandes
- ✅ En qué fila y columna están
- ✅ Cuántos dígitos tienen

---

## 🔧 Posibles Soluciones

### **Solución 1: Ejecutar la Migración SQL** (Más probable)

Si no ejecutaste la migración:
```sql
-- En Supabase SQL Editor:
DROP VIEW IF EXISTS public.artist_own_statements;

ALTER TABLE public.artist_statements
  ALTER COLUMN total_income TYPE DECIMAL(18, 2),
  ALTER COLUMN total_expenses TYPE DECIMAL(18, 2),
  ALTER COLUMN total_advances TYPE DECIMAL(18, 2),
  ALTER COLUMN balance TYPE DECIMAL(18, 2);

ALTER TABLE public.statement_transactions
  ALTER COLUMN amount TYPE DECIMAL(18, 2),
  ALTER COLUMN running_balance TYPE DECIMAL(18, 2),
  ALTER COLUMN bank_charges TYPE DECIMAL(18, 2),
  ALTER COLUMN tax_withholding TYPE DECIMAL(18, 2),
  ALTER COLUMN invoice_value TYPE DECIMAL(18, 2),
  ALTER COLUMN bank_charges_amount TYPE DECIMAL(18, 2),
  ALTER COLUMN tax_retention TYPE DECIMAL(18, 2),
  ALTER COLUMN mvpx_payment TYPE DECIMAL(18, 2),
  ALTER COLUMN advance_amount TYPE DECIMAL(18, 2),
  ALTER COLUMN final_balance TYPE DECIMAL(18, 2);

-- Recrear vista
CREATE OR REPLACE VIEW public.artist_own_statements AS
SELECT 
  s.*,
  a.name as artist_name,
  a.profile_image as artist_image
FROM public.artist_statements s
JOIN public.artists a ON s.artist_id = a.id
WHERE a.user_id = auth.uid();

GRANT SELECT ON public.artist_own_statements TO authenticated;
```

### **Solución 2: Aumentar Más el Tamaño** (Si persiste)

Si aún falla después de ejecutar la migración:
```sql
-- Aumentar a DECIMAL(20, 2)
ALTER TABLE public.statement_transactions
  ALTER COLUMN amount TYPE DECIMAL(20, 2),
  ALTER COLUMN running_balance TYPE DECIMAL(20, 2);
```

### **Solución 3: Verificar Columnas de Porcentajes**

Los porcentajes deberían ser DECIMAL(5, 2) no DECIMAL(18, 2):
```sql
ALTER TABLE public.statement_transactions
  ALTER COLUMN fee_percentage TYPE DECIMAL(5, 2),
  ALTER COLUMN commission_percentage TYPE DECIMAL(5, 2),
  ALTER COLUMN legal_percentage TYPE DECIMAL(5, 2),
  ALTER COLUMN country_percentage TYPE DECIMAL(5, 2),
  ALTER COLUMN commission_20_percentage TYPE DECIMAL(5, 2),
  ALTER COLUMN legal_5_percentage TYPE DECIMAL(5, 2);
```

---

## ✅ Checklist

- [ ] Ejecuté la migración SQL en Supabase
- [ ] Ejecuté el script de diagnóstico
- [ ] Vi qué valores causan el problema
- [ ] Apliqué la solución correspondiente
- [ ] Re-importé los datos

---

## 🚀 Después de Ejecutar la Migración

```bash
# Limpiar datos anteriores
# En Supabase SQL Editor:
DELETE FROM artist_statements;

# Re-importar
npx tsx scripts/import-excel-to-db.ts
```

Deberías ver:
```
✅ Importaciones exitosas: 25
❌ Importaciones fallidas: 0
```

---

## 📞 Si Persiste el Error

Ejecuta el diagnóstico y comparte el output:
```bash
npx tsx scripts/debug-overflow.ts
```
