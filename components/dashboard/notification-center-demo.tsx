'use client'

import { NotificationCenter } from './notification-center'
import { useNotifications } from '@/hooks/use-notifications'

export function NotificationCenterDemo() {
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAsUnread,
    deleteNotification,
    bulkAction
  } = useNotifications()

  const handleNotificationClick = (notification: any) => {
    // Marcar como leída automáticamente al hacer click
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    // Navegación opcional basada en el tipo de notificación
    switch (notification.type) {
      case 'artist_created':
        // Navegar al perfil del artista
        if (notification.metadata?.artistName) {
          console.log(`Navigate to artist: ${notification.metadata.artistName}`)
        }
        break
      case 'project_added':
        // Navegar al proyecto
        if (notification.metadata?.projectName) {
          console.log(`Navigate to project: ${notification.metadata.projectName}`)
        }
        break
      case 'payment_received':
        // Navegar a la sección de pagos
        console.log('Navigate to payments section')
        break
      default:
        console.log('Default notification action')
    }
  }

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-96 rounded-lg" />
  }

  return (
    <NotificationCenter
      notifications={notifications}
      onMarkAsRead={markAsRead}
      onMarkAsUnread={markAsUnread}
      onDelete={deleteNotification}
      onBulkAction={bulkAction}
      onNotificationClick={handleNotificationClick}
      className="w-full max-w-2xl"
    />
  )
}
