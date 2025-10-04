# 🎯 Sistema de Archivado y Paginación - Signatures

## ✅ Implementación Completa

He implementado un sistema completo de **archivado/eliminación** y **paginación** para la página de Signatures.

---

## 📋 PASO 1: Actualizar Base de Datos

**Ejecuta este script en Supabase SQL Editor:**

```sql
-- Archivo: supabase/add_archived_column.sql

-- 1. Agregar columna archived (default false)
ALTER TABLE public.signatures
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- 2. Agregar columna deleted_at para soft delete
ALTER TABLE public.signatures
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 3. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_signatures_archived 
ON public.signatures(archived) 
WHERE archived = false;

CREATE INDEX IF NOT EXISTS idx_signatures_deleted 
ON public.signatures(deleted_at) 
WHERE deleted_at IS NULL;
```

---

## 🚀 FUNCIONALIDADES IMPLEMENTADAS

### 1. **Sistema de Archivado**
- ✅ Botón para archivar/desarchivar documentos
- ✅ Filtro para mostrar/ocultar archivados
- ✅ Los documentos archivados se ocultan por defecto
- ✅ Icono de intercambio (⇄) para archivar

### 2. **Sistema de Eliminación**
- ✅ Soft delete (no elimina físicamente)
- ✅ Marca con `deleted_at` timestamp
- ✅ Los eliminados nunca se muestran
- ✅ Confirmación antes de eliminar
- ✅ Icono de X rojo para eliminar

### 3. **Sistema de Paginación**
- ✅ 10 documentos por página
- ✅ Navegación con botones Anterior/Siguiente
- ✅ Números de página clickeables
- ✅ Contador de documentos (ej: "Mostrando 10 de 25")
- ✅ Paginación solo aparece si hay más de 1 página

### 4. **Filtros Mejorados**
- ✅ Filtro por estado (All, Pending, Completed, Rejected)
- ✅ Filtro para mostrar/ocultar archivados
- ✅ Los filtros se combinan con la paginación
- ✅ Botón toggle "Mostrar Archivados" / "Ocultar Archivados"

---

## 🎨 INTERFAZ DE USUARIO

### **Botones Agregados:**

1. **Botón "Mostrar Archivados"** (en el header)
   - Ubicación: Junto al botón Refresh
   - Función: Toggle para mostrar/ocultar documentos archivados
   - Estilo: Outline cuando ocultos, Default cuando visibles

2. **Botón Archivar** (en cada fila)
   - Icono: ⇄ (ArrowLeftRight)
   - Función: Archivar/Desarchivar documento
   - Tooltip: "Archivar" o "Desarchivar"

3. **Botón Eliminar** (en cada fila)
   - Icono: ✕ (XCircle)
   - Color: Rojo (destructive)
   - Función: Soft delete con confirmación
   - Tooltip: "Eliminar"

### **Paginación:**

```
[Mostrando 10 de 25 documentos]  [Anterior] [1] [2] [3] [Siguiente]
```

- Aparece debajo de la tabla
- Botones deshabilitados en límites
- Página actual resaltada
- Responsive en móvil

---

## 📊 API ENDPOINTS ACTUALIZADOS

### **GET /api/signatures**
Ahora acepta query parameters:

```typescript
GET /api/signatures?page=1&limit=10&showArchived=false&status=all

Response:
{
  data: SignatureData[],
  pagination: {
    page: 1,
    limit: 10,
    total: 25,
    totalPages: 3
  }
}
```

### **PATCH /api/signatures/[id]**
Ahora acepta `archived`:

```typescript
PATCH /api/signatures/123
Body: { archived: true }

Response: SignatureData actualizada
```

### **DELETE /api/signatures/[id]**
Ahora hace soft delete:

```typescript
DELETE /api/signatures/123

Response: {
  message: "Signature deleted successfully",
  signature: SignatureData
}
```

---

## 🔧 CÓMO USAR

### **Para Archivar un Documento:**
1. Ve a /management/signatures
2. Busca el documento en la tabla
3. Click en el botón ⇄ (intercambio)
4. El documento se archiva y desaparece de la vista

### **Para Ver Archivados:**
1. Click en "Mostrar Archivados" (header)
2. Los documentos archivados aparecen
3. Puedes desarchivarlos con el mismo botón ⇄

### **Para Eliminar un Documento:**
1. Click en el botón ✕ (X rojo)
2. Confirma la eliminación
3. El documento se marca como eliminado (soft delete)
4. Ya no aparecerá en ninguna vista

### **Para Navegar entre Páginas:**
1. Usa los botones Anterior/Siguiente
2. O click directo en el número de página
3. La paginación se mantiene al cambiar filtros

---

## 📝 ESTADOS DE DOCUMENTOS

| Estado | Descripción | Visible por Defecto |
|--------|-------------|---------------------|
| **Activo** | Documento normal | ✅ Sí |
| **Archivado** | Documento archivado | ❌ No (toggle para mostrar) |
| **Eliminado** | Soft deleted | ❌ Nunca |

---

## 🎯 FLUJO COMPLETO

```
1. Usuario ve lista de documentos (10 por página)
   ↓
2. Puede archivar documentos que ya no necesita
   ↓
3. Los archivados se ocultan automáticamente
   ↓
4. Puede activar "Mostrar Archivados" para verlos
   ↓
5. Puede desarchivar si los necesita de nuevo
   ↓
6. Puede eliminar permanentemente (soft delete)
   ↓
7. Navega entre páginas con la paginación
```

---

## ⚠️ IMPORTANTE

1. **Soft Delete**: Los documentos eliminados NO se borran físicamente, solo se marcan con `deleted_at`

2. **Archivados**: Son reversibles, puedes desarchivar en cualquier momento

3. **Paginación**: Se mantiene al cambiar filtros o estados

4. **Performance**: Los índices mejoran la velocidad de queries

5. **UX**: Confirmación antes de eliminar para evitar errores

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Agregar columnas `archived` y `deleted_at` a tabla signatures
- [x] Crear índices para performance
- [x] Actualizar API GET con paginación y filtros
- [x] Actualizar API PATCH para soportar archived
- [x] Actualizar API DELETE para soft delete
- [x] Agregar estados de paginación en frontend
- [x] Agregar botones de archivar/eliminar
- [x] Agregar toggle "Mostrar Archivados"
- [x] Implementar UI de paginación
- [x] Actualizar interfaces TypeScript
- [x] Manejar confirmación de eliminación

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecuta el script SQL** en Supabase (add_archived_column.sql)
2. **Reinicia el servidor** (npm run dev)
3. **Prueba las funcionalidades**:
   - Archivar un documento
   - Ver archivados
   - Eliminar un documento
   - Navegar entre páginas
4. **Verifica que todo funcione** correctamente

---

## 📊 RESULTADO ESPERADO

Después de implementar, verás:

```
┌─────────────────────────────────────────────────────────┐
│ Signature Status                    [Refresh] [Mostrar] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Documento        Firmante      Estado    Acciones       │
│ ─────────────────────────────────────────────────────── │
│ Contrato 1       user@mail     ✓ Firmado  👁️ ⇄ ✕      │
│ Contrato 2       user2@mail    ⏳ Enviado  👁️ ⇄ ✕      │
│ ...                                                      │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ Mostrando 10 de 25  [Anterior] [1] [2] [3] [Siguiente] │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 TIPS

- **Archivar** documentos completados antiguos para mantener la lista limpia
- **Eliminar** solo documentos que definitivamente no necesitas
- **Usar paginación** para navegar grandes cantidades de documentos
- **Filtrar por estado** para encontrar documentos específicos
- **Mostrar archivados** ocasionalmente para revisar documentos antiguos

---

¡El sistema está completo y listo para usar! 🎉
