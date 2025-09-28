'use client'

import { NotificationCenter } from './notification-center'
import { useNotifications } from '@/hooks/use-notifications'

/**
 * Ejemplo de uso del NotificationCenter con navegación automática
 * 
 * Características implementadas:
 * - Click en notificación → Marca como leída automáticamente
 * - Click en notificación → Navega a la URL correspondiente
 * - Hover → Muestra ícono de enlace externo
 * - URLs dinámicas basadas en el tipo de notificación:
 *   - artist_created → /artists/{id}
 *   - project_added → /management/projects
 *   - payment_received → /finance/payments
 *   - deadline_approaching → /management/contracts
 *   - contract_signed → /management/contracts
 *   - release_scheduled → /releases
 */
export function NotificationExample() {
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAsUnread,
    deleteNotification,
    bulkAction
  } = useNotifications()

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notification Center</h2>
        {unreadCount > 0 && (
          <span className="text-sm text-muted-foreground">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <NotificationCenter
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAsUnread={markAsUnread}
        onDelete={deleteNotification}
        onBulkAction={bulkAction}
        onNotificationClick={(notification) => {
          // Opcional: Analytics o logging
          console.log('Navigating to:', notification.actionUrl)
          
          // Opcional: Tracking personalizado
          // Aquí puedes agregar tu sistema de analytics preferido
        }}
        className="w-full"
      />
    </div>
  )
}

// Tipos de notificaciones y sus destinos:
export const NOTIFICATION_ROUTES = {
  artist_created: (artistId: string) => `/artists/${artistId}`,
  project_added: () => `/management/projects`,
  contract_signed: () => `/management/contracts`,
  release_scheduled: () => `/releases`,
  payment_received: () => `/finance/payments`,
  deadline_approaching: () => `/management/contracts`
} as const
