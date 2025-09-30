'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Bell, 
  Search, 
  Users, 
  FolderOpen, 
  Plus,
  ChevronRight,
  MessageCircle,
  Clock,
  Star,
  Hash,
  ExternalLink,
  ArrowUpRight,
  GripHorizontal
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { RealTeamSection } from './real-team-section'
import { ChatList } from '../chat/chat-list'
import { useTeamReal } from '@/hooks/use-team-real'

// Interfaces compactas
interface CompactNotification {
  id: string
  title: string
  type: 'artist' | 'project' | 'payment' | 'deadline'
  timestamp: Date
  isRead: boolean
  priority: 'high' | 'medium' | 'low'
  actionUrl?: string
}

interface CompactProject {
  id: string
  name: string
  tasksCount: number
  status: 'active' | 'completed'
  isFavorite: boolean
  updatedAt: Date
}

interface CompactMember {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  role: 'admin' | 'manager' | 'member'
  lastSeen?: Date
  createdAt: Date
}

interface TeamStats {
  totalMembers: number
  onlineMembers: number
  adminCount: number
  managerCount: number
  memberCount: number
}

interface CompactWorkspaceWidgetProps {
  notifications: CompactNotification[]
  projects: CompactProject[]
  teamMembers: CompactMember[]
  currentUser?: CompactMember | null
  teamStats?: TeamStats
  onNotificationClick?: (notification: CompactNotification) => void
  onProjectClick?: (project: CompactProject) => void
  onUpdateMemberRole?: (memberId: string, role: 'admin' | 'manager' | 'member') => Promise<void>
  onUpdateOnlineStatus?: (memberId: string, isOnline: boolean) => Promise<void>
  onInviteMember?: (email: string, role: 'admin' | 'manager' | 'member') => Promise<void>
  onRemoveMember?: (memberId: string) => Promise<void>
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  resizable?: boolean
  minWidth?: number
  minHeight?: number
}

export function CompactWorkspaceWidget({
  notifications,
  projects,
  teamMembers,
  currentUser,
  teamStats,
  onNotificationClick,
  onProjectClick,
  onUpdateMemberRole,
  onUpdateOnlineStatus,
  onInviteMember,
  onRemoveMember,
  className,
  maxWidth = 'sm',
  resizable = false,
  minWidth = 384,
  minHeight = 400
}: CompactWorkspaceWidgetProps) {
  const router = useRouter()
  const { teamMembers: realTeamMembers } = useTeamReal()
  const [activeView, setActiveView] = useState<'overview' | 'notifications' | 'projects' | 'team' | 'messages'>('overview')
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  
  // Resizable state
  const cardRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  
  useEffect(() => {
    if (cardRef.current && resizable) {
      const rect = cardRef.current.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }
  }, [resizable])
  
  useEffect(() => {
    if (!resizable) return
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !cardRef.current) return
      
      const rect = cardRef.current.getBoundingClientRect()
      const newHeight = Math.max(minHeight, e.clientY - rect.top)
      
      // Solo cambiar la altura, mantener ancho fijo
      setDimensions({ width: 0, height: newHeight })
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizable, minHeight])
  
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  // Usar datos reales del equipo
  const onlineCount = realTeamMembers.filter(m => m.isOnline).length
  const activeProjectsCount = projects.filter(p => p.status === 'active').length

  const recentNotifications = notifications.slice(0, 3)
  const recentProjects = projects.slice(0, 3)
  const onlineMembers = teamMembers.filter(m => m.isOnline).slice(0, 4)

  const handleViewChange = (view: typeof activeView) => {
    if (view === activeView) return
    
    // Reset selectedUserId cuando se sale de messages
    if (activeView === 'messages' && view !== 'messages') {
      setSelectedUserId(null)
    }
    
    setIsAnimating(true)
    setTimeout(() => {
      setActiveView(view)
      setIsAnimating(false)
    }, 150)
  }

  const handleMemberClick = (memberId: string) => {
    console.log('Member clicked:', memberId)
    setSelectedUserId(memberId)
    handleViewChange('messages')
  }

  const handleNotificationClick = (notification: CompactNotification) => {
    onNotificationClick?.(notification)
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const getNotificationIcon = (type: CompactNotification['type']) => {
    switch (type) {
      case 'artist': return '👤'
      case 'project': return '📁'
      case 'payment': return '💰'
      case 'deadline': return '⏰'
      default: return '🔔'
    }
  }

  const getPriorityColor = (priority: CompactNotification['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  }

  const cardStyle = resizable && dimensions.height > 0 ? {
    height: `${dimensions.height}px`
  } : {}

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl relative",
        !resizable && maxWidthClasses[maxWidth],
        resizable && "overflow-hidden",
        className
      )}
      style={cardStyle}
    >
      <div className={cn(
        "p-4 space-y-4",
        resizable && "h-full flex flex-col overflow-y-auto"
      )}>
        {/* Header con Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50">
              <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Workspace</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{onlineCount} online</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/team')}
            className="p-1 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleViewChange('notifications')}
            className={cn(
              "p-3 rounded-xl text-center transition-all duration-200 hover:scale-105 backdrop-blur-sm border",
              activeView === 'notifications' 
                ? "bg-white/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50 shadow-lg" 
                : "bg-white/30 dark:bg-gray-800/30 border-gray-200/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50"
            )}
          >
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{unreadCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Unread</div>
          </button>
          
          <button
            onClick={() => handleViewChange('projects')}
            className={cn(
              "p-3 rounded-xl text-center transition-all duration-200 hover:scale-105 backdrop-blur-sm border",
              activeView === 'projects' 
                ? "bg-white/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50 shadow-lg" 
                : "bg-white/30 dark:bg-gray-800/30 border-gray-200/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50"
            )}
          >
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{activeProjectsCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Projects</div>
          </button>
          
          <button
            onClick={() => handleViewChange('team')}
            className={cn(
              "p-3 rounded-xl text-center transition-all duration-200 hover:scale-105 backdrop-blur-sm border",
              activeView === 'team' 
                ? "bg-white/60 dark:bg-gray-800/60 border-gray-300/50 dark:border-gray-600/50 shadow-lg" 
                : "bg-white/30 dark:bg-gray-800/30 border-gray-200/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50"
            )}
          >
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{onlineCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Online</div>
          </button>
        </div>

        {/* Content Area con animaciones */}
        <div className={cn(
          "transition-all duration-300 ease-in-out min-h-[300px] max-h-[500px] overflow-y-auto",
          resizable && "flex-1",
          isAnimating && "opacity-50 scale-95"
        )}>
          {/* Overview */}
          {activeView === 'overview' && (
            <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Recent Activity</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange('notifications')}
                  className="text-xs p-1 h-6"
                >
                  View All
                </Button>
              </div>
              
              <div className="space-y-2">
                {recentNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-200 text-left"
                  >
                    <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notifications View */}
          {activeView === 'notifications' && (
            <div className={cn(
              "space-y-3 animate-in slide-in-from-bottom-2 duration-300",
              resizable && "flex flex-col h-full"
            )}>
              <div className="flex items-center justify-between flex-shrink-0">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange('overview')}
                  className="text-xs p-1 h-6"
                >
                  Back
                </Button>
              </div>
              
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] text-left backdrop-blur-sm border",
                      !notification.isRead 
                        ? "bg-white/60 dark:bg-gray-800/60 border-gray-300/60 dark:border-gray-600/60 shadow-md" 
                        : "bg-white/30 dark:bg-gray-800/30 border-gray-200/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm truncate",
                        !notification.isRead ? "font-semibold" : "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" />
                      )}
                      {notification.actionUrl && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects View */}
          {activeView === 'projects' && (
            <div className={cn(
              "space-y-3 animate-in slide-in-from-right-2 duration-300",
              resizable && "flex flex-col h-full"
            )}>
              <div className="flex items-center justify-between flex-shrink-0">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Projects
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange('overview')}
                  className="text-xs p-1 h-6"
                >
                  Back
                </Button>
              </div>
              
              <div className="space-y-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onProjectClick?.(project)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-200 hover:scale-[1.02] text-left"
                  >
                    <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        {project.isFavorite && <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {project.tasksCount} tasks • {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 mt-2"
                  onClick={() => router.push('/team')}
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </div>
            </div>
          )}

          {/* Team View */}
          {activeView === 'team' && (
            <div className={cn(
              "space-y-3 animate-in slide-in-from-left-2 duration-300",
              resizable ? "flex flex-col h-full" : "max-h-48"
            )}>
              <div className="flex items-center justify-between flex-shrink-0">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Management
                </h4>
                <Button
                  size="sm"
                  onClick={() => handleViewChange('overview')}
                  className="text-xs p-1 h-6"
                >
                  Back
                </Button>
              </div>
              
              <div>
                <RealTeamSection 
                  className="h-full"
                  onMemberClick={handleMemberClick}
                />
              </div>
            </div>
          )}

          {/* Messages View */}
          {activeView === 'messages' && (
            <div className="h-full animate-in slide-in-from-right-2 duration-300">
              <ChatList initialUserId={selectedUserId} />
            </div>
          )}
        </div>
      </div>
      
      {/* Resize Handle - Solo visible en web cuando resizable está activado */}
      {resizable && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute left-0 right-0 bottom-0 h-2 cursor-ns-resize group hidden md:block z-10 hover:h-3 transition-all"
          style={{ touchAction: 'none' }}
        >
          {/* Visual indicator */}
          <div className="absolute inset-0 bg-gray-300/0 dark:bg-gray-600/0 group-hover:bg-gray-300/50 dark:group-hover:bg-gray-600/50 transition-colors rounded-b-xl" />
          
          {/* Grip dots in the middle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
            <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
            <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
          </div>
        </div>
      )}
    </Card>
  )
}

// Datos de ejemplo optimizados
export const compactMockData = {
  notifications: [
    {
      id: '1',
      title: 'New artist profile created',
      type: 'artist' as const,
      timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000),
      isRead: false,
      priority: 'medium' as const,
      actionUrl: '/artists/1'
    },
    {
      id: '2',
      title: 'Project sesion2 started',
      type: 'project' as const,
      timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000),
      isRead: false,
      priority: 'high' as const,
      actionUrl: '/team'
    },
    {
      id: '3',
      title: 'Payment received $2,500',
      type: 'payment' as const,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isRead: false,
      priority: 'high' as const,
      actionUrl: '/finance/payments'
    },
    {
      id: '4',
      title: 'Contract deadline in 7 days',
      type: 'deadline' as const,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isRead: true,
      priority: 'high' as const,
      actionUrl: '/management/contracts'
    }
  ],
  projects: [
    {
      id: '1',
      name: 'John - SaaS Website',
      tasksCount: 4,
      status: 'active' as const,
      isFavorite: true,
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Metrica - CRM Web App',
      tasksCount: 2,
      status: 'active' as const,
      isFavorite: false,
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Stylee - Fashion Landing',
      tasksCount: 2,
      status: 'active' as const,
      isFavorite: true,
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ],
  teamMembers: [
    {
      id: '1',
      name: 'John Smith',
      avatar: undefined,
      isOnline: true,
      role: 'admin'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: undefined,
      isOnline: true,
      role: 'manager'
    },
    {
      id: '3',
      name: 'Emily Davis',
      avatar: undefined,
      isOnline: true,
      role: 'member'
    },
    {
      id: '4',
      name: 'Mike Wilson',
      avatar: undefined,
      isOnline: false,
      role: 'member'
    }
  ]
}
