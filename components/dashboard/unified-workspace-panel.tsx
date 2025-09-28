'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { 
  Clock, 
  User, 
  Music, 
  FileText, 
  Award, 
  Bell, 
  Search, 
  Filter, 
  MoreVertical,
  Check,
  X,
  Eye,
  EyeOff,
  Trash2,
  CheckCheck,
  Settings,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
  MessageCircle,
  FolderOpen,
  Plus,
  Hash,
  CheckCircle,
  Circle,
  AlertCircle,
  Star,
  Archive
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

// Interfaces combinadas
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

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'member'
  isOnline: boolean
  lastSeen?: Date
}

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

interface UnifiedWorkspacePanelProps {
  notifications: NotificationItem[]
  projects: Project[]
  teamMembers: TeamMember[]
  currentUser: TeamMember
  onMarkAsRead?: (id: string) => void
  onMarkAsUnread?: (id: string) => void
  onDelete?: (id: string) => void
  onBulkAction?: (ids: string[], action: 'read' | 'unread' | 'delete') => void
  onNotificationClick?: (notification: NotificationItem) => void
  onProjectSelect?: (project: Project) => void
  onNewProject?: () => void
  className?: string
}

export function UnifiedWorkspacePanel({
  notifications,
  projects,
  teamMembers,
  currentUser,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onBulkAction,
  onNotificationClick,
  onProjectSelect,
  onNewProject,
  className
}: UnifiedWorkspacePanelProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all')
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState("notifications")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Filtrar notificaciones
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notification.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = filterType === 'all' || 
                         (filterType === 'read' && notification.isRead) ||
                         (filterType === 'unread' && !notification.isRead)
      
      const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority

      return matchesSearch && matchesType && matchesPriority
    })
  }, [notifications, searchQuery, filterType, filterPriority])

  // Filtrar proyectos
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Categorizar proyectos
  const recentProjects = filteredProjects
    .filter(p => p.status === 'active')
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5)

  const activeProjects = filteredProjects.filter(p => p.status === 'active')
  const favoriteProjects = filteredProjects.filter(p => p.isFavorite && p.status === 'active')

  const unreadCount = notifications.filter(n => !n.isRead).length
  const onlineMembers = teamMembers.filter(member => member.isOnline)
  const selectedCount = selectedIds.length

  const handleNotificationClick = (notification: NotificationItem) => {
    // Marcar como leída automáticamente
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }

    // Llamar al callback personalizado si existe
    if (onNotificationClick) {
      onNotificationClick(notification)
    }

    // Navegación automática basada en actionUrl
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    onProjectSelect?.(project)
  }

  const handleSelectNotification = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }

  const handleBulkAction = (action: 'read' | 'unread' | 'delete') => {
    if (selectedIds.length > 0 && onBulkAction) {
      onBulkAction(selectedIds, action)
      setSelectedIds([])
    }
  }

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'artist_created': return User
      case 'project_added': return Music
      case 'contract_signed': return FileText
      case 'release_scheduled': return Award
      case 'payment_received': return Award
      case 'deadline_approaching': return Clock
      default: return Bell
    }
  }

  const getNotificationColor = (type: NotificationItem['type'], priority: NotificationItem['priority']) => {
    if (priority === 'high') return 'bg-red-500'
    if (priority === 'medium') return 'bg-yellow-500'
    
    switch (type) {
      case 'artist_created': return 'bg-blue-500'
      case 'project_added': return 'bg-green-500'
      case 'contract_signed': return 'bg-purple-500'
      case 'release_scheduled': return 'bg-orange-500'
      case 'payment_received': return 'bg-emerald-500'
      case 'deadline_approaching': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-300'
    }
  }

  return (
    <Card className={className}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold">Workspace</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b">
                <TabsList className="grid w-full grid-cols-3 m-2">
                  <TabsTrigger value="notifications" className="gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="team" className="gap-2">
                    <Users className="h-4 w-4" />
                    Team
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === 'notifications' ? "Search notifications..." : 
                                activeTab === 'projects' ? "Search projects..." : "Search team..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="flex-1 overflow-hidden flex flex-col mt-0">
                {/* Filters */}
                <div className="p-4 border-b">
                  <div className="flex flex-wrap gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Filter className="h-4 w-4" />
                          Status: {filterType}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setFilterType('all')}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterType('unread')}>Unread</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterType('read')}>Read</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          Priority: {filterPriority}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setFilterPriority('all')}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterPriority('high')}>High</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterPriority('medium')}>Medium</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterPriority('low')}>Low</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedCount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted mx-4 rounded-lg">
                    <span className="text-sm font-medium">{selectedCount} selected</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('read')}>
                        <Check className="h-4 w-4 mr-1" />
                        Read
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {filteredNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    const colorClass = getNotificationColor(notification.type, notification.priority)
                    const priorityClass = getPriorityColor(notification.priority)
                    const isSelected = selectedIds.includes(notification.id)
                    
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "relative flex gap-3 p-3 rounded-lg border-l-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm",
                          priorityClass,
                          !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20",
                          isSelected && "bg-primary/10 border-primary",
                          "cursor-pointer group"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {/* Selection Checkbox */}
                        <div className="flex-shrink-0 pt-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectNotification(notification.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* Icon */}
                        <div className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                          colorClass
                        )}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={cn(
                                  "font-medium text-sm truncate",
                                  !notification.isRead && "font-semibold"
                                )}>
                                  {notification.title}
                                </h4>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                                {notification.actionUrl && (
                                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {notification.description}
                              </p>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {notification.user && (
                                  <div className="flex items-center gap-1">
                                    <Avatar className="h-3 w-3">
                                      <AvatarImage src={notification.user.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {notification.user.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{notification.user.name}</span>
                                  </div>
                                )}
                                <span>•</span>
                                <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="flex-1 overflow-hidden flex flex-col mt-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Recent Projects */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-sm">Recent Projects</h4>
                      <Badge variant="secondary" className="text-xs">
                        {recentProjects.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {recentProjects.map(project => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectClick(project)}
                          className={cn(
                            "flex items-center gap-2 w-full text-left p-3 rounded-lg transition-colors hover:bg-muted/50",
                            selectedProject?.id === project.id && "bg-primary/10 border border-primary"
                          )}
                        >
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{project.name}</span>
                              {project.isFavorite && <Star className="h-3 w-3 text-yellow-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {project.tasks.length} tasks
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Projects */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-sm">All Active Projects</h4>
                      <Badge variant="secondary" className="text-xs">
                        {activeProjects.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {activeProjects.map(project => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectClick(project)}
                          className={cn(
                            "flex items-center gap-2 w-full text-left p-3 rounded-lg transition-colors hover:bg-muted/50",
                            selectedProject?.id === project.id && "bg-primary/10 border border-primary"
                          )}
                        >
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{project.name}</span>
                              {project.isFavorite && <Star className="h-3 w-3 text-yellow-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {project.tasks.length} tasks
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* New Project Button */}
                  <Button 
                    onClick={onNewProject}
                    className="w-full gap-2" 
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                </div>
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team" className="flex-1 overflow-hidden flex flex-col mt-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Online Members */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-sm">Team Online</h4>
                      <Badge variant="secondary" className="text-xs">
                        {onlineMembers.length}/{teamMembers.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {onlineMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="p-1">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All Team Members */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-sm">All Members</h4>
                      <Badge variant="secondary" className="text-xs">
                        {teamMembers.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {teamMembers.filter(m => !m.isOnline).map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 opacity-75">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-400 rounded-full border-2 border-background" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {member.role} • {member.lastSeen ? formatDistanceToNow(member.lastSeen, { addSuffix: true }) : 'Offline'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Button 
                      onClick={() => router.push('/team')}
                      className="w-full gap-2" 
                      variant="outline"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Open Full Workspace
                    </Button>
                    <Button 
                      onClick={() => setIsChatOpen(true)}
                      className="w-full gap-2" 
                      variant="outline"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Team Chat
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Card>
  )
}
