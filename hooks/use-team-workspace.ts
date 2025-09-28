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

export function useTeamWorkspace() {
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  // Datos de ejemplo para demostración
  const mockTeamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      avatar: undefined,
      role: 'admin',
      isOnline: true,
      lastSeen: new Date()
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: undefined,
      role: 'manager',
      isOnline: true,
      lastSeen: new Date()
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike@example.com',
      avatar: undefined,
      role: 'member',
      isOnline: false,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily@example.com',
      avatar: undefined,
      role: 'member',
      isOnline: true,
      lastSeen: new Date()
    },
    {
      id: '5',
      name: 'Alex Rodriguez',
      email: 'alex@example.com',
      avatar: undefined,
      role: 'manager',
      isOnline: false,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    }
  ]

  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'John - SaaS Website',
      description: 'Complete redesign of the SaaS platform website',
      status: 'active',
      isFavorite: true,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date(),
      members: [mockTeamMembers[0], mockTeamMembers[1], mockTeamMembers[3]],
      tasks: [
        {
          id: '1',
          title: 'Web Development',
          description: 'Develop the main website structure and components',
          status: 'in_progress',
          priority: 'high',
          assignee: mockTeamMembers[0],
          createdAt: new Date('2024-01-08')
        },
        {
          id: '2',
          title: 'Landing Page Animation',
          description: 'Create smooth animations for the landing page',
          status: 'todo',
          priority: 'medium',
          assignee: mockTeamMembers[3],
          createdAt: new Date('2024-01-09')
        },
        {
          id: '3',
          title: 'A/B Testing',
          description: 'Set up A/B testing for conversion optimization',
          status: 'in_review',
          priority: 'medium',
          assignee: mockTeamMembers[1],
          createdAt: new Date('2024-01-10')
        },
        {
          id: '4',
          title: 'Meeting with Client',
          description: 'Present the final design to the client',
          status: 'completed',
          priority: 'high',
          assignee: mockTeamMembers[1],
          createdAt: new Date('2024-01-05')
        }
      ]
    },
    {
      id: '2',
      name: 'Metrica - CRM Web App',
      description: 'Customer relationship management web application',
      status: 'active',
      isFavorite: false,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      members: [mockTeamMembers[1], mockTeamMembers[2], mockTeamMembers[4]],
      tasks: [
        {
          id: '5',
          title: 'Database Design',
          description: 'Design the database schema for customer data',
          status: 'completed',
          priority: 'high',
          assignee: mockTeamMembers[2],
          createdAt: new Date('2024-01-05')
        },
        {
          id: '6',
          title: 'API Development',
          description: 'Build REST API endpoints for CRM functionality',
          status: 'in_progress',
          priority: 'high',
          assignee: mockTeamMembers[4],
          createdAt: new Date('2024-01-06')
        }
      ]
    },
    {
      id: '3',
      name: 'Stylee - Fashion Landing Page',
      description: 'Modern fashion e-commerce landing page',
      status: 'active',
      isFavorite: true,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      members: [mockTeamMembers[0], mockTeamMembers[3]],
      tasks: [
        {
          id: '7',
          title: 'UI/UX Design',
          description: 'Create modern and trendy design for fashion brand',
          status: 'completed',
          priority: 'high',
          assignee: mockTeamMembers[3],
          createdAt: new Date('2024-01-03')
        },
        {
          id: '8',
          title: 'Product Showcase',
          description: 'Implement product gallery and showcase',
          status: 'in_review',
          priority: 'medium',
          assignee: mockTeamMembers[0],
          createdAt: new Date('2024-01-04')
        }
      ]
    },
    {
      id: '4',
      name: 'Frey - Banking Mobile App',
      description: 'Mobile banking application with modern UI',
      status: 'active',
      isFavorite: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      members: [mockTeamMembers[1], mockTeamMembers[2], mockTeamMembers[4]],
      tasks: [
        {
          id: '9',
          title: 'Security Implementation',
          description: 'Implement biometric authentication and security features',
          status: 'in_progress',
          priority: 'high',
          assignee: mockTeamMembers[4],
          createdAt: new Date('2024-01-01')
        },
        {
          id: '10',
          title: 'Transaction History',
          description: 'Build transaction history and analytics',
          status: 'todo',
          priority: 'medium',
          assignee: mockTeamMembers[2],
          createdAt: new Date('2024-01-02')
        }
      ]
    },
    {
      id: '5',
      name: 'Lola - Fintech Landing Page',
      description: 'Landing page for fintech startup',
      status: 'archived',
      isFavorite: false,
      createdAt: new Date('2023-12-15'),
      updatedAt: new Date('2023-12-30'),
      members: [mockTeamMembers[0], mockTeamMembers[1]],
      tasks: []
    },
    {
      id: '6',
      name: 'SaaS Website',
      description: 'Generic SaaS website template',
      status: 'archived',
      isFavorite: true,
      createdAt: new Date('2023-12-10'),
      updatedAt: new Date('2023-12-25'),
      members: [mockTeamMembers[0]],
      tasks: []
    },
    {
      id: '7',
      name: 'Fintech Landing Page',
      description: 'Another fintech landing page project',
      status: 'archived',
      isFavorite: true,
      createdAt: new Date('2023-12-05'),
      updatedAt: new Date('2023-12-20'),
      members: [mockTeamMembers[1], mockTeamMembers[3]],
      tasks: []
    }
  ]

  // Cargar datos iniciales
  const fetchWorkspaceData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // En producción, buscarías el usuario en la base de datos
        setCurrentUser(mockTeamMembers[0]) // Asumimos que es admin por ahora
      }

      // Cargar proyectos y miembros del equipo
      setProjects(mockProjects)
      setTeamMembers(mockTeamMembers)

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
  }, [toast, supabase])

  // Crear nuevo proyecto
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => {
    try {
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        tasks: []
      }

      setProjects(prev => [newProject, ...prev])
      
      toast({
        title: 'Success',
        description: 'Project created successfully'
      })

      return newProject
    } catch (error) {
      console.error('Error creating project:', error)
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive'
      })
      return null
    }
  }, [toast])

  // Actualizar proyecto
  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    try {
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, ...updates, updatedAt: new Date() }
            : project
        )
      )

      toast({
        title: 'Success',
        description: 'Project updated successfully'
      })
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive'
      })
    }
  }, [toast])

  // Crear nueva tarea
  const createTask = useCallback(async (projectId: string, taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date()
      }

      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                tasks: [...project.tasks, newTask],
                updatedAt: new Date()
              }
            : project
        )
      )

      toast({
        title: 'Success',
        description: 'Task created successfully'
      })

      return newTask
    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      })
      return null
    }
  }, [toast])

  // Actualizar tarea
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      setProjects(prev => 
        prev.map(project => ({
          ...project,
          tasks: project.tasks.map(task => 
            task.id === taskId 
              ? { ...task, ...updates }
              : task
          ),
          updatedAt: new Date()
        }))
      )

      toast({
        title: 'Success',
        description: 'Task updated successfully'
      })
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      })
    }
  }, [toast])

  // Alternar favorito
  const toggleFavorite = useCallback(async (projectId: string) => {
    try {
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, isFavorite: !project.isFavorite, updatedAt: new Date() }
            : project
        )
      )
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }, [])

  // Simular actualizaciones de estado online
  useEffect(() => {
    const interval = setInterval(() => {
      setTeamMembers(prev => 
        prev.map(member => ({
          ...member,
          isOnline: Math.random() > 0.3, // 70% probabilidad de estar online
          lastSeen: member.isOnline ? new Date() : member.lastSeen
        }))
      )
    }, 30000) // Actualizar cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  // Cargar datos al montar
  useEffect(() => {
    fetchWorkspaceData()
  }, [fetchWorkspaceData])

  return {
    projects,
    teamMembers,
    currentUser,
    isLoading,
    createProject,
    updateProject,
    createTask,
    updateTask,
    toggleFavorite,
    refetch: fetchWorkspaceData
  }
}
