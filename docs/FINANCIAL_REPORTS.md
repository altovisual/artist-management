# 📊 Sistema de Reportes Financieros Profesionales

## Descripción General

El sistema de exportación de reportes financieros genera archivos Excel (.xlsx) profesionales y completamente formateados con múltiples hojas de análisis.

## 🎯 Características Principales

### ✨ Diseño Profesional
- **Formato Excel nativo** (.xlsx) - No CSV simple
- **Múltiples hojas de análisis** organizadas por tema
- **Anchos de columna optimizados** para mejor legibilidad
- **Formato de moneda consistente** con separadores de miles
- **Fechas localizadas** en formato español

### 📑 Estructura del Reporte

El reporte generado contiene **4 hojas principales**:

#### 1️⃣ **Executive Summary** (Resumen Ejecutivo)
```
ARTIST MANAGEMENT SYSTEM
Financial Report

Generated: [Fecha y hora completa]
Period: [Rango de fechas si aplica]
Artist: [Nombre del artista o "All Artists"]

EXECUTIVE SUMMARY
┌─────────────────────┬──────────────┐
│ Metric              │ Amount       │
├─────────────────────┼──────────────┤
│ Total Income        │ $XX,XXX.XX   │
│ Total Expenses      │ $XX,XXX.XX   │
│ Net Balance         │ $XX,XXX.XX   │
└─────────────────────┴──────────────┘

STATISTICS
┌─────────────────────────┬─────────┐
│ Total Transactions      │ XXX     │
│ Income Transactions     │ XXX     │
│ Expense Transactions    │ XXX     │
│ Average Transaction     │ $XXX.XX │
└─────────────────────────┴─────────┘
```

#### 2️⃣ **Transactions** (Detalle de Transacciones)
```
TRANSACTION DETAILS

┌────────────┬──────────┬──────────┬─────────────┬─────────┬──────────┬──────────────────┐
│ Date       │ Artist   │ Category │ Description │ Type    │ Amount   │ Running Balance  │
├────────────┼──────────┼──────────┼─────────────┼─────────┼──────────┼──────────────────┤
│ 01/11/2024 │ Marval   │ Royalty  │ Spotify Q4  │ Income  │ $1,500.00│ $1,500.00        │
│ 05/11/2024 │ Marval   │ Marketing│ Instagram   │ Expense │ -$250.00 │ $1,250.00        │
│ ...        │ ...      │ ...      │ ...         │ ...     │ ...      │ ...              │
└────────────┴──────────┴──────────┴─────────────┴─────────┴──────────┴──────────────────┘

TOTALS:
Total Income:    $XX,XXX.XX
Total Expenses: -$XX,XXX.XX
Net Balance:     $XX,XXX.XX
```

**Características especiales:**
- ✅ Ordenadas cronológicamente
- ✅ Balance acumulado (Running Balance)
- ✅ Totales al final de la hoja
- ✅ Formato de moneda con signo negativo para gastos

#### 3️⃣ **Category Analysis** (Análisis por Categoría)
```
CATEGORY ANALYSIS

┌─────────────────────┬──────────────┬──────────┬──────────┬──────────┐
│ Category            │ Transactions │ Income   │ Expenses │ Net      │
├─────────────────────┼──────────────┼──────────┼──────────┼──────────┤
│ Royalties           │ 45           │ $8,500.00│ $0.00    │ $8,500.00│
│ Marketing           │ 23           │ $0.00    │ $2,300.00│-$2,300.00│
│ Production          │ 18           │ $3,200.00│ $1,800.00│ $1,400.00│
│ ...                 │ ...          │ ...      │ ...      │ ...      │
└─────────────────────┴──────────────┴──────────┴──────────┴──────────┘
```

**Ordenamiento:**
- Categorías ordenadas por volumen total (Income + Expenses)
- Muestra el balance neto por categoría

#### 4️⃣ **Artist Analysis** (Análisis por Artista)
```
ARTIST ANALYSIS

┌─────────────────────┬──────────────┬──────────┬──────────┬─────────────┐
│ Artist              │ Transactions │ Income   │ Expenses │ Net Balance │
├─────────────────────┼──────────────┼──────────┼──────────┼─────────────┤
│ Marval              │ 104          │ $15,500.00│$3,200.00│ $12,300.00 │
│ Dimelo Super        │ 87           │ $12,300.00│$2,800.00│ $9,500.00  │
│ ...                 │ ...          │ ...      │ ...      │ ...        │
└─────────────────────┴──────────────┴──────────┴──────────┴─────────────┘
```

**Nota:** Esta hoja solo se genera si hay múltiples artistas en el reporte.

**Ordenamiento:**
- Artistas ordenados por balance neto (de mayor a menor)

## 🚀 Cómo Usar

### Desde la Interfaz Web

1. **Navega a Finance** (`/dashboard/finance`)
2. **Aplica filtros** (opcional):
   - Selecciona un artista específico
   - Filtra por tipo (Income/Expense)
   - Selecciona categoría
   - Define rango de fechas
   - Busca por descripción
3. **Click en "Export Professional Report"**
4. El archivo se descargará automáticamente

### Nombre del Archivo

```
Financial_Report_YYYY-MM-DD.xlsx
```

Ejemplo: `Financial_Report_2024-11-05.xlsx`

## 💡 Casos de Uso

### 📈 Reporte Mensual
```typescript
// Filtrar por mes actual
Start Date: 01/11/2024
End Date: 30/11/2024
Artist: All Artists
```

### 👤 Reporte Individual de Artista
```typescript
// Solo un artista específico
Artist: Marval
Date Range: Todo el período
```

### 💰 Análisis de Ingresos
```typescript
// Solo transacciones de ingreso
Type: Income
Category: All
```

### 📊 Análisis por Categoría
```typescript
// Gastos de marketing
Type: Expense
Category: Marketing
```

## 🎨 Formato y Estilo

### Formato de Moneda
- **Símbolo:** `$` (dólar)
- **Separador de miles:** `,` (coma)
- **Decimales:** Siempre 2 dígitos
- **Ejemplo:** `$1,234.56`

### Formato de Fecha
- **Locale:** Español (es-ES)
- **Formato corto:** `DD/MM/YYYY`
- **Formato largo:** `día de mes de año, HH:MM`

### Anchos de Columna
Optimizados automáticamente para cada tipo de contenido:
- Fechas: 12 caracteres
- Nombres: 20-25 caracteres
- Descripciones: 35 caracteres
- Montos: 15-18 caracteres

## 🔧 Personalización

### Modificar el Exportador

Archivo: `lib/export-financial-report.ts`

```typescript
// Agregar una nueva hoja
const customSheet = XLSX.utils.aoa_to_sheet([
  ['Custom Analysis'],
  ['Your data here']
]);

XLSX.utils.book_append_sheet(workbook, customSheet, 'Custom');
```

### Cambiar Formato de Moneda

```typescript
// En export-financial-report.ts
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('es-ES', { 
    style: 'currency',
    currency: 'EUR' // Cambiar a EUR, COP, etc.
  });
};
```

## 📋 Requisitos Técnicos

### Dependencias
```json
{
  "xlsx": "^0.18.5"
}
```

### Navegadores Soportados
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

### Tamaño de Archivo
- **Pequeño** (< 100 transacciones): ~15 KB
- **Mediano** (100-1000 transacciones): ~50 KB
- **Grande** (> 1000 transacciones): ~200 KB

## 🐛 Troubleshooting

### El archivo no se descarga
1. Verifica que el navegador permita descargas
2. Revisa la consola del navegador para errores
3. Asegúrate de tener transacciones para exportar

### Formato incorrecto
1. Verifica que la librería `xlsx` esté instalada
2. Limpia el caché del navegador
3. Prueba en modo incógnito

### Datos faltantes
1. Confirma que los filtros no estén demasiado restrictivos
2. Verifica que haya transacciones en el rango seleccionado
3. Revisa los permisos de usuario (admin vs artist)

## 🎯 Próximas Mejoras

- [ ] Agregar logo de la empresa en la primera hoja
- [ ] Gráficos embebidos en Excel
- [ ] Exportación a PDF
- [ ] Plantillas personalizables
- [ ] Programación de reportes automáticos
- [ ] Envío por email
- [ ] Comparativas mes a mes
- [ ] Proyecciones financieras

## 📞 Soporte

Para reportar problemas o sugerir mejoras:
- Crea un issue en el repositorio
- Contacta al equipo de desarrollo
