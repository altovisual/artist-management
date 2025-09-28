'use client'

import { CompactWorkspaceWidget } from './compact-workspace-widget'
import { useCompactWorkspace } from '@/hooks/use-compact-workspace'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

/**
 * Demo del CompactWorkspaceWidget con datos reales de Supabase
 * 
 * Funcionalidades implementadas:
 * ✅ Datos reales desde Supabase
 * ✅ Notificaciones del sistema existente
 * ✅ Proyectos desde tabla 'artists'
 * ✅ Team members simulados + usuario actual
 * ✅ Estados online en tiempo real
 * ✅ Marcar notificaciones como leídas
 * ✅ Favoritos de proyectos
 * ✅ Suscripciones en tiempo real
 * ✅ Loading states y error handling
 */
export function CompactWorkspaceRealDemo() {
  const {
    notifications,
    projects,
    teamMembers,
    currentUser,
    isLoading,
    error,
    markNotificationAsRead,
    toggleProjectFavorite,
    createProject,
    refreshData
  } = useCompactWorkspace()

  const handleNotificationClick = (notification: any) => {
    console.log('📱 Real notification tapped:', notification.title)
    markNotificationAsRead(notification.id)
  }

  const handleProjectClick = (project: any) => {
    console.log('📁 Real project tapped:', project.name)
    // Aquí podrías navegar al proyecto real
  }

  const handleCreateProject = async () => {
    try {
      const newProject = await createProject(
        'New Project ' + Date.now(),
        'Created from compact workspace widget'
      )
      console.log('✅ Project created:', newProject)
    } catch (err) {
      console.error('❌ Error creating project:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">📱 Loading Real Workspace Data...</h2>
          <p className="text-muted-foreground mb-4">
            Conectando con Supabase y cargando datos reales
          </p>
        </div>

        <div className="w-full max-w-sm">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl rounded-lg p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
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
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40">
                    <Skeleton className="w-6 h-6 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
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
          <h2 className="text-2xl font-bold mb-2 text-red-600">❌ Error Loading Data</h2>
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
        <h2 className="text-2xl font-bold mb-2">📱 Compact Workspace - Datos Reales</h2>
        <p className="text-muted-foreground mb-4">
          Conectado a Supabase con datos en tiempo real
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center text-xs mb-4">
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
            ✅ {notifications.length} Notificaciones reales
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            ✅ {projects.length} Proyectos desde DB
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
            ✅ {teamMembers.filter(m => m.isOnline).length} Usuarios online
          </span>
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
            ✅ Tiempo real activo
          </span>
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={refreshData} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
          <Button onClick={handleCreateProject} variant="outline" size="sm">
            + New Project
          </Button>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <CompactWorkspaceWidget
          notifications={notifications}
          projects={projects}
          teamMembers={teamMembers}
          onNotificationClick={handleNotificationClick}
          onProjectClick={handleProjectClick}
        />
      </div>

      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p className="mb-2">
          <strong>Datos Reales Conectados:</strong>
        </p>
        <ul className="text-left space-y-1">
          <li>• <strong>Notificaciones:</strong> Sistema real de notificaciones</li>
          <li>• <strong>Proyectos:</strong> Tabla &apos;artists&apos; como proyectos</li>
          <li>• <strong>Usuario actual:</strong> {currentUser?.name || 'Loading...'}</li>
          <li>• <strong>Team online:</strong> {teamMembers.filter(m => m.isOnline).length} miembros</li>
          <li>• <strong>Tiempo real:</strong> Suscripciones activas</li>
          <li>• <strong>Interacciones:</strong> Marcar como leído, favoritos</li>
        </ul>
      </div>

      {currentUser && (
        <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <strong>Usuario actual:</strong> {currentUser.name} ({currentUser.email}) - {currentUser.role}
        </div>
      )}
    </div>
  )
}

// Guía de integración con datos reales
export const REAL_DATA_INTEGRATION_GUIDE = `
// Integración con datos reales completada:

1. **Hook useCompactWorkspace:**
   - Conecta con Supabase para datos reales
   - Usa useNotifications existente
   - Transforma artists → projects
   - Simula team members + usuario actual
   - Suscripciones en tiempo real

2. **Funcionalidades implementadas:**
   - markNotificationAsRead() - Marca notificaciones como leídas
   - toggleProjectFavorite() - Favoritos de proyectos
   - createProject() - Crear nuevos proyectos
   - refreshData() - Recargar datos manualmente

3. **Estados manejados:**
   - isLoading - Estado de carga inicial
   - error - Manejo de errores
   - Datos en tiempo real con suscripciones

4. **Uso en Dashboard:**
   - Reemplaza datos mock con datos reales
   - Error handling integrado
   - Loading states
   - Interacciones funcionales

¡El widget ahora funciona completamente con datos reales de Supabase!
`
