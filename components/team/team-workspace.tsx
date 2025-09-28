'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TeamChat } from './team-chat'

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

interface TeamWorkspaceProps {
  currentUser: TeamMember
  projects: Project[]
  teamMembers: TeamMember[]
  onProjectSelect?: (project: Project) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onNewProject?: () => void
  onNewTask?: (projectId: string) => void
}

export function TeamWorkspace({
  currentUser,
  projects,
  teamMembers,
  onProjectSelect,
  onTaskUpdate,
  onNewProject,
  onNewTask
}: TeamWorkspaceProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("team")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    recent: true,
    projects: true,
    favorites: true,
    archived: false,
    deleted: false
  })

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

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    onProjectSelect?.(project)
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
            <button
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className={cn(
                "flex items-center gap-2 w-full text-left p-2 rounded-lg transition-colors hover:bg-muted/50",
                selectedProject?.id === project.id && "bg-primary/10 border-l-2 border-primary"
              )}
            >
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm truncate flex-1">{project.name}</span>
              {selectedProject?.id === project.id && (
                <CheckCircle className="h-3 w-3 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FolderOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-lg">All Projects</h1>
          </div>
          
        </div>

        {/* Projects List with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Tabs List */}
          <div className="px-4 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
            </TabsList>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
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
          <TabsContent value="team" className="mt-0 p-4 space-y-4">
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

          <TabsContent value="personal" className="mt-0 p-4">
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Personal projects coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Online Team Members */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Team Online</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {onlineMembers.length}
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {onlineMembers.map(member => (
              <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
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

        {/* Add Project Button */}
        <div className="border-t p-4">
          <Button 
            onClick={onNewProject}
            className="w-full gap-2" 
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedProject ? (
          <>
            {/* Project Header */}
            <div className="border-b p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
                  <p className="text-muted-foreground mt-1">
                    Created on {selectedProject.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
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
                
                <TabsContent value="board" className="mt-0">
                  {/* Task Board */}
                  <div className="p-6">
                    <div className="grid grid-cols-4 gap-6">
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
                              <Card key={task.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                                <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                                )}
                                {task.assignee && (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={task.assignee.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                                  </div>
                                )}
                              </Card>
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
                              <Card key={task.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                                <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                                )}
                                {task.assignee && (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={task.assignee.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                                  </div>
                                )}
                              </Card>
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
                              <Card key={task.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                                <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                                )}
                                {task.assignee && (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={task.assignee.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                                  </div>
                                )}
                              </Card>
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
                              <Card key={task.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow opacity-75">
                                <h4 className="font-medium text-sm mb-2 line-through">{task.title}</h4>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                                )}
                                {task.assignee && (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={task.assignee.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                                  </div>
                                )}
                              </Card>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="timeline" className="mt-0">
                  <div className="p-6 text-center text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Timeline view coming soon</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="calendar" className="mt-0">
                  <div className="p-6 text-center text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Calendar view coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Select a Project</h2>
              <p className="text-muted-foreground mb-4">Choose a project from the sidebar to view tasks and collaborate with your team.</p>
              <Button onClick={onNewProject} className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Project
              </Button>
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
    </div>
  )
}
