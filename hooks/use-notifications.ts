'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface NotificationItem {
  id: string
  type: 'artist_created' | 'project_added' | 'contract_signed' | 'release_scheduled' | 'payment_received' | 'deadline_approaching'
  title: string
  description: string
  timestamp: Date
  isRead: boolean
  priority: 'low' | 'medium' | 'high'
  user?: {
    name: string
    avatar?: string
  }
  metadata?: {
    artistName?: string
    projectName?: string
    contractType?: string
    amount?: number
  }
  actionUrl?: string
}

// Función para generar URLs dinámicamente basadas en el tipo de notificación
const generateActionUrl = (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'actionUrl'>): string => {
  switch (notification.type) {
    case 'artist_created':
      // Buscar el ID del artista por nombre (en producción sería desde la base de datos)
      const artistId = notification.metadata?.artistName === 'samuelito' ? '1' :
                      notification.metadata?.artistName === 'marval' ? '3' :
                      notification.metadata?.artistName === 'Borngud' ? '4' : '1'
      return `/artists/${artistId}`
    
    case 'project_added':
      return `/management/projects`
    
    case 'contract_signed':
      return `/management/contracts`
    
    case 'release_scheduled':
      return `/releases`
    
    case 'payment_received':
      return `/finance/payments`
    
    case 'deadline_approaching':
      return `/management/contracts`
    
    default:
      return '/dashboard'
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  // Cargar notificaciones iniciales
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Aquí puedes implementar la lógica para cargar desde Supabase
      // Por ahora, usamos datos de ejemplo
      const mockNotifications: NotificationItem[] = [
        {
          id: '1',
          type: 'artist_created',
          title: 'New artist profile created',
          description: 'samuelito profile has been successfully created',
          timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
          isRead: false,
          priority: 'medium',
          user: { name: 'User', avatar: undefined },
          metadata: { artistName: 'samuelito' },
          actionUrl: '/artists/1' // URL del perfil del artista
        },
        {
          id: '2',
          type: 'project_added',
          title: 'New project started',
          description: 'sesion2 project started',
          timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 hours ago
          isRead: false,
          priority: 'high',
          user: { name: 'User', avatar: undefined },
          metadata: { artistName: 'Borngud', projectName: 'sesion2' },
          actionUrl: '/management/projects/2' // URL del proyecto
        },
        {
          id: '3',
          type: 'artist_created',
          title: 'New artist profile created',
          description: 'marval profile has been successfully created',
          timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
          isRead: true,
          priority: 'low',
          user: { name: 'User', avatar: undefined },
          metadata: { artistName: 'marval' },
          actionUrl: '/artists/3' // URL del perfil del artista
        },
        {
          id: '4',
          type: 'artist_created',
          title: 'New artist profile created',
          description: 'Borngud profile has been successfully created',
          timestamp: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), // 23 days ago
          isRead: true,
          priority: 'low',
          user: { name: 'User', avatar: undefined },
          metadata: { artistName: 'Borngud' },
          actionUrl: '/artists/4' // URL del perfil del artista
        },
        {
          id: '5',
          type: 'payment_received',
          title: 'Payment received',
          description: 'Royalty payment processed successfully',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          isRead: false,
          priority: 'high',
          user: { name: 'System', avatar: undefined },
          metadata: { amount: 2500, artistName: 'samuelito' },
          actionUrl: '/finance/payments' // URL de la sección de pagos
        },
        {
          id: '6',
          type: 'deadline_approaching',
          title: 'Contract deadline approaching',
          description: 'Recording contract expires in 7 days',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          isRead: false,
          priority: 'high',
          user: { name: 'System', avatar: undefined },
          metadata: { artistName: 'marval', contractType: 'Recording' },
          actionUrl: '/management/contracts' // URL de la sección de contratos
        }
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Marcar como leída
  const markAsRead = useCallback(async (id: string) => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true }
            : notification
        )
      )

      // Aquí implementarías la actualización en Supabase
      // await supabase.from('notifications').update({ is_read: true }).eq('id', id)

      toast({
        title: 'Success',
        description: 'Notification marked as read'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      })
    }
  }, [toast])

  // Marcar como no leída
  const markAsUnread = useCallback(async (id: string) => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: false }
            : notification
        )
      )

      // Aquí implementarías la actualización en Supabase
      // await supabase.from('notifications').update({ is_read: false }).eq('id', id)

      toast({
        title: 'Success',
        description: 'Notification marked as unread'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as unread',
        variant: 'destructive'
      })
    }
  }, [toast])

  // Eliminar notificación
  const deleteNotification = useCallback(async (id: string) => {
    try {
      setNotifications(prev => prev.filter(notification => notification.id !== id))

      // Aquí implementarías la eliminación en Supabase
      // await supabase.from('notifications').delete().eq('id', id)

      toast({
        title: 'Success',
        description: 'Notification deleted'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      })
    }
  }, [toast])

  // Acciones en lote
  const bulkAction = useCallback(async (ids: string[], action: 'read' | 'unread' | 'delete') => {
    try {
      switch (action) {
        case 'read':
          setNotifications(prev => 
            prev.map(notification => 
              ids.includes(notification.id) 
                ? { ...notification, isRead: true }
                : notification
            )
          )
          break
        case 'unread':
          setNotifications(prev => 
            prev.map(notification => 
              ids.includes(notification.id) 
                ? { ...notification, isRead: false }
                : notification
            )
          )
          break
        case 'delete':
          setNotifications(prev => 
            prev.filter(notification => !ids.includes(notification.id))
          )
          break
      }

      // Aquí implementarías las actualizaciones en lote en Supabase
      // switch (action) {
      //   case 'read':
      //   case 'unread':
      //     await supabase.from('notifications')
      //       .update({ is_read: action === 'read' })
      //       .in('id', ids)
      //     break
      //   case 'delete':
      //     await supabase.from('notifications')
      //       .delete()
      //       .in('id', ids)
      //     break
      // }

      toast({
        title: 'Success',
        description: `${ids.length} notifications ${action === 'delete' ? 'deleted' : `marked as ${action}`}`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} notifications`,
        variant: 'destructive'
      })
    }
  }, [toast])

  // Agregar nueva notificación
  const addNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Estadísticas
  const unreadCount = notifications.filter(n => !n.isRead).length
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.isRead).length

  return {
    notifications,
    isLoading,
    unreadCount,
    highPriorityCount,
    markAsRead,
    markAsUnread,
    deleteNotification,
    bulkAction,
    addNotification,
    refetch: fetchNotifications
  }
}
