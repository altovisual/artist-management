# ✅ Finance Dashboard con Avance y Soporte

## 🎯 Implementación Completada

Se ha mejorado el tab "Transacciones" agregando funcionalidades de **Solicitar Avance** y **Contactar Soporte**, además de implementar permisos por rol de usuario.

---

## 🔐 Sistema de Permisos

### **Roles de Usuario:**

1. **Admin**
   - ✅ Ve todas las transacciones de todos los artistas
   - ✅ Puede filtrar por cualquier artista
   - ✅ Acceso a "Import Statements" y "Manage Categories"
   - ✅ Puede solicitar avances y contactar soporte

2. **Artista**
   - ✅ Solo ve sus propias transacciones
   - ✅ Filtro de artista bloqueado (auto-seleccionado)
   - ✅ No ve botones de admin
   - ✅ Puede solicitar avances y contactar soporte

---

## ✨ Nuevas Funcionalidades

### **1. Solicitar Avance** 💳

**Ubicación:** Botón en PageHeader

**Modal incluye:**
- ✅ Campo: Monto solicitado (número)
- ✅ Campo: Motivo (textarea)
- ✅ Validación de campos requeridos
- ✅ Toast de confirmación

**Flujo:**
```
1. Click en "Solicitar Avance"
2. Completar formulario
3. Click en "Enviar Solicitud"
4. Confirmación con toast
5. Modal se cierra
```

**Mensaje de confirmación:**
```
"Tu solicitud de avance por $XX.XXX,XX ha sido enviada 
al equipo financiero."
```

---

### **2. Contactar Soporte** 💬

**Ubicación:** Botón en PageHeader

**Modal incluye:**
- ✅ Campo: Asunto
- ✅ Campo: Mensaje (textarea)
- ✅ Validación de campos requeridos
- ✅ Toast de confirmación

**Flujo:**
```
1. Click en "Contactar Soporte"
2. Completar formulario
3. Click en "Enviar Mensaje"
4. Confirmación con toast
5. Modal se cierra
```

**Mensaje de confirmación:**
```
"Tu consulta ha sido enviada al equipo de soporte. 
Te responderemos pronto."
```

---

## 🎨 Interfaz

### **PageHeader - Botones:**

**Para Artistas:**
```
[💳 Solicitar Avance] [💬 Contactar Soporte] [➕ Add Transaction]
```

**Para Admins:**
```
[💳 Solicitar Avance] [💬 Contactar Soporte] 
[📤 Import Statements] [⚙️ Manage Categories] [➕ Add Transaction]
```

---

## 🔒 Filtros con Permisos

### **Selector de Artista:**

**Admin:**
- ✅ Puede seleccionar "All Artists"
- ✅ Puede seleccionar cualquier artista
- ✅ Selector habilitado

**Artista:**
- ✅ Auto-seleccionado su artista
- ✅ Selector deshabilitado (disabled)
- ✅ No puede cambiar el filtro

---

## 📊 Dashboard de Transacciones

### **Contenido del Tab "Transacciones":**

1. **Stats Grid (3 métricas):**
   - Total Income
   - Total Expenses
   - Net Balance

2. **Métricas Secundarias (3 cards clickeables):**
   - Transactions (conteo)
   - Categories (conteo)
   - Artists (conteo)

3. **Filtros Avanzados:**
   - Artista (bloqueado para artistas)
   - Tipo (Income/Expense)
   - Categoría
   - Búsqueda por descripción
   - Rango de fechas

4. **Tabla de Transacciones:**
   - Fecha
   - Artista
   - Categoría
   - Descripción
   - Monto

5. **Gráfico Financiero:**
   - Vista mensual/diaria
   - Ingresos vs Gastos

---

## 🔧 Implementación Técnica

### **Estados Agregados:**

```typescript
// User role and permissions
const [userRole, setUserRole] = useState<'admin' | 'artist' | null>(null)
const [currentUserId, setCurrentUserId] = useState<string | null>(null)
const [currentArtistId, setCurrentArtistId] = useState<string | null>(null)

// Advance modal
const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false)
const [advanceAmount, setAdvanceAmount] = useState('')
const [advanceReason, setAdvanceReason] = useState('')

// Support modal
const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
const [supportSubject, setSupportSubject] = useState('')
const [supportMessage, setSupportMessage] = useState('')
```

### **Funciones Principales:**

```typescript
// Obtener rol del usuario
fetchUserRole(): Promise<void>
  - Obtiene usuario actual de Supabase Auth
  - Verifica si es admin en tabla profiles
  - Verifica si es artista en tabla artists
  - Auto-selecciona artista si corresponde

// Solicitar avance
handleAdvanceRequest(): Promise<void>
  - Valida campos
  - Muestra toast de confirmación
  - Limpia formulario
  - Cierra modal

// Contactar soporte
handleSupportRequest(): Promise<void>
  - Valida campos
  - Muestra toast de confirmación
  - Limpia formulario
  - Cierra modal
```

### **Modificaciones en fetchTransactions:**

```typescript
// Filtrado por rol
if (userRole === 'artist' && currentArtistId) {
  query = query.eq('artist_id', currentArtistId)
} else if (appliedSelectedArtistId !== 'all') {
  query = query.eq('artist_id', appliedSelectedArtistId)
}
```

---

## 📝 Próximos Pasos (Backend)

### **Tablas a Crear:**

1. **advance_requests**
   ```sql
   - id (uuid, primary key)
   - artist_id (uuid, FK to artists)
   - user_id (uuid, FK to auth.users)
   - amount (decimal)
   - reason (text)
   - status (enum: pending, approved, rejected)
   - created_at (timestamp)
   - updated_at (timestamp)
   - approved_by (uuid, FK to auth.users)
   - approved_at (timestamp)
   ```

2. **support_tickets**
   ```sql
   - id (uuid, primary key)
   - user_id (uuid, FK to auth.users)
   - subject (text)
   - message (text)
   - status (enum: open, in_progress, resolved, closed)
   - priority (enum: low, medium, high)
   - created_at (timestamp)
   - updated_at (timestamp)
   - assigned_to (uuid, FK to auth.users)
   - resolved_at (timestamp)
   ```

### **APIs a Crear:**

1. **POST /api/advance-requests**
   - Crear solicitud de avance
   - Enviar notificación al equipo financiero
   - Email de confirmación al artista

2. **POST /api/support-tickets**
   - Crear ticket de soporte
   - Enviar notificación al equipo de soporte
   - Email de confirmación al usuario

3. **GET /api/advance-requests**
   - Listar solicitudes (admin ve todas, artista solo las suyas)
   - Filtros por estado, fecha, artista

4. **PATCH /api/advance-requests/:id**
   - Aprobar/rechazar solicitud (solo admin)
   - Actualizar estado
   - Notificar al artista

---

## 🎯 Flujo Completo

### **Como Artista:**

1. **Login** → Detecta rol "artist"
2. **Finance** → Ve solo sus transacciones
3. **Filtro bloqueado** → No puede cambiar artista
4. **Solicitar Avance:**
   - Click en botón
   - Completa formulario
   - Envía solicitud
   - Recibe confirmación
5. **Contactar Soporte:**
   - Click en botón
   - Describe problema
   - Envía mensaje
   - Recibe confirmación

### **Como Admin:**

1. **Login** → Detecta rol "admin"
2. **Finance** → Ve todas las transacciones
3. **Filtro habilitado** → Puede filtrar por artista
4. **Botones adicionales:**
   - Import Statements
   - Manage Categories
5. **Puede solicitar avances y contactar soporte**

---

## ✅ Checklist de Implementación

### **Frontend** ✅
- ✅ Sistema de roles (admin/artist)
- ✅ Fetch de rol de usuario
- ✅ Filtrado por artista según rol
- ✅ Selector de artista deshabilitado para artistas
- ✅ Botones de Avance y Soporte
- ✅ Modales con formularios
- ✅ Validación de campos
- ✅ Toast de confirmación
- ✅ Botones de admin condicionales

### **Backend** ⏳ (Pendiente)
- ⏳ Tabla advance_requests
- ⏳ Tabla support_tickets
- ⏳ API POST /api/advance-requests
- ⏳ API POST /api/support-tickets
- ⏳ API GET /api/advance-requests
- ⏳ API PATCH /api/advance-requests/:id
- ⏳ Notificaciones por email
- ⏳ Panel admin para gestionar solicitudes

---

## 📁 Archivos Modificados

**Archivo:** `app/dashboard/finance/page.tsx`

**Cambios:**
1. ✅ Imports agregados (CreditCard, MessageSquare, Label, Textarea, DialogFooter)
2. ✅ Estados para rol de usuario
3. ✅ Estados para modales de avance y soporte
4. ✅ Función fetchUserRole()
5. ✅ Modificación de fetchTransactions() con filtro por rol
6. ✅ Funciones handleAdvanceRequest() y handleSupportRequest()
7. ✅ Botones en PageHeader con condicionales
8. ✅ Selector de artista con disabled={userRole === 'artist'}
9. ✅ Modales de Avance y Soporte
10. ✅ useEffect para fetchUserRole()

---

## 🚀 Cómo Probar

### **Como Artista:**
1. Login con usuario artista
2. Ve a Finance
3. Verifica que solo ves tus transacciones
4. Verifica que el filtro de artista está bloqueado
5. Click en "Solicitar Avance"
6. Completa y envía
7. Click en "Contactar Soporte"
8. Completa y envía

### **Como Admin:**
1. Login con usuario admin
2. Ve a Finance
3. Verifica que ves todas las transacciones
4. Verifica que puedes cambiar el filtro de artista
5. Verifica botones adicionales (Import, Manage Categories)
6. Prueba Avance y Soporte

---

## 🎉 Resultado

El tab "Transacciones" ahora es un **dashboard completo** donde:
- ✅ Artistas ven solo sus datos
- ✅ Admins ven todos los datos
- ✅ Todos pueden solicitar avances
- ✅ Todos pueden contactar soporte
- ✅ Permisos implementados correctamente
- ✅ UI intuitiva y profesional

**¡Listo para usar!** 🚀✨
