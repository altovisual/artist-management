# 📊 Sistema de Exportación de Estados de Cuenta

## Descripción General

El sistema de exportación de estados de cuenta genera archivos Excel (.xlsx) profesionales con análisis detallado de todos los estados de cuenta de artistas, incluyendo transacciones completas, análisis por artista y análisis temporal.

## 🎯 Características Principales

### ✨ Diseño Profesional
- **Formato Excel nativo** (.xlsx) con múltiples hojas
- **5 hojas de análisis** organizadas por tema
- **Formato de moneda** consistente con separadores de miles
- **Fechas localizadas** en formato español
- **Anchos de columna optimizados** automáticamente

### 📑 Estructura del Reporte

El reporte generado contiene **hasta 5 hojas principales**:

#### 1️⃣ **Resumen Ejecutivo**
```
ARTIST MANAGEMENT SYSTEM
Estados de Cuenta - Financial Statements Report

Generated: [Fecha y hora completa]
Artist Filter: [Artista seleccionado o vacío]
Period Filter: [Mes seleccionado o vacío]

RESUMEN EJECUTIVO
┌─────────────────────┬──────────────┐
│ Métrica             │ Monto        │
├─────────────────────┼──────────────┤
│ Ingresos Totales    │ $XX,XXX.XX   │
│ Gastos Totales      │ $XX,XXX.XX   │
│ Avances Totales     │ $XX,XXX.XX   │
│ Balance Total       │ $XX,XXX.XX   │
└─────────────────────┴──────────────┘

ESTADÍSTICAS
┌──────────────────────────────┬─────────┐
│ Total de Estados de Cuenta   │ XXX     │
│ Total de Transacciones       │ XXX     │
│ Promedio por Estado          │ $XXX.XX │
└──────────────────────────────┴─────────┘
```

#### 2️⃣ **Estados de Cuenta** (Todos los periodos)
```
TODOS LOS ESTADOS DE CUENTA

┌─────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Artista │ Nombre   │ Mes      │ Inicio   │ Fin      │ Ingresos │ Gastos   │ Avances  │ Balance  │ Trans.   │
│         │ Legal    │          │ Periodo  │ Periodo  │          │          │          │          │          │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Marval  │ John Doe │ Nov 2024 │ 01/11/24 │ 30/11/24 │ $8,500.00│ $2,300.00│ $500.00  │ $5,700.00│ 45       │
│ ...     │ ...      │ ...      │ ...      │ ...      │ ...      │ ...      │ ...      │ ...      │ ...      │
└─────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

TOTALES:
Ingresos:    $XX,XXX.XX
Gastos:      $XX,XXX.XX
Avances:     $XX,XXX.XX
Balance:     $XX,XXX.XX
```

**Características:**
- ✅ Ordenados cronológicamente (más reciente primero)
- ✅ Incluye nombre legal del artista
- ✅ Rango de fechas del periodo
- ✅ Totales al final

#### 3️⃣ **Detalle de Transacciones** (Estado seleccionado)
```
DETALLE DE TRANSACCIONES - [Nombre del Artista]
Periodo: [Mes y Año]

┌────────┬────────┬──────┬────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Fecha  │ Número │ Tipo │ Método │ Concepto │ Valor    │ Cargos   │ 80%      │ 20%      │ 5%       │ Retención│ Pagado   │ Avance   │ Balance  │
│        │        │      │ Pago   │          │ Factura  │ Banc.    │ País     │ Comisión │ Legal    │ IVA      │ MVPX     │          │ Final    │
├────────┼────────┼──────┼────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│01/11/24│ INV-001│ ING  │Transfer│ Spotify  │ $1,500.00│ $15.00   │ $1,200.00│ $300.00  │ $75.00   │ $0.00    │ $1,110.00│ —        │ $1,110.00│
│ ...    │ ...    │ ...  │ ...    │ ...      │ ...      │ ...      │ ...      │ ...      │ ...      │ ...      │ ...      │ ...      │ ...      │
└────────┴────────┴──────┴────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

TOTALES:
Ingresos:    $XX,XXX.XX
Gastos:      $XX,XXX.XX
Balance:     $XX,XXX.XX
```

**Nota:** Esta hoja solo se genera si hay un estado de cuenta seleccionado al momento de exportar.

**Columnas incluidas:**
- 📅 Fecha de transacción
- 🔢 Número de factura/documento
- 📝 Tipo de transacción
- 💳 Método de pago
- 📄 Concepto detallado
- 💰 Todos los montos y cálculos (14 columnas)

#### 4️⃣ **Análisis por Artista**
```
ANÁLISIS POR ARTISTA

┌─────────────┬─────────┬──────────────┬──────────┬──────────┬──────────┬──────────┬──────────────┐
│ Artista     │ Estados │ Transacciones│ Ingresos │ Gastos   │ Avances  │ Balance  │ Promedio/    │
│             │         │              │          │          │          │          │ Estado       │
├─────────────┼─────────┼──────────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ Marval      │ 6       │ 245          │ $45,000  │ $12,000  │ $3,000   │ $30,000  │ $5,000.00    │
│ Dimelo Super│ 5       │ 198          │ $38,000  │ $10,500  │ $2,500   │ $25,000  │ $5,000.00    │
│ ...         │ ...     │ ...          │ ...      │ ...      │ ...      │ ...      │ ...          │
└─────────────┴─────────┴──────────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘
```

**Ordenamiento:**
- Artistas ordenados por balance total (de mayor a menor)

**Métricas incluidas:**
- Número de estados de cuenta
- Total de transacciones
- Suma de ingresos, gastos y avances
- Balance total
- Promedio por estado de cuenta

#### 5️⃣ **Análisis por Mes**
```
ANÁLISIS POR MES

┌──────────────┬─────────┬──────────┬──────────┬──────────┬──────────┐
│ Mes          │ Estados │ Ingresos │ Gastos   │ Avances  │ Balance  │
├──────────────┼─────────┼──────────┼──────────┼──────────┼──────────┤
│ Noviembre 24 │ 12      │ $85,000  │ $22,000  │ $5,000   │ $58,000  │
│ Octubre 24   │ 11      │ $78,000  │ $20,000  │ $4,500   │ $53,500  │
│ ...          │ ...     │ ...      │ ...      │ ...      │ ...      │
└──────────────┴─────────┴──────────┴──────────┴──────────┴──────────┘
```

**Ordenamiento:**
- Meses ordenados cronológicamente (más reciente primero)

**Análisis temporal:**
- Permite ver tendencias mes a mes
- Identifica periodos de mayor/menor actividad
- Facilita comparaciones temporales

## 🚀 Cómo Usar

### Desde la Interfaz Web

1. **Navega a Finance > Estados de Cuenta** (`/dashboard/finance` → Tab "Estados de Cuenta")
2. **Aplica filtros** (opcional):
   - Selecciona un artista específico
   - Filtra por mes/periodo
3. **Selecciona un estado de cuenta** (opcional):
   - Si seleccionas uno, se incluirá la hoja de detalle de transacciones
4. **Click en "Exportar Reporte Profesional"**
5. El archivo se descargará automáticamente

### Nombre del Archivo

```
Statements_Report_YYYY-MM-DD.xlsx
```

Ejemplo: `Statements_Report_2024-11-05.xlsx`

## 💡 Casos de Uso

### 📊 Reporte Mensual Completo
```typescript
// Todos los artistas, todos los meses
Artist Filter: Todos los artistas
Month Filter: Todos los meses
Selected Statement: Ninguno
```
**Resultado:** Reporte completo con 4 hojas (sin detalle de transacciones)

### 👤 Reporte Individual de Artista
```typescript
// Solo un artista específico
Artist Filter: Marval
Month Filter: Todos los meses
Selected Statement: Seleccionar uno
```
**Resultado:** Reporte con 5 hojas incluyendo detalle completo de transacciones

### 📅 Análisis de Periodo Específico
```typescript
// Un mes específico
Artist Filter: Todos los artistas
Month Filter: Noviembre 2024
Selected Statement: Ninguno
```
**Resultado:** Análisis de todos los artistas en ese mes

### 🔍 Auditoría Detallada
```typescript
// Artista y periodo específicos con transacciones
Artist Filter: Marval
Month Filter: Noviembre 2024
Selected Statement: Marval - Noviembre 2024
```
**Resultado:** Reporte completo con todas las 5 hojas y detalle de transacciones

## 🎨 Formato y Estilo

### Formato de Moneda
- **Símbolo:** `$` (dólar)
- **Separador de miles:** `,` (coma)
- **Decimales:** Siempre 2 dígitos
- **Ejemplo:** `$12,345.67`

### Formato de Fecha
- **Locale:** Español (es-ES)
- **Formato corto:** `DD/MM/YY`
- **Formato largo:** `día de mes de año`
- **Meses:** Nombres completos en español

### Anchos de Columna
Optimizados para cada tipo de contenido:
- Nombres de artistas: 20-25 caracteres
- Fechas: 12-15 caracteres
- Conceptos: 35 caracteres
- Montos: 13-15 caracteres

## 📋 Datos Incluidos

### Por Estado de Cuenta
- ✅ Artista (nombre comercial)
- ✅ Nombre legal
- ✅ Periodo (inicio y fin)
- ✅ Mes del estado
- ✅ Ingresos totales
- ✅ Gastos totales
- ✅ Avances totales
- ✅ Balance final
- ✅ Número de transacciones

### Por Transacción (si aplica)
- ✅ Fecha
- ✅ Número de factura/documento
- ✅ Tipo de transacción
- ✅ Método de pago
- ✅ Concepto
- ✅ Valor de factura
- ✅ Cargos bancarios
- ✅ 80% País
- ✅ 20% Comisión
- ✅ 5% Legal
- ✅ Retención IVA
- ✅ Pagado MVPX
- ✅ Avance
- ✅ Balance final

## 🔧 Personalización

### Modificar el Exportador

Archivo: `lib/export-statements-report.ts`

```typescript
// Agregar una nueva hoja de análisis
const customAnalysis = [
  ['ANÁLISIS PERSONALIZADO'],
  ['Tu análisis aquí']
];

const customSheet = XLSX.utils.aoa_to_sheet(customAnalysis);
XLSX.utils.book_append_sheet(workbook, customSheet, 'Custom');
```

### Cambiar Formato de Moneda

```typescript
// Cambiar a pesos colombianos
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('es-CO', { 
    style: 'currency',
    currency: 'COP'
  });
};
```

## 📊 Análisis Disponibles

### 1. Análisis por Artista
- Total de estados de cuenta por artista
- Suma de ingresos, gastos y avances
- Balance total acumulado
- Promedio por estado de cuenta

### 2. Análisis Temporal
- Agrupación por mes
- Tendencias de ingresos y gastos
- Identificación de periodos críticos
- Comparación mes a mes

### 3. Análisis de Transacciones
- Detalle completo de cada movimiento
- Cálculos de comisiones y retenciones
- Balance acumulado
- Trazabilidad completa

## 🐛 Troubleshooting

### El archivo no se descarga
1. Verifica que haya estados de cuenta para exportar
2. Revisa la consola del navegador para errores
3. Asegúrate de que el navegador permita descargas

### Datos faltantes en el reporte
1. Confirma que los filtros no estén muy restrictivos
2. Verifica que haya datos en el periodo seleccionado
3. Revisa los permisos de usuario

### Formato incorrecto
1. Verifica que la librería `xlsx` esté instalada
2. Limpia el caché del navegador
3. Prueba en modo incógnito

## 🎯 Próximas Mejoras

- [ ] Logo de la empresa en la primera hoja
- [ ] Gráficos embebidos en Excel
- [ ] Exportación a PDF
- [ ] Comparativas periodo a periodo
- [ ] Proyecciones financieras
- [ ] Alertas de anomalías
- [ ] Envío automático por email
- [ ] Programación de reportes recurrentes

## 📞 Soporte

Para reportar problemas o sugerir mejoras:
- Crea un issue en el repositorio
- Contacta al equipo de desarrollo
- Revisa la documentación de finanzas
