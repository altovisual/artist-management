'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useNotifications } from './use-notifications'
import { useRealTeam } from './use-real-team'

// Interfaces para datos reales
interface RealNotification {
  id: string
  title: string
  type: 'artist' | 'project' | 'payment' | 'deadline'
  timestamp: Date
  isRead: boolean
  priority: 'high' | 'medium' | 'low'
  actionUrl?: string
}

interface RealProject {
  id: string
  name: string
  description: string
  tasksCount: number
  status: 'active' | 'completed'
  isFavorite: boolean
  updatedAt: Date
  createdAt: Date
}

interface RealTeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  role: string
  lastSeen?: Date
}

export function useCompactWorkspace() {
  const [projects, setProjects] = useState<RealProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  
  // Usar el hook de notificaciones existente
  const { 
    notifications: rawNotifications, 
    markAsRead: originalMarkAsRead 
  } = useNotifications()

  // Usar el hook real del equipo
  const {
    teamMembers,
    currentUser,
    teamStats,
    isLoading: teamLoading,
    error: teamError,
    updateMemberOnlineStatus,
    updateMemberRole,
    inviteMember,
    removeMember,
    refreshTeamData
  } = useRealTeam()

  // Transformar notificaciones al formato compacto
  const notifications: RealNotification[] = rawNotifications.map(n => ({
    id: n.id,
    title: n.title,
    type: n.type === 'artist_created' ? 'artist' :
          n.type === 'project_added' ? 'project' :
          n.type === 'payment_received' ? 'payment' :
          'deadline',
    timestamp: n.timestamp,
    isRead: n.isRead,
    priority: n.priority,
    actionUrl: n.actionUrl
  }))

  // Función para marcar notificación como leída
  const markNotificationAsRead = (notificationId: string) => {
    if (originalMarkAsRead) {
      originalMarkAsRead(notificationId)
    }
  }

  // Obtener proyectos reales
  const fetchProjects = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Obtener proyectos desde la tabla artists (como proyectos)
      const { data: artistsData, error: artistsError } = await supabase
        .from('artists')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (artistsError) throw artistsError

      // Transformar artists a projects
      const projectsData: RealProject[] = artistsData?.map(artist => ({
        id: artist.id,
        name: artist.name || 'Unnamed Project',
        description: artist.bio || 'No description',
        tasksCount: Math.floor(Math.random() * 10) + 1, // Simulado por ahora
        status: 'active' as const,
        isFavorite: false, // Por ahora simulado
        updatedAt: new Date(artist.updated_at),
        createdAt: new Date(artist.created_at)
      })) || []

      setProjects(projectsData)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects')
    }
  }, [supabase])

  // Combinar estados de carga
  const combinedLoading = isLoading || teamLoading
  const combinedError = error || teamError

  // Marcar proyecto como favorito
  const toggleProjectFavorite = async (projectId: string) => {
    try {
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, isFavorite: !project.isFavorite }
          : project
      ))

      // Aquí podrías guardar en la base de datos
      // await supabase.from('project_favorites').upsert({ project_id: projectId, user_id: currentUser?.id })
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }

  // Crear nuevo proyecto
  const createProject = async (name: string, description: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Crear como artist por ahora
      const { data, error } = await supabase
        .from('artists')
        .insert({
          name,
          bio: description,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      const newProject: RealProject = {
        id: data.id,
        name: data.name,
        description: data.bio || '',
        tasksCount: 0,
        status: 'active',
        isFavorite: false,
        updatedAt: new Date(data.updated_at),
        createdAt: new Date(data.created_at)
      }

      setProjects(prev => [newProject, ...prev])
      return newProject
    } catch (err) {
      console.error('Error creating project:', err)
      throw err
    }
  }

  // Efecto inicial
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await fetchProjects()
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      
      // Suscribirse a cambios en artists (proyectos)
      const artistsSubscription = supabase
        .channel('artists-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'artists' },
          (payload) => {
            console.log('Artists change received:', payload)
            fetchProjects() // Recargar proyectos
          }
        )
        .subscribe()

      return artistsSubscription
    }

    let subscription: any = null
    
    setupSubscriptions().then(sub => {
      subscription = sub
    }).catch(err => {
      console.error('Error setting up subscriptions:', err)
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [fetchProjects])

  return {
    // Datos
    notifications,
    projects,
    teamMembers,
    currentUser,
    teamStats,
    
    // Estados
    isLoading: combinedLoading,
    error: combinedError,
    
    // Acciones de notificaciones
    markNotificationAsRead,
    
    // Acciones de proyectos
    toggleProjectFavorite,
    createProject,
    
    // Acciones de equipo
    updateMemberOnlineStatus,
    updateMemberRole,
    inviteMember,
    removeMember,
    
    // Refresh data
    refreshData: () => {
      fetchProjects()
      refreshTeamData()
    }
  }
}
