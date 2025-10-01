'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Clock, 
  FolderOpen, 
  Star, 
  Archive, 
  Trash2, 
  Plus,
  Users,
  MessageCircle,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  Hash,
  CheckCircle,
  Circle,
  AlertCircle,
  Eye,
  MoreVertical,
  Edit,
  StarOff,
  ArchiveRestore,
  Music
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TeamChat } from './team-chat'
import { CreateTaskDialog } from './create-task-dialog'
import { TaskDetailsDialog } from './task-details-dialog'
import { TaskCard } from './task-card'
import { useRouter } from 'next/navigation'
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
  artistId?: string
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

interface TeamWorkspaceProps {
  currentUser: TeamMember
  projects: Project[]
  teamMembers: TeamMember[]
  onProjectSelect?: (project: Project) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onNewProject?: () => void
  onNewTask?: (projectId: string, taskData: any) => Promise<void>
  onToggleFavorite?: (projectId: string) => void
  onUpdateProjectStatus?: (projectId: string, status: Project['status']) => void
}

export function TeamWorkspace({
  currentUser,
  projects,
  teamMembers,
  onProjectSelect,
  onTaskUpdate,
  onNewProject,
  onNewTask,
  onToggleFavorite,
  onUpdateProjectStatus
}: TeamWorkspaceProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("team")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [expandedSections, setExpandedSections] = useState<any>({
    recent: true,
    projects: true,
    favorites: true,
    archived: false,
    deleted: false,
    mobileMenu: false
  })

  // Subscribe to new messages for notifications
  useEffect(() => {
    if (!currentUser?.id) return

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('team_chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', currentUser.id)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    // Subscribe to new messages
    const channel = supabase
      .channel('workspace_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_chat_messages'
        },
        async (payload) => {
          const newMsg = payload.new as any
          
          // Only notify if not from current user
          if (newMsg.sender_id !== currentUser.id) {
            // No notificar si el chat está abierto y es del mismo proyecto
            const isChatOpenForThisProject = isChatOpen && selectedProject?.id === newMsg.project_id
            
            if (!isChatOpenForThisProject) {
              // Get project name
              const { data: project } = await supabase
                .from('artists')
                .select('name')
                .eq('id', newMsg.project_id)
                .single()

              // Get sender name
              const { data: sender } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', newMsg.sender_id)
                .single()

              // Update unread count
              setUnreadCount(prev => prev + 1)

              // Show toast notification
              toast({
                title: `💬 New message in ${project?.name || 'Project'}`,
                description: `${sender?.full_name || 'Someone'}: ${newMsg.content.substring(0, 50)}${newMsg.content.length > 50 ? '...' : ''}`,
                duration: 5000,
              })

              // Show browser notification if supported
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`New message in ${project?.name || 'Project'}`, {
                  body: `${sender?.full_name || 'Someone'}: ${newMsg.content}`,
                  icon: '/icon-192.png',
                  badge: '/icon-192.png'
                })
              }
            }
          }
        }
      )
      .subscribe()

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      channel.unsubscribe()
    }
  }, [currentUser?.id, supabase, toast])

  // Filtrar proyectos
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Categorizar proyectos
  const recentProjects = filteredProjects
    .filter(p => p.status === 'active')
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 3)

  const activeProjects = filteredProjects.filter(p => p.status === 'active')
  const favoriteProjects = filteredProjects.filter(p => p.isFavorite && p.status === 'active')
  const archivedProjects = filteredProjects.filter(p => p.status === 'archived')
  const deletedProjects = filteredProjects.filter(p => p.status === 'deleted')

  // Usuarios online
  const onlineMembers = teamMembers.filter(member => member.isOnline)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleProjectClick = async (project: Project) => {
    setSelectedProject(project)
    setIsChatOpen(true)
    onProjectSelect?.(project)

    // Mark messages as read for this project
    if (currentUser?.id) {
      const { error } = await supabase
        .from('team_chat_messages')
        .update({ is_read: true })
        .eq('project_id', project.id)
        .neq('sender_id', currentUser.id)
        .eq('is_read', false)

      if (!error) {
        // Update unread count
        const { count } = await supabase
          .from('team_chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
          .neq('sender_id', currentUser.id)

        setUnreadCount(count || 0)
      }
    }
  }

  const handleCreateTask = async (projectId: string, taskData: any) => {
    if (onNewTask) {
      await onNewTask(projectId, taskData)
    }
  }

  const handleToggleFavorite = (projectId: string) => {
    onToggleFavorite?.(projectId)
  }

  const handleArchiveProject = (projectId: string) => {
    onUpdateProjectStatus?.(projectId, 'archived')
  }

  const handleRestoreProject = (projectId: string) => {
    onUpdateProjectStatus?.(projectId, 'active')
  }

  const handleViewArtist = (artistId?: string) => {
    if (artistId) {
      router.push(`/artists/${artistId}`)
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDetailsOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    // This will be handled by the parent component
    if (onTaskUpdate) {
      // For now, we'll just close the dialog
      // In a real implementation, you'd call a delete function
      setIsTaskDetailsOpen(false)
      setSelectedTask(null)
    }
  }

  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-500'
      case 'in_progress': return 'bg-blue-500'
      case 'in_review': return 'bg-yellow-500'
      case 'completed': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTaskStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo': return Circle
      case 'in_progress': return AlertCircle
      case 'in_review': return Eye
      case 'completed': return CheckCircle
      default: return Circle
    }
  }

  const getTaskStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'To Do'
      case 'in_progress': return 'In Progress'
      case 'in_review': return 'In Review'
      case 'completed': return 'Completed'
      default: return 'Unknown'
    }
  }

  const ProjectSection = ({ 
    title, 
    projects, 
    icon: Icon, 
    isExpanded, 
    onToggle, 
    sectionKey 
  }: {
    title: string
    projects: Project[]
    icon: any
    isExpanded: boolean
    onToggle: () => void
    sectionKey: string
  }) => (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left p-2 hover:bg-muted/50 rounded-lg transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">{title}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {projects.length}
        </Badge>
      </button>
      
      {isExpanded && (
        <div className="ml-6 mt-2 space-y-1">
          {projects.map(project => (
            <div
              key={project.id}
              className={cn(
                "flex items-center gap-2 w-full p-2 rounded-lg transition-colors hover:bg-muted/50 group",
                selectedProject?.id === project.id && "bg-primary/10 border-l-2 border-primary"
              )}
            >
              <button
                onClick={() => handleProjectClick(project)}
                className="flex items-center gap-2 flex-1 text-left min-w-0"
              >
                {project.profileImage ? (
                  <img src={project.profileImage} alt="" className="h-4 w-4 rounded object-cover" />
                ) : (
                  <Hash className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-sm truncate flex-1">{project.name}</span>
                {selectedProject?.id === project.id && (
                  <CheckCircle className="h-3 w-3 text-primary" />
                )}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleProjectClick(project)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Project
                  </DropdownMenuItem>
                  {project.artistId && (
                    <DropdownMenuItem onClick={() => handleViewArtist(project.artistId)}>
                      <Music className="h-4 w-4 mr-2" />
                      View Artist Profile
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleToggleFavorite(project.id)}>
                    {project.isFavorite ? (
                      <><StarOff className="h-4 w-4 mr-2" />Remove from Favorites</>
                    ) : (
                      <><Star className="h-4 w-4 mr-2" />Add to Favorites</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {project.status === 'active' ? (
                    <DropdownMenuItem onClick={() => handleArchiveProject(project.id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleRestoreProject(project.id)}>
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      Restore
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-full bg-background relative">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden shadow-lg bg-background"
        onClick={() => setExpandedSections(prev => ({ ...prev, mobileMenu: !prev.mobileMenu as any }))}
      >
        <FolderOpen className="h-4 w-4" />
      </Button>

      {/* Mobile Chat Toggle - Only show when project is selected */}
      {selectedProject && (
        <Button
          variant="default"
          size="sm"
          className="fixed bottom-4 right-4 z-50 lg:hidden shadow-lg rounded-full h-12 w-12 p-0"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-[85vw] sm:w-80 border-r bg-background flex flex-col",
        "fixed lg:relative inset-y-0 left-0 z-40",
        "transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 shadow-xl lg:shadow-none",
        expandedSections.mobileMenu ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-3 lg:p-4 border-b">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FolderOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="font-semibold text-lg">All Projects</h1>
            </div>
            {unreadCount > 0 && (
              <div className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </div>
            )}
          </div>
          
        </div>

        {/* Projects List with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs List */}
          <div className="px-3 lg:px-4 border-b">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
            </TabsList>
          </div>

          {/* Search */}
          <div className="p-3 lg:p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <TabsContent value="team" className="mt-0 p-3 lg:p-4 space-y-3 lg:space-y-4 overflow-y-auto flex-1">
            {/* Recent */}
            <ProjectSection
              title="Recent"
              projects={recentProjects}
              icon={Clock}
              isExpanded={expandedSections.recent}
              onToggle={() => toggleSection('recent')}
              sectionKey="recent"
            />

            {/* Projects */}
            <ProjectSection
              title="Projects"
              projects={activeProjects}
              icon={FolderOpen}
              isExpanded={expandedSections.projects}
              onToggle={() => toggleSection('projects')}
              sectionKey="projects"
            />

            {/* Favorites */}
            <ProjectSection
              title="Favorite Projects"
              projects={favoriteProjects}
              icon={Star}
              isExpanded={expandedSections.favorites}
              onToggle={() => toggleSection('favorites')}
              sectionKey="favorites"
            />

            {/* Archived */}
            <ProjectSection
              title="Archive Projects"
              projects={archivedProjects}
              icon={Archive}
              isExpanded={expandedSections.archived}
              onToggle={() => toggleSection('archived')}
              sectionKey="archived"
            />

            {/* Deleted */}
            <ProjectSection
              title="Deleted Projects"
              projects={deletedProjects}
              icon={Trash2}
              isExpanded={expandedSections.deleted}
              onToggle={() => toggleSection('deleted')}
              sectionKey="deleted"
            />
          </TabsContent>

          <TabsContent value="personal" className="mt-0 p-3 lg:p-4 overflow-y-auto flex-1">
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Personal projects coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Online Team Members */}
        <div className="border-t p-3 lg:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Team Online</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {onlineMembers.length}
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-32 lg:max-h-40 overflow-y-auto">
            {onlineMembers.map(member => (
              <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Task Button */}
        <div className="border-t p-3 lg:p-4">
          <Button 
            onClick={onNewProject}
            className="w-full gap-2 h-9" 
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {expandedSections.mobileMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setExpandedSections(prev => ({ ...prev, mobileMenu: false as any }))}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedProject ? (
          <>
            {/* Project Header */}
            <div className="border-b p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3 lg:gap-4">
                  {selectedProject.profileImage && (
                    <img 
                      src={selectedProject.profileImage} 
                      alt={selectedProject.name}
                      className="h-12 w-12 lg:h-16 lg:w-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl lg:text-2xl font-bold">{selectedProject.name}</h1>
                      {selectedProject.isFavorite && (
                        <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm lg:text-base text-muted-foreground mt-1">
                      {selectedProject.genre && `${selectedProject.genre} • `}
                      Created {selectedProject.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsCreateTaskOpen(true)}
                  >
                    <Plus className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">New Task</span>
                  </Button>
                  {selectedProject.artistId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewArtist(selectedProject.artistId)}
                    >
                      <Music className="h-4 w-4 lg:mr-2" />
                      <span className="hidden lg:inline">Artist Profile</span>
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Chat</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Project Tabs */}
            <div className="border-b">
              <Tabs defaultValue="board" className="w-full">
                <TabsList className="h-12 px-6">
                  <TabsTrigger value="board">Board</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="board" className="mt-0 overflow-y-auto">
                  {/* Task Board */}
                  <div className="p-4 lg:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      {/* To Do Column */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-500 rounded-full" />
                          <h3 className="font-semibold">To Do</h3>
                          <Badge variant="secondary" className="ml-auto">
                            {selectedProject.tasks.filter(t => t.status === 'todo').length}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {selectedProject.tasks
                            .filter(task => task.status === 'todo')
                            .map(task => (
                              <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
                            ))}
                        </div>
                      </div>

                      {/* In Progress Column */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          <h3 className="font-semibold">In Progress</h3>
                          <Badge variant="secondary" className="ml-auto">
                            {selectedProject.tasks.filter(t => t.status === 'in_progress').length}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {selectedProject.tasks
                            .filter(task => task.status === 'in_progress')
                            .map(task => (
                              <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
                            ))}
                        </div>
                      </div>

                      {/* In Review Column */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <h3 className="font-semibold">In Review</h3>
                          <Badge variant="secondary" className="ml-auto">
                            {selectedProject.tasks.filter(t => t.status === 'in_review').length}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {selectedProject.tasks
                            .filter(task => task.status === 'in_review')
                            .map(task => (
                              <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
                            ))}
                        </div>
                      </div>

                      {/* Completed Column */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <h3 className="font-semibold">Completed</h3>
                          <Badge variant="secondary" className="ml-auto">
                            {selectedProject.tasks.filter(t => t.status === 'completed').length}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {selectedProject.tasks
                            .filter(task => task.status === 'completed')
                            .map(task => (
                              <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="timeline" className="mt-0 overflow-y-auto">
                  <div className="p-4 lg:p-6 text-center text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Timeline view coming soon</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="calendar" className="mt-0 overflow-y-auto">
                  <div className="p-4 lg:p-6 text-center text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Calendar view coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <FolderOpen className="h-12 w-12 lg:h-16 lg:w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-lg lg:text-xl font-semibold mb-2">Select a Project</h2>
              <p className="text-sm lg:text-base text-muted-foreground mb-4">Choose a project from the sidebar to view tasks and collaborate with your team.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  onClick={() => setExpandedSections(prev => ({ ...prev, mobileMenu: true }))}
                  variant="outline"
                  className="gap-2 lg:hidden"
                >
                  <FolderOpen className="h-4 w-4" />
                  Open Sidebar
                </Button>
                <Button onClick={onNewProject} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Task
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Team Chat */}
      <TeamChat
        currentUser={currentUser}
        teamMembers={teamMembers}
        projectId={selectedProject?.id}
        projectName={selectedProject?.name}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onMinimize={() => setIsChatOpen(false)}
      />

      {/* Create Task Dialog */}
      {selectedProject && (
        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          teamMembers={teamMembers}
          onCreateTask={handleCreateTask}
        />
      )}

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        task={selectedTask}
        open={isTaskDetailsOpen}
        onOpenChange={setIsTaskDetailsOpen}
        teamMembers={teamMembers}
        onUpdateTask={onTaskUpdate}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  )
}
