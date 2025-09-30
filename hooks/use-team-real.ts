'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'member'
  isOnline: boolean
  lastSeen?: Date
  joinedAt: Date
}

export interface AvailableUser {
  id: string
  email: string
  name: string
  avatar?: string
  is_team_member: boolean
}

export function useTeamReal() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([])
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Obtener miembros del equipo
  const fetchTeamMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const members: TeamMember[] = (data || []).map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        role: member.role,
        isOnline: member.is_online || false,
        lastSeen: member.last_seen ? new Date(member.last_seen) : undefined,
        joinedAt: new Date(member.joined_at)
      }))

      setTeamMembers(members)

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const current = members.find(m => m.id === user.id)
        setCurrentUser(current || null)
      }
    } catch (err: any) {
      console.error('Error fetching team members:', err)
      setError(err.message)
    }
  }, [supabase])

  // Obtener usuarios disponibles para agregar
  const fetchAvailableUsers = useCallback(async () => {
    try {
      // Intentar con RPC primero
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_available_users')

      if (!rpcError && rpcData) {
        setAvailableUsers(rpcData)
        return
      }

      console.warn('RPC failed, using fallback method:', rpcError)
      
      // Fallback: obtener solo team members existentes
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('id, email, name, avatar')

      if (membersError) throw membersError

      // Mapear a formato AvailableUser
      const users: AvailableUser[] = (membersData || []).map(member => ({
        id: member.id,
        email: member.email,
        name: member.name,
        avatar: member.avatar || undefined,
        is_team_member: true
      }))

      setAvailableUsers(users)
    } catch (err: any) {
      console.error('Error fetching available users:', err)
      // Fallback a array vacío si todo falla
      setAvailableUsers([])
    }
  }, [supabase])

  // Agregar miembro al equipo
  const addTeamMember = async (email: string, role: 'admin' | 'manager' | 'member' = 'member') => {
    try {
      const { data, error } = await supabase
        .rpc('add_team_member', {
          user_email: email,
          member_role: role
        })

      if (error) throw error

      // Recargar miembros
      await fetchTeamMembers()
      await fetchAvailableUsers()

      return { success: true, userId: data }
    } catch (err: any) {
      console.error('Error adding team member:', err)
      return { success: false, error: err.message }
    }
  }

  // Actualizar rol de miembro
  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'manager' | 'member') => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) throw error

      // Actualizar estado local
      setTeamMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      )

      return { success: true }
    } catch (err: any) {
      console.error('Error updating member role:', err)
      return { success: false, error: err.message }
    }
  }

  // Remover miembro del equipo
  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      // Actualizar estado local
      setTeamMembers(prev => prev.filter(member => member.id !== memberId))

      return { success: true }
    } catch (err: any) {
      console.error('Error removing member:', err)
      return { success: false, error: err.message }
    }
  }

  // Actualizar estado online
  const updateOnlineStatus = async (isOnline: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('team_members')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
    } catch (err: any) {
      console.error('Error updating online status:', err)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchTeamMembers(),
          fetchAvailableUsers()
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [fetchTeamMembers, fetchAvailableUsers])

  // Actualizar estado online al montar/desmontar
  useEffect(() => {
    updateOnlineStatus(true)

    return () => {
      updateOnlineStatus(false)
    }
  }, [])

  // Suscripción en tiempo real a cambios
  useEffect(() => {
    const channel = supabase
      .channel('team_members_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members'
        },
        () => {
          fetchTeamMembers()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, fetchTeamMembers])

  return {
    teamMembers,
    availableUsers,
    currentUser,
    isLoading,
    error,
    addTeamMember,
    updateMemberRole,
    removeMember,
    refreshTeamMembers: fetchTeamMembers,
    refreshAvailableUsers: fetchAvailableUsers
  }
}
