'use client'

import { CompactWorkspaceWidget } from './compact-workspace-widget'
import { useCompactWorkspace } from '@/hooks/use-compact-workspace'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Users, Crown, Shield, User } from 'lucide-react'

/**
 * Demo del Team Management con datos reales de Supabase
 * 
 * Funcionalidades implementadas:
 * ✅ Team members reales desde Supabase/simulados
 * ✅ Roles: admin, manager, member con permisos
 * ✅ Estados online/offline en tiempo real
 * ✅ Gestión de roles (cambiar admin/manager/member)
 * ✅ Invitar nuevos miembros por email
 * ✅ Remover miembros del equipo
 * ✅ Estadísticas del equipo en tiempo real
 * ✅ Chat individual con miembros
 * ✅ Permisos basados en rol del usuario actual
 */
export function RealTeamDemo() {
  const {
    teamMembers,
    currentUser,
    teamStats,
    isLoading,
    error,
    updateMemberRole,
    updateMemberOnlineStatus,
    inviteMember,
    removeMember,
    refreshData
  } = useCompactWorkspace()

  const handleUpdateRole = async (memberId: string, role: 'admin' | 'manager' | 'member') => {
    try {
      await updateMemberRole(memberId, role)
      console.log('✅ Role updated successfully')
    } catch (err) {
      console.error('❌ Error updating role:', err)
    }
  }

  const handleInviteMember = async (email: string, role: 'admin' | 'manager' | 'member') => {
    try {
      await inviteMember(email, role)
      console.log('✅ Member invited successfully')
    } catch (err) {
      console.error('❌ Error inviting member:', err)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId)
      console.log('✅ Member removed successfully')
    } catch (err) {
      console.error('❌ Error removing member:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">👥 Loading Team Data...</h2>
          <p className="text-muted-foreground mb-4">
            Cargando miembros del equipo y configuraciones
          </p>
        </div>

        <div className="w-full max-w-sm">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl rounded-lg p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 rounded-xl bg-white/30 dark:bg-gray-800/30">
                    <Skeleton className="h-6 w-8 mb-1 mx-auto" />
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="w-6 h-6 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-600">❌ Error Loading Team</h2>
          <p className="text-muted-foreground mb-4">
            {error}
          </p>
          <Button onClick={refreshData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">👥 Team Management - Datos Reales</h2>
        <p className="text-muted-foreground mb-4">
          Gestión completa del equipo con datos reales de Supabase
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center text-xs mb-4">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {teamStats?.totalMembers || 0} Total Members
          </Badge>
          <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            {teamStats?.onlineMembers || 0} Online
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Crown className="h-3 w-3" />
            {teamStats?.adminCount || 0} Admins
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            {teamStats?.managerCount || 0} Managers
          </Badge>
          <Badge variant="outline" className="gap-1">
            <User className="h-3 w-3" />
            {teamStats?.memberCount || 0} Members
          </Badge>
        </div>

        <div className="flex gap-2 justify-center mb-4">
          <Button onClick={refreshData} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Team
          </Button>
        </div>

        {currentUser && (
          <div className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <strong>Tu rol:</strong> {currentUser.role} • 
            <strong> Permisos:</strong> {
              currentUser.role === 'admin' ? 'Administrar todo el equipo' :
              currentUser.role === 'manager' ? 'Gestionar miembros' :
              'Ver equipo y colaborar'
            }
          </div>
        )}
      </div>

      <div className="w-full max-w-sm">
        <CompactWorkspaceWidget
          notifications={[]} // Solo mostramos team en esta demo
          projects={[]}
          teamMembers={teamMembers}
          currentUser={currentUser}
          teamStats={teamStats}
          onNotificationClick={() => {}}
          onProjectClick={() => {}}
          onUpdateMemberRole={handleUpdateRole}
          onUpdateOnlineStatus={updateMemberOnlineStatus}
          onInviteMember={handleInviteMember}
          onRemoveMember={handleRemoveMember}
        />
      </div>

      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p className="mb-2">
          <strong>Funcionalidades del Team Management:</strong>
        </p>
        <ul className="text-left space-y-1">
          <li>• <strong>Roles dinámicos:</strong> Admin, Manager, Member con permisos</li>
          <li>• <strong>Estados online:</strong> Tiempo real con última conexión</li>
          <li>• <strong>Gestión de roles:</strong> Cambiar permisos de miembros</li>
          <li>• <strong>Invitar miembros:</strong> Por email con rol específico</li>
          <li>• <strong>Remover miembros:</strong> Con confirmación de seguridad</li>
          <li>• <strong>Chat individual:</strong> Comunicación directa</li>
          <li>• <strong>Estadísticas:</strong> Métricas del equipo en tiempo real</li>
        </ul>
      </div>

      {teamMembers.length > 0 && (
        <div className="w-full max-w-md">
          <h3 className="font-semibold mb-3">Miembros del Equipo:</h3>
          <div className="space-y-2">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                      member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {member.role}
                  </Badge>
                  {member.id === currentUser?.id && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Guía de funcionalidades del team management
export const TEAM_MANAGEMENT_GUIDE = `
// Team Management con datos reales implementado:

1. **Hook useRealTeam:**
   - Conecta con Supabase para datos reales del equipo
   - Fallback a datos simulados si no hay tabla profiles
   - Combina usuario actual + miembros del sistema
   - Estados online/offline en tiempo real

2. **Funcionalidades implementadas:**
   - updateMemberRole() - Cambiar roles (admin/manager/member)
   - updateMemberOnlineStatus() - Actualizar estado online
   - inviteMember() - Invitar nuevos miembros por email
   - removeMember() - Remover miembros del equipo
   - Estadísticas en tiempo real del equipo

3. **Sistema de permisos:**
   - Admin: Puede gestionar todos los miembros y roles
   - Manager: Puede invitar y gestionar miembros básicos
   - Member: Solo puede ver el equipo y colaborar

4. **RealTeamSection component:**
   - Interfaz completa para gestión de equipo
   - Modales para invitar miembros
   - Dropdowns para cambiar roles
   - Chat individual con miembros
   - Estadísticas visuales del equipo

5. **Integración en CompactWorkspaceWidget:**
   - Tab "Team" con funcionalidad completa
   - Datos reales desde Supabase
   - Interacciones funcionales
   - Estados de loading y error

¡El team management está completamente funcional con datos reales!
`
