'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'archived' | 'deleted'
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
  members: TeamMember[]
  tasks: Task[]
  artistId?: string // Link to artists table
  genre?: string
  profileImage?: string
}

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'in_review' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee?: TeamMember
  dueDate?: Date
  createdAt: Date
  projectId: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'member'
  isOnline: boolean
  lastSeen?: Date
}

export function useTeamWorkspaceReal() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch team members from Supabase
  const fetchTeamMembers = useCallback(async () => {
    try {
      // Get current user first
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('No user found')
        setTeamMembers([])
        setCurrentUser(null)
        return
      }

      // Try team_members table first, fallback to profiles
      let data, error
      
      const teamMembersResult = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (teamMembersResult.error) {
        console.log('team_members table not found, using profiles')
        // Fallback to profiles table
        const profilesResult = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
        
        data = profilesResult.data
        error = profilesResult.error
      } else {
        data = teamMembersResult.data
        error = teamMembersResult.error
      }

      if (error) {
        console.error('Error fetching team members:', error)
        // Create a default member from current user
        const defaultMember: TeamMember = {
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'admin',
          isOnline: true
        }
        setTeamMembers([defaultMember])
        setCurrentUser(defaultMember)
        return
      }

      const members: TeamMember[] = (data || []).map(member => ({
        id: member.id,
        name: member.name || member.full_name || member.email?.split('@')[0] || 'User',
        email: member.email || '',
        avatar: member.avatar || member.avatar_url,
        role: member.role || 'member',
        isOnline: member.is_online || false,
        lastSeen: member.last_seen ? new Date(member.last_seen) : undefined
      }))

      setTeamMembers(members)

      // Set current user
      const current = members.find(m => m.id === user.id)
      if (current) {
        setCurrentUser(current)
      } else {
        // Create current user if not in list
        const currentMember: TeamMember = {
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'admin',
          isOnline: true
        }
        setTeamMembers([currentMember, ...members])
        setCurrentUser(currentMember)
      }
    } catch (err: any) {
      console.error('Error fetching team members:', err)
      // Create a fallback user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const fallbackMember: TeamMember = {
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'admin',
          isOnline: true
        }
        setTeamMembers([fallbackMember])
        setCurrentUser(fallbackMember)
      }
    }
  }, [supabase])

  // Fetch projects from artists table
  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      const projectsData: Project[] = (data || []).map(artist => ({
        id: artist.id,
        name: artist.name,
        description: artist.bio || `${artist.genre} artist from ${artist.country}`,
        status: 'active' as const,
        isFavorite: false,
        createdAt: new Date(artist.created_at),
        updatedAt: new Date(artist.updated_at),
        members: [], // Will be populated with team members
        tasks: [], // Will be populated with tasks
        artistId: artist.id,
        genre: artist.genre,
        profileImage: artist.profile_image
      }))

      setProjects(projectsData)
    } catch (err: any) {
      console.error('Error fetching projects:', err)
    }
  }, [supabase])

  // Fetch tasks from a tasks table (we'll create this)
  const fetchTasks = useCallback(async () => {
    try {
      // Check if tasks table exists
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Table might not exist yet, use empty array
        console.log('Tasks table not found, using empty array')
        setTasks([])
        return
      }

      const tasksData: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee_id ? {
          id: task.assignee_id,
          name: '',
          email: '',
          role: 'member' as const,
          isOnline: false
        } : undefined,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        createdAt: new Date(task.created_at),
        projectId: task.project_id
      }))

      setTasks(tasksData)
    } catch (err: any) {
      console.error('Error fetching tasks:', err)
      setTasks([])
    }
  }, [supabase])

  // Load all data
  const fetchWorkspaceData = useCallback(async () => {
    try {
      setIsLoading(true)
      await Promise.all([
        fetchTeamMembers(),
        fetchProjects()
      ])
      // Fetch tasks after team members are loaded
      await fetchTasks()
    } catch (error) {
      console.error('Error fetching workspace data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load workspace data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [fetchTeamMembers, fetchProjects, fetchTasks, toast])

  // Create new task
  const createTask = useCallback(async (projectId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'projectId'>) => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .insert({
          project_id: projectId,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          assignee_id: taskData.assignee?.id,
          due_date: taskData.dueDate?.toISOString()
        })
        .select()
        .single()

      if (error) throw error

      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignee: teamMembers.find(m => m.id === data.assignee_id),
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        createdAt: new Date(data.created_at),
        projectId: data.project_id
      }

      setTasks(prev => [newTask, ...prev])

      toast({
        title: 'Success',
        description: 'Task created successfully'
      })

      return newTask
    } catch (error: any) {
      console.error('Error creating task:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        variant: 'destructive'
      })
      return null
    }
  }, [supabase, teamMembers, toast])

  // Update task
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          assignee_id: updates.assignee?.id,
          due_date: updates.dueDate?.toISOString()
        })
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      )

      toast({
        title: 'Success',
        description: 'Task updated successfully'
      })
    } catch (error: any) {
      console.error('Error updating task:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task',
        variant: 'destructive'
      })
    }
  }, [supabase, toast])

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== taskId))

      toast({
        title: 'Success',
        description: 'Task deleted successfully'
      })
    } catch (error: any) {
      console.error('Error deleting task:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete task',
        variant: 'destructive'
      })
    }
  }, [supabase, toast])

  // Toggle project favorite
  const toggleFavorite = useCallback(async (projectId: string) => {
    try {
      // For now, just update local state
      // In production, you'd save this to a user_favorites table
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? { ...project, isFavorite: !project.isFavorite }
            : project
        )
      )
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }, [])

  // Update project status
  const updateProjectStatus = useCallback(async (projectId: string, status: Project['status']) => {
    try {
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? { ...project, status, updatedAt: new Date() }
            : project
        )
      )

      toast({
        title: 'Success',
        description: 'Project status updated'
      })
    } catch (error: any) {
      console.error('Error updating project status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive'
      })
    }
  }, [toast])

  // Enrich tasks with team member data
  useEffect(() => {
    if (teamMembers.length > 0 && tasks.length > 0) {
      setTasks(prevTasks => {
        let hasChanges = false
        const enrichedTasks = prevTasks.map(task => {
          if (task.assignee?.id && !task.assignee.name) {
            const member = teamMembers.find(m => m.id === task.assignee?.id)
            if (member) {
              hasChanges = true
              return { ...task, assignee: member }
            }
          }
          return task
        })
        return hasChanges ? enrichedTasks : prevTasks
      })
    }
  }, [teamMembers.length, tasks.length])

  // Combine projects with their tasks
  const projectsWithTasks = projects.map(project => ({
    ...project,
    tasks: tasks.filter(task => task.projectId === project.id),
    members: teamMembers // All team members can see all projects
  }))

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('workspace_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks'
        },
        () => {
          fetchTasks()
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artists'
        },
        () => {
          fetchProjects()
        }
      )
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
  }, [supabase, fetchTasks, fetchProjects, fetchTeamMembers])

  // Load data on mount
  useEffect(() => {
    fetchWorkspaceData()
  }, [fetchWorkspaceData])

  return {
    projects: projectsWithTasks,
    teamMembers,
    currentUser,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleFavorite,
    updateProjectStatus,
    refetch: fetchWorkspaceData
  }
}
