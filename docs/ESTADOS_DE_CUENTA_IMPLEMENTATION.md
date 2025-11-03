# 📊 Sistema de Estados de Cuenta - Guía de Implementación

## 🎯 Objetivo

Integrar los estados de cuenta mensuales de artistas al dashboard de finanzas, permitiendo:
- **Importación automática** desde Excel
- **Visualización completa** de transacciones por artista
- **Actualización mensual eficiente**
- **Reportes y análisis** financieros

---

## 📁 Estructura de Archivos Creados

```
artist-management/
├── supabase/migrations/
│   └── 20251103000000_create_artist_statements.sql  ← Esquema de BD
├── lib/
│   └── import-statements.ts                         ← Lógica de importación
├── components/finance/
│   ├── import-statements-dialog.tsx                 ← UI de importación
│   └── artist-statements-view.tsx                   ← Vista de estados de cuenta
└── docs/
    └── ESTADOS_DE_CUENTA_IMPLEMENTATION.md          ← Esta guía
```

---

## 🗄️ Esquema de Base de Datos

### Tablas Creadas

#### 1. `artist_statements`
Estado de cuenta mensual por artista.

```sql
- id: UUID (PK)
- artist_id: UUID (FK → artists)
- period_start: DATE
- period_end: DATE
- statement_month: VARCHAR(7)  -- Formato: YYYY-MM
- legal_name: TEXT
- total_income: DECIMAL(12, 2)
- total_expenses: DECIMAL(12, 2)
- total_advances: DECIMAL(12, 2)
- balance: DECIMAL(12, 2)
- total_transactions: INTEGER
- last_import_date: TIMESTAMP
- import_source: TEXT
```

**Constraint:** Un estado de cuenta por artista por mes (`UNIQUE(artist_id, statement_month)`)

#### 2. `statement_transactions`
Transacciones detalladas de cada estado de cuenta.

```sql
- id: UUID (PK)
- statement_id: UUID (FK → artist_statements)
- artist_id: UUID (FK → artists)
- transaction_date: DATE
- concept: TEXT
- payment_method: TEXT
- amount: DECIMAL(12, 2)
- transaction_type: VARCHAR(20)  -- income, expense, advance, payment
- category: TEXT
- running_balance: DECIMAL(12, 2)
```

#### 3. `statement_imports`
Historial de importaciones.

```sql
- id: UUID (PK)
- file_name: TEXT
- import_date: TIMESTAMP
- total_artists: INTEGER
- total_transactions: INTEGER
- successful_imports: INTEGER
- failed_imports: INTEGER
- import_summary: JSONB
- errors: JSONB
- imported_by: UUID (FK → auth.users)
```

### Funciones SQL

#### `calculate_statement_summary(statement_id UUID)`
Calcula y actualiza automáticamente los totales de un estado de cuenta.

#### `get_artist_financial_summary(artist_id UUID)`
Obtiene el resumen financiero completo de un artista (todos los periodos).

---

## 🔄 Flujo de Importación

### 1. **Preparación del Archivo Excel**

El archivo debe mantener la estructura actual:
- **Una hoja por artista**
- **Primeras filas:** Información del artista (Nombre Legal, Fechas)
- **Fila de encabezados:** Fecha, Concepto, Método de Pago, Balance
- **Filas de datos:** Transacciones del periodo

### 2. **Proceso de Importación**

```typescript
// Usuario sube el archivo
const file = e.target.files[0];

// 1. Procesar Excel
const result = await processStatementsExcel(file);

// 2. Guardar en base de datos
await saveStatementsToDatabase(result.artistsData, supabase, userId);

// 3. Actualizar vista
onImportComplete();
```

### 3. **Validaciones Automáticas**

- ✅ Verifica que el artista exista en la BD
- ✅ Detecta automáticamente el tipo de transacción
- ✅ Calcula balances acumulados
- ✅ Previene duplicados (por mes)
- ✅ Registra errores para debugging

---

## 📅 Actualización Mensual

### Opción 1: Importación Manual (Recomendada)

**Cada mes:**
1. Actualiza el archivo `Estados_de_Cuenta.xlsx`
2. Ve a Dashboard → Finance → "Importar Estados de Cuenta"
3. Sube el archivo actualizado
4. Revisa el resumen de importación
5. ¡Listo! Los datos se actualizan automáticamente

**Ventajas:**
- ✅ Control total sobre los datos
- ✅ Revisión antes de importar
- ✅ Flexibilidad para correcciones

### Opción 2: Importación Automática (Avanzada)

**Setup:**
```typescript
// Crear endpoint API para importación programada
// app/api/statements/import-scheduled/route.ts

export async function POST(request: Request) {
  // 1. Leer archivo desde storage
  const file = await supabase.storage
    .from('statements')
    .download('Estados_de_Cuenta.xlsx');
  
  // 2. Procesar e importar
  const result = await processStatementsExcel(file);
  await saveStatementsToDatabase(result, supabase, 'system');
  
  // 3. Notificar por email
  await sendImportNotification(result);
  
  return Response.json(result);
}
```

**Configurar Cron Job:**
```bash
# Vercel Cron (vercel.json)
{
  "crons": [{
    "path": "/api/statements/import-scheduled",
    "schedule": "0 0 1 * *"  // Primer día de cada mes a medianoche
  }]
}
```

---

## 🎨 Integración en el Dashboard

### Actualizar `app/dashboard/finance/page.tsx`

```typescript
import { ArtistStatementsView } from '@/components/finance/artist-statements-view'
import { ImportStatementsDialog } from '@/components/finance/import-statements-dialog'

export default function FinancePage() {
  const [showImportDialog, setShowImportDialog] = useState(false)
  
  return (
    <DashboardLayout>
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="statements">Estados de Cuenta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          {/* Vista actual de transacciones */}
        </TabsContent>
        
        <TabsContent value="statements">
          <ArtistStatementsView />
        </TabsContent>
      </Tabs>
      
      <Button onClick={() => setShowImportDialog(true)}>
        Importar Estados de Cuenta
      </Button>
      
      <ImportStatementsDialog 
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportComplete={() => {
          // Refrescar datos
        }}
      />
    </DashboardLayout>
  )
}
```

---

## 📊 Reportes y Análisis

### Reportes Disponibles

#### 1. **Resumen por Artista**
```sql
SELECT * FROM get_artist_financial_summary('artist-uuid');
```

Retorna:
- Total de ingresos
- Total de gastos
- Total de avances
- Balance actual
- Número de transacciones
- Periodo cubierto

#### 2. **Comparativa Mensual**
```sql
SELECT 
  statement_month,
  SUM(total_income) as income,
  SUM(total_expenses) as expenses,
  SUM(balance) as balance
FROM artist_statements
WHERE artist_id = 'artist-uuid'
GROUP BY statement_month
ORDER BY statement_month DESC;
```

#### 3. **Top Artistas por Balance**
```sql
SELECT 
  a.name,
  SUM(s.balance) as total_balance,
  COUNT(s.id) as months_count
FROM artist_statements s
JOIN artists a ON s.artist_id = a.id
GROUP BY a.id, a.name
ORDER BY total_balance DESC
LIMIT 10;
```

#### 4. **Artistas con Balance Negativo**
```sql
SELECT 
  a.name,
  s.balance,
  s.total_advances,
  s.statement_month
FROM artist_statements s
JOIN artists a ON s.artist_id = a.id
WHERE s.balance < 0
ORDER BY s.balance ASC;
```

---

## 🔒 Seguridad y Permisos

### RLS Policies Implementadas

```sql
-- Ver estados de cuenta: Todos los usuarios autenticados
CREATE POLICY "Users can view artist statements"
  ON artist_statements FOR SELECT TO authenticated USING (true);

-- Gestionar estados de cuenta: Solo admins
CREATE POLICY "Admins can manage artist statements"
  ON artist_statements FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

---

## 🚀 Pasos de Implementación

### 1. Ejecutar Migración SQL
```bash
# Conectar a Supabase
supabase db push

# O ejecutar manualmente en Supabase Dashboard
# SQL Editor → Pegar contenido de 20251103000000_create_artist_statements.sql
```

### 2. Instalar Dependencias
```bash
npm install xlsx
```

### 3. Actualizar Dashboard de Finanzas
- Agregar tab "Estados de Cuenta"
- Integrar `ArtistStatementsView`
- Agregar botón de importación

### 4. Primera Importación
1. Ir a Finance Dashboard
2. Click en "Importar Estados de Cuenta"
3. Seleccionar `Estados_de_Cuenta.xlsx`
4. Revisar resultados
5. Verificar datos en la vista

### 5. Configurar Actualización Mensual
- Opción A: Importación manual cada mes
- Opción B: Configurar cron job automático

---

## 📈 Ventajas del Sistema

### ✅ Eficiencia
- **Importación automática**: De Excel a BD en segundos
- **Sin duplicados**: Sistema previene datos repetidos
- **Cálculos automáticos**: Totales y balances se calculan solos

### ✅ Visibilidad
- **Vista consolidada**: Todos los artistas en un lugar
- **Filtros avanzados**: Por artista, mes, tipo de transacción
- **Reportes instantáneos**: Análisis financiero en tiempo real

### ✅ Escalabilidad
- **Histórico completo**: Mantiene todos los periodos
- **Performance optimizada**: Índices en columnas clave
- **Fácil de actualizar**: Solo sube el Excel actualizado

### ✅ Trazabilidad
- **Historial de importaciones**: Quién, cuándo, qué
- **Registro de errores**: Para debugging
- **Auditoría completa**: Todos los cambios registrados

---

## 🔧 Troubleshooting

### Problema: "Artista no encontrado"
**Solución:** Verifica que el nombre del artista en Excel coincida exactamente con el nombre en la tabla `artists`.

### Problema: "Transacciones duplicadas"
**Solución:** El sistema previene duplicados por mes. Si reimportas el mismo mes, las transacciones anteriores se eliminan.

### Problema: "Balance incorrecto"
**Solución:** Ejecuta `SELECT calculate_statement_summary('statement-id')` para recalcular.

### Problema: "Importación lenta"
**Solución:** Para archivos grandes (>1000 transacciones), considera dividir por trimestre.

---

## 📞 Soporte

Para dudas o problemas:
1. Revisa los logs en `statement_imports.errors`
2. Verifica los datos en Supabase Dashboard
3. Consulta esta documentación

---

## 🎯 Próximos Pasos

1. ✅ Ejecutar migración SQL
2. ✅ Instalar dependencias
3. ✅ Integrar componentes en dashboard
4. ✅ Realizar primera importación
5. ✅ Configurar actualización mensual
6. ✅ Capacitar al equipo

**¡El sistema está listo para usar!** 🚀
