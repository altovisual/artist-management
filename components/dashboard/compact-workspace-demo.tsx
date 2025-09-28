'use client'

import { CompactWorkspaceWidget, compactMockData } from './compact-workspace-widget'

/**
 * Demo del CompactWorkspaceWidget - Estilo iPhone
 * 
 * Características implementadas:
 * ✅ Diseño compacto y fluido como widget de iPhone
 * ✅ Animaciones suaves entre vistas
 * ✅ 4 vistas: Overview, Notifications, Projects, Team
 * ✅ Quick stats con hover effects
 * ✅ Navegación intuitiva con botones Back
 * ✅ Gradientes y efectos visuales modernos
 * ✅ Responsive y touch-friendly
 * ✅ Performance optimizado
 * ✅ Emojis para mejor UX
 * ✅ Estados online/offline en tiempo real
 * ✅ Prioridades visuales con colores
 * ✅ Navegación automática
 */
export function CompactWorkspaceDemo() {
  const handleNotificationClick = (notification: any) => {
    console.log('📱 Notification tapped:', notification.title)
    // Aquí se navegaría automáticamente
  }

  const handleProjectClick = (project: any) => {
    console.log('📁 Project tapped:', project.name)
    // Aquí se abriría el proyecto
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">📱 Compact Workspace Widget</h2>
        <p className="text-muted-foreground mb-4">
          Estilo iPhone - Compacto, fluido y de alto rendimiento
        </p>
        
        <div className="flex flex-wrap gap-2 justify-center text-xs">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Animaciones suaves</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Touch-friendly</span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">Performance optimizado</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full">Navegación intuitiva</span>
        </div>
      </div>
      
      <div className="w-full max-w-sm">
        <CompactWorkspaceWidget
          notifications={compactMockData.notifications}
          projects={compactMockData.projects}
          teamMembers={[
            {
              id: '1',
              name: 'John Smith',
              email: 'john@example.com',
              avatar: undefined,
              isOnline: true,
              role: 'admin',
              createdAt: new Date()
            },
            {
              id: '2',
              name: 'Sarah Johnson',
              email: 'sarah@example.com',
              avatar: undefined,
              isOnline: true,
              role: 'manager',
              createdAt: new Date()
            },
            {
              id: '3',
              name: 'Emily Davis',
              email: 'emily@example.com',
              avatar: undefined,
              isOnline: true,
              role: 'member',
              createdAt: new Date()
            },
            {
              id: '4',
              name: 'Mike Wilson',
              email: 'mike@example.com',
              avatar: undefined,
              isOnline: false,
              role: 'member',
              createdAt: new Date()
            }
          ]}
        />
      </div>

      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p className="mb-2">
          <strong>Funcionalidades:</strong>
        </p>
        <ul className="text-left space-y-1">
          <li>• Tap en stats para cambiar de vista</li>
          <li>• Animaciones fluidas entre secciones</li>
          <li>• Navegación automática al hacer tap</li>
          <li>• Estados online en tiempo real</li>
          <li>• Prioridades visuales con colores</li>
          <li>• Botón &quot;Back&quot; para regresar</li>
          <li>• Scroll suave en listas largas</li>
          <li>• Hover effects y micro-interacción</li>
          <li>• Vista de equipo con miembros online/offline</li>
          <li>• Hover effects y micro-interacciones</li>
        </ul>
      </div>
    </div>
  )
}

// Guía de uso del componente
export const COMPACT_WORKSPACE_USAGE = `
// Uso básico del CompactWorkspaceWidget

import { CompactWorkspaceWidget } from '@/components/dashboard/compact-workspace-widget'

function MyDashboard() {
  return (
    <CompactWorkspaceWidget
      notifications={notifications}
      projects={projects}
      teamMembers={teamMembers}
      onNotificationClick={(notification) => {
        // Navegar automáticamente
        router.push(notification.actionUrl)
      }}
      onProjectClick={(project) => {
        // Abrir proyecto
        setSelectedProject(project)
      }}
      className="w-full max-w-sm" // Opcional
    />
  )
}

// Características del componente:
// - Tamaño compacto (max-w-sm)
// - 4 vistas: Overview, Notifications, Projects, Team
// - Animaciones suaves (150ms transitions)
// - Touch-friendly (hover effects)
// - Performance optimizado (memoización)
// - Navegación intuitiva (back buttons)
// - Estados visuales claros
// - Responsive design
`
