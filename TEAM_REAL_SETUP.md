# 🎯 SISTEMA DE TEAM MEMBERS CON USUARIOS REALES

## 📋 GUÍA DE IMPLEMENTACIÓN

### **PASO 1: Ejecutar SQL en Supabase**

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia el contenido de `supabase/team-members-real.sql`
3. Ejecuta el SQL
4. Verifica que la tabla `team_members` se creó correctamente

---

### **PASO 2: Verificar Estructura**

La tabla `team_members` tendrá:
- ✅ `id` - UUID del usuario (FK a auth.users)
- ✅ `name` - Nombre del usuario
- ✅ `email` - Email único
- ✅ `avatar` - URL del avatar
- ✅ `role` - admin | manager | member
- ✅ `is_online` - Estado online
- ✅ `last_seen` - Última vez visto
- ✅ `invited_by` - Quién lo invitó
- ✅ `joined_at` - Fecha de ingreso

---

### **PASO 3: Usar el Nuevo Hook**

Reemplaza `useRealTeam` por `useTeamReal`:

```tsx
// Antes
import { useRealTeam } from '@/hooks/use-real-team'

// Ahora
import { useTeamReal } from '@/hooks/use-team-real'

// Uso
const {
  teamMembers,        // Miembros actuales del equipo
  availableUsers,     // Usuarios registrados disponibles
  currentUser,        // Usuario actual
  isLoading,
  addTeamMember,      // Agregar miembro por email
  updateMemberRole,   // Cambiar rol
  removeMember        // Remover miembro
} = useTeamReal()
```

---

### **PASO 4: Agregar Miembros**

#### **Opción A: Con Dialog Component**

```tsx
import { AddTeamMemberDialog } from '@/components/team/add-team-member-dialog'

function MyComponent() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        Add Team Member
      </Button>
      
      <AddTeamMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
```

#### **Opción B: Programáticamente**

```tsx
const { addTeamMember } = useTeamReal()

const handleAddMember = async () => {
  const result = await addTeamMember('user@example.com', 'member')
  
  if (result.success) {
    console.log('Member added:', result.userId)
  } else {
    console.error('Error:', result.error)
  }
}
```

---

### **PASO 5: Funcionalidades Disponibles**

#### **1. Agregar Miembro**
```tsx
await addTeamMember('user@example.com', 'member')
```

#### **2. Cambiar Rol**
```tsx
await updateMemberRole(userId, 'admin')
```

#### **3. Remover Miembro**
```tsx
await removeMember(userId)
```

#### **4. Ver Usuarios Disponibles**
```tsx
const { availableUsers } = useTeamReal()

// Filtrar solo los que NO son miembros
const nonMembers = availableUsers.filter(u => !u.is_team_member)
```

---

### **PASO 6: Integrar con Chat**

El hook `useChat` ya está configurado para usar `teamMembers`:

```tsx
// En use-chat.ts ya está integrado
const { teamMembers } = useRealTeam()

// Los mensajes automáticamente obtienen sender info desde teamMembers
```

---

## 🔐 SEGURIDAD Y PERMISOS

### **RLS Policies Implementadas:**

1. **Ver Miembros**: Todos los usuarios autenticados
2. **Agregar Miembros**: Solo admins
3. **Actualizar Perfil Propio**: Cualquier usuario
4. **Actualizar Otros Perfiles**: Solo admins
5. **Eliminar Miembros**: Solo admins

---

## 📊 FUNCIONES SQL DISPONIBLES

### **1. add_team_member(email, role)**
Agrega un usuario existente al equipo:
```sql
SELECT add_team_member('user@example.com', 'member');
```

### **2. get_available_users()**
Obtiene todos los usuarios registrados:
```sql
SELECT * FROM get_available_users();
```

---

## 🎨 COMPONENTES DISPONIBLES

### **1. AddTeamMemberDialog**
Dialog completo con:
- ✅ Búsqueda de usuarios registrados
- ✅ Lista con avatares
- ✅ Selección de rol
- ✅ Validación de email
- ✅ Estados de carga

### **2. useTeamReal Hook**
Hook completo con:
- ✅ Datos en tiempo real
- ✅ Estado online automático
- ✅ Suscripciones a cambios
- ✅ Funciones CRUD completas

---

## 🚀 EJEMPLO COMPLETO

```tsx
'use client'

import { useState } from 'react'
import { useTeamReal } from '@/hooks/use-team-real'
import { AddTeamMemberDialog } from '@/components/team/add-team-member-dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function TeamManagement() {
  const {
    teamMembers,
    currentUser,
    isLoading,
    updateMemberRole,
    removeMember
  } = useTeamReal()
  
  const [dialogOpen, setDialogOpen] = useState(false)

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2>Team Members ({teamMembers.length})</h2>
        {currentUser?.role === 'admin' && (
          <Button onClick={() => setDialogOpen(true)}>
            Add Member
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {teamMembers.map(member => (
          <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <Avatar>
              <AvatarImage src={member.avatar} />
              <AvatarFallback>
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>

            <Badge>{member.role}</Badge>

            {member.isOnline && (
              <div className="h-2 w-2 bg-green-500 rounded-full" />
            )}

            {currentUser?.role === 'admin' && member.id !== currentUser.id && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeMember(member.id)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>

      <AddTeamMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Ejecutar `team-members-real.sql` en Supabase
- [ ] Verificar que la tabla se creó correctamente
- [ ] Importar `useTeamReal` en lugar de `useRealTeam`
- [ ] Agregar `AddTeamMemberDialog` donde necesites
- [ ] Probar agregar un miembro con email
- [ ] Verificar que aparece en el chat
- [ ] Probar cambiar roles
- [ ] Probar remover miembros

---

## 🎯 RESULTADO FINAL

- ✅ **Usuarios Reales**: Solo usuarios registrados en auth.users
- ✅ **Agregar por Email**: Buscar y agregar usuarios existentes
- ✅ **Roles Dinámicos**: admin, manager, member
- ✅ **Tiempo Real**: Cambios se reflejan instantáneamente
- ✅ **Chat Integrado**: Miembros aparecen automáticamente en chat
- ✅ **Seguridad**: RLS policies completas
- ✅ **Estado Online**: Actualización automática

---

## 📞 SOPORTE

Si tienes problemas:
1. Verifica que el SQL se ejecutó correctamente
2. Revisa que el usuario actual es admin
3. Confirma que los usuarios existen en auth.users
4. Revisa la consola para errores de RLS policies
