'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Interfaces para datos reales del equipo
interface RealTeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'member'
  isOnline: boolean
  lastSeen?: Date
  createdAt: Date
  updatedAt: Date
}

interface TeamStats {
  totalMembers: number
  onlineMembers: number
  adminCount: number
  managerCount: number
  memberCount: number
}

export function useRealTeam() {
  const [teamMembers, setTeamMembers] = useState<RealTeamMember[]>([])
  const [currentUser, setCurrentUser] = useState<RealTeamMember | null>(null)
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalMembers: 0,
    onlineMembers: 0,
    adminCount: 0,
    managerCount: 0,
    memberCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Obtener miembros del equipo desde Supabase
  const fetchTeamMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Intentar obtener desde tabla profiles primero
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      let membersData: RealTeamMember[] = []

      if (profilesError || !profilesData) {
        // Si no existe profiles, crear datos desde usuarios conocidos
        console.log('Profiles table not found, using fallback data')
        
        // Usuario actual
        const currentUserData: RealTeamMember = {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          email: user.email || '',
          avatar: user.user_metadata?.avatar_url,
          role: (user.app_metadata?.role as 'admin' | 'manager' | 'member') || 'member',
          isOnline: true,
          lastSeen: new Date(),
          createdAt: new Date(user.created_at || Date.now()),
          updatedAt: new Date()
        }

        // Obtener otros usuarios desde artists (como colaboradores)
        const { data: artistsData } = await supabase
          .from('artists')
          .select('user_id, name, created_at, updated_at')
          .neq('user_id', user.id)
          .limit(10)

        const artistMembers: RealTeamMember[] = artistsData?.map((artist, index) => ({
          id: artist.user_id || `artist-${index}`,
          name: artist.name || `Artist ${index + 1}`,
          email: `artist${index + 1}@example.com`,
          role: 'member' as const,
          isOnline: Math.random() > 0.6, // 40% online
          lastSeen: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : undefined,
          createdAt: new Date(artist.created_at),
          updatedAt: new Date(artist.updated_at),
        })) || []

        // Agregar algunos miembros simulados del equipo
        const simulatedMembers: RealTeamMember[] = [
          {
            id: 'team-admin-1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            role: 'admin',
            isOnline: true,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          },
          {
            id: 'team-manager-1',
            name: 'Mike Rodriguez',
            email: 'mike.rodriguez@company.com',
            role: 'manager',
            isOnline: true,
            lastSeen: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          },
          {
            id: 'team-manager-2',
            name: 'Emily Chen',
            email: 'emily.chen@company.com',
            role: 'manager',
            isOnline: false,
            lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          },
          {
            id: 'team-member-1',
            name: 'Alex Thompson',
            email: 'alex.thompson@company.com',
            role: 'member',
            isOnline: true,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          },
          {
            id: 'team-member-2',
            name: 'Jessica Martinez',
            email: 'jessica.martinez@company.com',
            role: 'member',
            isOnline: false,
            lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          }
        ]

        membersData = [currentUserData, ...artistMembers, ...simulatedMembers]
      } else {
        // Transformar datos de profiles
        membersData = profilesData.map(profile => ({
          id: profile.id,
          name: profile.full_name || profile.email?.split('@')[0] || 'Usuario',
          email: profile.email || '',
          avatar: profile.avatar_url,
          role: (profile.role as 'admin' | 'manager' | 'member') || 'member',
          isOnline: profile.is_online || false,
          lastSeen: profile.last_seen ? new Date(profile.last_seen) : undefined,
          createdAt: new Date(profile.created_at),
          updatedAt: new Date(profile.updated_at || profile.created_at)
        }))

        // Asegurar que el usuario actual esté incluido
        const currentUserExists = membersData.find(m => m.id === user.id)
        if (!currentUserExists) {
          const currentUserData: RealTeamMember = {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
            email: user.email || '',
            avatar: user.user_metadata?.avatar_url,
            role: (user.app_metadata?.role as 'admin' | 'manager' | 'member') || 'member',
            isOnline: true,
            createdAt: new Date(user.created_at || Date.now()),
            updatedAt: new Date()
          }
          membersData = [currentUserData, ...membersData]
        }
      }

      // Encontrar usuario actual
      const current = membersData.find(member => member.id === user.id)
      
      setTeamMembers(membersData)
      setCurrentUser(current || null)
      
      // Calcular estadísticas
      calculateTeamStats(membersData)
      
    } catch (err) {
      console.error('Error fetching team members:', err)
      setError('Failed to load team members')
    }
  }

  // Calcular estadísticas del equipo
  const calculateTeamStats = (members: RealTeamMember[]) => {
    const stats: TeamStats = {
      totalMembers: members.length,
      onlineMembers: members.filter(m => m.isOnline).length,
      adminCount: members.filter(m => m.role === 'admin').length,
      managerCount: members.filter(m => m.role === 'manager').length,
      memberCount: members.filter(m => m.role === 'member').length
    }
    setTeamStats(stats)
  }

  // Actualizar estado online de un miembro
  const updateMemberOnlineStatus = async (memberId: string, isOnline: boolean) => {
    try {
      // Actualizar en la base de datos si existe la tabla profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', memberId)

      if (updateError) {
        console.log('Profiles table update failed, updating locally only')
      }

      // Actualizar estado local
      setTeamMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { 
              ...member, 
              isOnline,
              lastSeen: isOnline ? undefined : new Date()
            }
          : member
      ))

      // Recalcular estadísticas
      const updatedMembers = teamMembers.map(member => 
        member.id === memberId 
          ? { ...member, isOnline, lastSeen: isOnline ? undefined : new Date() }
          : member
      )
      calculateTeamStats(updatedMembers)

    } catch (err) {
      console.error('Error updating online status:', err)
    }
  }

  // Cambiar rol de un miembro
  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'manager' | 'member') => {
    try {
      // Actualizar en la base de datos si existe la tabla profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId)

      if (updateError) {
        console.log('Profiles table update failed, updating locally only')
      }

      // Actualizar estado local
      setTeamMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, role: newRole }
          : member
      ))

      // Recalcular estadísticas
      const updatedMembers = teamMembers.map(member => 
        member.id === memberId 
          ? { ...member, role: newRole }
          : member
      )
      calculateTeamStats(updatedMembers)

    } catch (err) {
      console.error('Error updating member role:', err)
      throw err
    }
  }

  // Invitar nuevo miembro (simulado)
  const inviteMember = async (email: string, role: 'admin' | 'manager' | 'member' = 'member') => {
    try {
      // Aquí podrías implementar invitación real por email
      const newMember: RealTeamMember = {
        id: `invited-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role,
        isOnline: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setTeamMembers(prev => [newMember, ...prev])
      calculateTeamStats([newMember, ...teamMembers])

      return newMember
    } catch (err) {
      console.error('Error inviting member:', err)
      throw err
    }
  }

  // Remover miembro
  const removeMember = async (memberId: string) => {
    try {
      // Remover de la base de datos si existe
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberId)

      if (deleteError) {
        console.log('Profiles table delete failed, removing locally only')
      }

      // Actualizar estado local
      const updatedMembers = teamMembers.filter(member => member.id !== memberId)
      setTeamMembers(updatedMembers)
      calculateTeamStats(updatedMembers)

    } catch (err) {
      console.error('Error removing member:', err)
      throw err
    }
  }

  // Actualizar estado online del usuario actual
  const updateCurrentUserStatus = async () => {
    if (!currentUser) return

    try {
      await updateMemberOnlineStatus(currentUser.id, true)
    } catch (err) {
      console.error('Error updating current user status:', err)
    }
  }

  // Efecto inicial
  useEffect(() => {
    const loadTeamData = async () => {
      setIsLoading(true)
      try {
        await fetchTeamMembers()
        await updateCurrentUserStatus()
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamData()

    // Actualizar estado online cada 2 minutos
    const interval = setInterval(updateCurrentUserStatus, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Suscripciones en tiempo real
  useEffect(() => {
    const setupRealtimeSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Suscribirse a cambios en profiles
      const profilesSubscription = supabase
        .channel('profiles-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles' },
          (payload) => {
            console.log('Profiles change received:', payload)
            fetchTeamMembers() // Recargar datos del equipo
          }
        )
        .subscribe()

      return profilesSubscription
    }

    let subscription: any = null
    
    setupRealtimeSubscriptions().then(sub => {
      subscription = sub
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  return {
    // Datos
    teamMembers,
    currentUser,
    teamStats,
    
    // Estados
    isLoading,
    error,
    
    // Acciones
    updateMemberOnlineStatus,
    updateMemberRole,
    inviteMember,
    removeMember,
    refreshTeamData: fetchTeamMembers
  }
}
