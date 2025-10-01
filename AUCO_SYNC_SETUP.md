# 🔄 Sincronización de Contratos de Auco

## ¿Qué hace?

Sincroniza automáticamente TODOS los contratos de Auco a tu tabla `signatures` en Supabase.

## Setup Rápido (3 pasos)

### 1. Ejecutar Migración SQL

Abre Supabase Dashboard → SQL Editor → Ejecuta:

```sql
-- Copiar y pegar todo el contenido de:
supabase/migrations/20250930220000_add_auco_sync_to_signatures.sql
```

Esto agrega las columnas necesarias:
- `auco_document_id` - ID del documento en Auco
- `metadata` - Datos adicionales de Auco
- `signer_name` - Nombre del firmante
- `document_url` - URL del documento firmado
- `signed_at` - Fecha de firma

### 2. Verificar Variables de Entorno

Asegúrate de tener en `.env.local`:

```env
AUCO_API_KEY=tu_api_key_de_auco
AUCO_API_URL=https://api.auco.io/v1
```

### 3. Sincronizar Contratos

La sincronización ya funciona automáticamente:

#### Opción A: Automática (cada 5 minutos)
- La página `/management/signatures` sincroniza automáticamente
- No necesitas hacer nada

#### Opción B: Manual (botón Refresh)
- Ve a `/management/signatures`
- Click en el botón "Refresh" 🔄
- Espera unos segundos

## Cómo Funciona

### Flujo de Sincronización:

```
1. Click en Refresh (o espera 5 min)
   ↓
2. API llama a Auco: /document/list
   ↓
3. Obtiene TODOS los documentos
   ↓
4. Para cada documento:
   - Verifica si existe en BD (por auco_document_id)
   - Si existe: ACTUALIZA el estado
   - Si NO existe: INSERTA nuevo registro
   ↓
5. Actualiza la tabla signatures
   ↓
6. Muestra en la interfaz
```

### Mapeo de Estados:

| Auco Status | Nuestra BD |
|---|---|
| draft | pending |
| sent | pending |
| completed | completed |
| declined | failed |
| expired | failed |

## Verificar que Funciona

### 1. Ver logs en consola del navegador:

```
Fetching ALL documents from Auco...
Found 15 documents in Auco to sync
Processing document: ABC123
✅ Updated signature: xyz-456
✅ Inserted new signature: ABC123
```

### 2. Ver en la tabla:

```sql
-- En Supabase SQL Editor
SELECT 
  id,
  signer_email,
  status,
  auco_document_id,
  signed_at,
  created_at
FROM signatures
ORDER BY created_at DESC
LIMIT 10;
```

### 3. Ver en la interfaz:

- Ve a `/management/signatures`
- Deberías ver TODOS tus contratos de Auco
- Con sus estados actualizados
- Con links para descargar

## Notificaciones Automáticas

Una vez sincronizados, recibirás notificaciones cuando:

### ✅ Se firma un contrato
```
✅ Contract signed by john@example.com
   "Samuelito contract signed by john@example.com"
```

### ⏰ Recordatorio (5 horas después)
```
⏰ Reminder: Contract pending signature
   "john@example.com hasn't signed yet (5 hours)"
```

## Troubleshooting

### ❌ No aparecen contratos

1. **Verifica API Key:**
   ```bash
   # En terminal
   echo $AUCO_API_KEY
   ```

2. **Verifica logs:**
   - Abre DevTools (F12)
   - Ve a Console
   - Busca errores de Auco

3. **Prueba manualmente:**
   ```bash
   curl -H "Authorization: Bearer $AUCO_API_KEY" \
        https://api.auco.io/v1/document/list
   ```

### ❌ Algunos contratos no se sincronizan

1. **Verifica que tengan código:**
   - Cada documento debe tener `code` o `id`

2. **Verifica permisos:**
   - Tu API Key debe tener acceso a todos los documentos

### ❌ Estados no se actualizan

1. **Ejecuta sync manual:**
   - Click en Refresh en `/management/signatures`

2. **Verifica Realtime:**
   - Ejecuta `ENABLE_SIGNATURES_REALTIME.sql`

## Datos que se Sincronizan

Para cada contrato de Auco, se guarda:

```typescript
{
  auco_document_id: "ABC123",        // ID en Auco
  signer_email: "john@example.com",  // Email del firmante
  signer_name: "John Doe",           // Nombre del firmante
  status: "completed",               // Estado mapeado
  document_url: "https://...",       // URL del PDF firmado
  signed_at: "2025-09-30T...",      // Fecha de firma
  metadata: {                        // Datos adicionales
    auco_status: "completed",
    auco_created_at: "...",
    auco_updated_at: "...",
    template_id: "..."
  }
}
```

## Sincronización Continua

### Automática:
- ✅ Cada 5 minutos en `/management/signatures`
- ✅ Al cargar la página
- ✅ Al hacer click en Refresh

### Realtime:
- ✅ Cuando se firma un contrato → Notificación instantánea
- ✅ Cuando se actualiza → Se refleja en la tabla
- ✅ Sin necesidad de recargar

## Comandos Útiles

### Ver todos los contratos sincronizados:
```sql
SELECT COUNT(*) as total,
       COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
       COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
FROM signatures
WHERE auco_document_id IS NOT NULL;
```

### Ver contratos sin sincronizar:
```sql
SELECT * FROM signatures
WHERE auco_document_id IS NULL;
```

### Forzar re-sincronización:
```sql
-- Limpiar auco_document_id para forzar re-sync
UPDATE signatures
SET auco_document_id = NULL
WHERE id = 'signature-id-aqui';
```

## Resultado Final

Después del setup:

1. ✅ Todos los contratos de Auco en tu BD
2. ✅ Estados actualizados automáticamente
3. ✅ Notificaciones cuando se firman
4. ✅ Recordatorios automáticos (5 horas)
5. ✅ Sincronización continua cada 5 minutos
6. ✅ Links para descargar PDFs firmados

¡Todo sincronizado y funcionando! 🎉
