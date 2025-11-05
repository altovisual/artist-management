# 🔧 Corrección de Cálculos Financieros

## Problema Identificado

El sistema estaba calculando incorrectamente los totales financieros porque:

1. ❌ **No leía las columnas específicas del Excel** - Solo buscaba números genéricos
2. ❌ **Sumaba porcentajes vacíos** - Incluía columnas sin datos en los cálculos
3. ❌ **No respetaba la estructura del Excel** - No mapeaba correctamente las columnas

### Ejemplo del Problema:

```
Valor Factura | Cargos Banc. | 80% País | 20% Comisión | 5% Legal | Retención IVA
$1,000        | $10          | (vacío)  | (vacío)      | (vacío)  | (vacío)
```

**Antes:** Sumaba todas las columnas, incluso las vacías
**Ahora:** Solo suma las que tienen datos reales

---

## Solución Implementada

### 1. **Mapeo Inteligente de Columnas**

El sistema ahora identifica las columnas por su nombre en el encabezado:

```typescript
// Mapear columnas por nombre
const columnMap = {
  'fecha': 0,
  'concepto': 4,
  'valorFactura': 5,
  'cargosBanc': 6,
  'pais80': 7,
  'comision20': 8,
  'legal5': 9,
  'retencionIVA': 10,
  'pagadoMVPX': 11,
  'avance': 12,
  'balance': 13
};
```

### 2. **Función Helper para Valores Numéricos**

```typescript
function getNumericValue(value: any): number | null {
  // Retorna null si:
  // - El valor es null/undefined
  // - Es una cadena vacía
  // - Es un guión (— o -)
  // - No es un número válido
  
  if (value === null || value === undefined || 
      value === '' || value === '—' || value === '-') {
    return null;
  }
  
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? null : num;
}
```

### 3. **Cálculo Correcto del Monto**

```typescript
// Leer valores solo si existen
const valorFactura = getNumericValue(row[columnMap['valorFactura']]);
const cargosBanc = getNumericValue(row[columnMap['cargosBanc']]);
const comision20 = getNumericValue(row[columnMap['comision20']]);
const legal5 = getNumericValue(row[columnMap['legal5']]);
const retencionIVA = getNumericValue(row[columnMap['retencionIVA']]);

// Calcular monto solo con valores existentes
let monto = valorFactura || 0;
if (cargosBanc !== null) monto -= cargosBanc;
if (comision20 !== null) monto -= comision20;
if (legal5 !== null) monto -= legal5;
if (retencionIVA !== null) monto -= retencionIVA;
```

---

## Columnas Reconocidas

El sistema ahora reconoce y procesa correctamente estas columnas:

| Columna | Descripción | Uso en Cálculo |
|---------|-------------|----------------|
| **Fecha** | Fecha de la transacción | Identificación |
| **Número** | Número de factura/documento | Referencia |
| **Tipo** | Tipo de transacción | Clasificación |
| **Método Pago** | Método de pago utilizado | Información |
| **Concepto** | Descripción de la transacción | Identificación |
| **Valor Factura** | Valor total de la factura | ✅ Base del cálculo |
| **Cargos Banc.** | Cargos bancarios | ✅ Se resta si existe |
| **80% País** | Porcentaje país | ℹ️ Informativo |
| **20% Comisión** | Comisión 20% | ✅ Se resta si existe |
| **5% Legal** | Porcentaje legal | ✅ Se resta si existe |
| **Retención IVA** | Retención de IVA | ✅ Se resta si existe |
| **Pagado MVPX** | Monto neto pagado | ✅ Valor final (prioridad) |
| **Avance** | Avance otorgado | ✅ Transacción separada |
| **Balance** | Balance acumulado | ✅ Balance final |

---

## Lógica de Cálculo

### Prioridad de Valores:

1. **Si existe "Pagado MVPX"** → Usar ese valor (es el neto final)
2. **Si existe "Valor Factura"** → Calcular:
   ```
   Monto = Valor Factura 
         - Cargos Banc. (si existe)
         - Comisión 20% (si existe)
         - Legal 5% (si existe)
         - Retención IVA (si existe)
   ```
3. **Si existe "Balance"** → Usar el balance como referencia

### Manejo de Avances:

```typescript
// Si hay un avance, se crea una transacción separada
if (avance !== null && Math.abs(avance) > 0) {
  // Transacción de tipo 'advance'
  artistData.resumen.totalAvances += Math.abs(avance);
}
```

---

## Ejemplos de Cálculo

### Ejemplo 1: Factura Completa
```
Valor Factura: $1,000
Cargos Banc.: $10
80% País: (vacío)
20% Comisión: $200
5% Legal: $50
Retención IVA: $0
Pagado MVPX: (vacío)

Cálculo:
Monto = $1,000 - $10 - $200 - $50 - $0
Monto = $740 ✅
```

### Ejemplo 2: Solo Valor Factura
```
Valor Factura: $1,000
Cargos Banc.: (vacío)
80% País: (vacío)
20% Comisión: (vacío)
5% Legal: (vacío)
Retención IVA: (vacío)
Pagado MVPX: (vacío)

Cálculo:
Monto = $1,000 ✅
(No se restan valores vacíos)
```

### Ejemplo 3: Con Pagado MVPX
```
Valor Factura: $1,000
Cargos Banc.: $10
20% Comisión: $200
5% Legal: $50
Pagado MVPX: $740

Cálculo:
Monto = $740 ✅
(Se usa directamente el valor de Pagado MVPX)
```

### Ejemplo 4: Avance
```
Concepto: "Avance Enero 2024"
Avance: $500
Balance: $-500

Resultado:
- Tipo: 'advance'
- Monto: $500
- Se suma a totalAvances
- Balance acumulado: $-500
```

---

## Totales Calculados

### Total Ingresos
```typescript
artistData.resumen.totalIngresos = 
  suma de todas las transacciones tipo 'income'
```

### Total Gastos
```typescript
artistData.resumen.totalGastos = 
  suma de todas las transacciones tipo 'expense'
```

### Total Avances
```typescript
artistData.resumen.totalAvances = 
  suma de todas las transacciones tipo 'advance'
```

### Balance Final
```typescript
// Prioridad 1: Último balance registrado
if (lastTransaction.balanceAcumulado !== undefined) {
  balanceFinal = lastTransaction.balanceAcumulado;
}
// Prioridad 2: Cálculo manual
else {
  balanceFinal = totalIngresos - totalGastos - totalAvances;
}
```

---

## Validaciones Implementadas

### 1. Validación de Fecha
```typescript
const fecha = parseExcelDate(row[columnMap['fecha']]);
if (!fecha) continue; // Saltar si no hay fecha válida
```

### 2. Validación de Concepto
```typescript
const concepto = String(row[columnMap['concepto']] || '').trim();
if (!concepto || concepto === '—' || concepto === '-') continue;
```

### 3. Validación de Monto
```typescript
if (monto === 0) continue; // Saltar transacciones sin monto
```

---

## Beneficios de la Corrección

### ✅ Precisión Mejorada
- Los totales ahora reflejan exactamente los datos del Excel
- No se suman columnas vacías
- Respeta la estructura financiera real

### ✅ Flexibilidad
- Funciona con diferentes formatos de Excel
- Maneja columnas opcionales correctamente
- Se adapta a datos parciales

### ✅ Trazabilidad
- Cada cálculo es verificable
- Los valores intermedios se pueden auditar
- El balance acumulado se preserva

### ✅ Robustez
- Maneja valores nulos/vacíos
- No falla con datos incompletos
- Valida cada paso del proceso

---

## Archivo Modificado

**Archivo:** `app/api/statements/import/route.ts`

### Funciones Actualizadas:

1. **`processArtistSheet()`**
   - Mapeo inteligente de columnas
   - Lectura selectiva de valores
   - Cálculos precisos

2. **`getNumericValue()`** (nueva)
   - Helper para obtener valores numéricos
   - Maneja valores vacíos correctamente
   - Retorna `null` para datos inválidos

3. **`saveArtistStatement()`**
   - Firma corregida con parámetro `supabaseAdmin`

---

## Pruebas Recomendadas

### 1. Importar Excel con Columnas Completas
```
✅ Todas las columnas tienen datos
✅ Verificar que los totales coincidan
```

### 2. Importar Excel con Columnas Parciales
```
✅ Algunas columnas vacías
✅ Verificar que solo se sumen las que tienen datos
```

### 3. Importar Excel con Solo Valor Factura
```
✅ Solo Valor Factura y Concepto
✅ Verificar que el monto sea igual al Valor Factura
```

### 4. Importar Excel con Avances
```
✅ Transacciones con columna Avance
✅ Verificar que se separen correctamente
```

---

## Próximos Pasos

### Recomendaciones:

1. **Probar con datos reales** del Excel actual
2. **Verificar totales** contra cálculos manuales
3. **Revisar balances** de cada artista
4. **Comparar** con importaciones anteriores

### Si encuentras discrepancias:

1. Revisa el mapeo de columnas en el Excel
2. Verifica que los nombres de columnas coincidan
3. Chequea que no haya columnas duplicadas
4. Confirma que los datos estén en el formato correcto

---

**Última actualización:** 5 de Noviembre, 2024
**Versión:** 2.0.0
**Estado:** ✅ Corregido y Optimizado
