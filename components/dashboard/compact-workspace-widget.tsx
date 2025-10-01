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
import { TeamChat } from '../team/team-chat'
import { useTeamReal } from '@/hooks/use-team-real'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

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
  const { toast } = useToast()
  const supabase = createClient()
  const { teamMembers: realTeamMembers } = useTeamReal()
  const [activeView, setActiveView] = useState<'overview' | 'notifications' | 'projects' | 'team' | 'messages'>('overview')
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<CompactProject | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [chatNotifications, setChatNotifications] = useState<CompactNotification[]>([])
  const [showNotificationBadge, setShowNotificationBadge] = useState(false)
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null)
  
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

  // Subscribe to chat notifications and team events
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

    // Subscribe to team member additions
    const teamChannel = supabase
      .channel('team_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_members'
        },
        async (payload) => {
          const newMember = payload.new as any
          
          // Notificar a todos los miembros del equipo
          const { data: member } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', newMember.user_id)
            .single()

          const notification: CompactNotification = {
            id: `team-${newMember.id}`,
            title: `👥 ${member?.full_name || 'New member'} joined the team`,
            type: 'project',
            timestamp: new Date(),
            isRead: false,
            priority: 'medium',
            actionUrl: '/team'
          }

          setChatNotifications(prev => [notification, ...prev].slice(0, 20))
          
          playNotificationSound()
          setShowNotificationBadge(true)
          setTimeout(() => setShowNotificationBadge(false), 3000)

          toast({
            title: '👥 New team member',
            description: `${member?.full_name || 'Someone'} joined the team as ${newMember.role}`,
            duration: 4000,
          })
        }
      )
      .subscribe()

    // Subscribe to contract events (solo para admins)
    let contractChannel: any = null
    const isAdmin = currentUser?.role === 'admin' || (currentUser as any)?.app_metadata?.role === 'admin'
    
    console.log('🔍 Checking admin status:', { isAdmin, role: currentUser?.role })
    
    if (isAdmin) {
      console.log('✅ Admin detected - subscribing to contract notifications')
      
      contractChannel = supabase
        .channel('contract_notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'signatures'
          },
          async (payload) => {
            console.log('📄 Contract event received:', payload)
            
            const signature = payload.new as any
            const eventType = payload.eventType
            
            console.log('📄 Event details:', { eventType, status: signature?.status, id: signature?.id })
            
            // Notificación cuando se envía un contrato
            if (eventType === 'INSERT') {
              const { data: artist } = await supabase
                .from('artists')
                .select('name')
                .eq('id', signature.artist_id)
                .single()

              const notification: CompactNotification = {
                id: `contract-sent-${signature.id}`,
                title: `📄 Contract sent to ${signature.signer_email}`,
                type: 'deadline',
                timestamp: new Date(),
                isRead: false,
                priority: 'medium',
                actionUrl: '/management/signatures'
              }

              setChatNotifications(prev => [notification, ...prev].slice(0, 20))
              
              toast({
                title: '📄 Contract sent',
                description: `Contract for ${artist?.name || 'artist'} sent to ${signature.signer_email}`,
                duration: 4000,
              })

              // Programar recordatorio para 5 horas después
              setTimeout(async () => {
                const { data: currentSig } = await supabase
                  .from('signatures')
                  .select('status')
                  .eq('id', signature.id)
                  .single()

                // Si aún no está firmado, enviar recordatorio
                if (currentSig && currentSig.status === 'pending') {
                  const reminderNotification: CompactNotification = {
                    id: `contract-reminder-${signature.id}`,
                    title: `⏰ Reminder: Contract pending signature`,
                    type: 'deadline',
                    timestamp: new Date(),
                    isRead: false,
                    priority: 'high',
                    actionUrl: '/management/signatures'
                  }

                  setChatNotifications(prev => [reminderNotification, ...prev].slice(0, 20))
                  
                  playNotificationSound()
                  setShowNotificationBadge(true)
                  setTimeout(() => setShowNotificationBadge(false), 3000)

                  toast({
                    title: '⏰ Contract reminder',
                    description: `${signature.signer_email} hasn't signed yet (5 hours)`,
                    duration: 5000,
                  })
                }
              }, 5 * 60 * 60 * 1000) // 5 horas
            }
            
            // Notificación cuando se firma un contrato
            if (eventType === 'UPDATE' && signature.status === 'completed') {
              const { data: artist } = await supabase
                .from('artists')
                .select('name')
                .eq('id', signature.artist_id)
                .single()

              const notification: CompactNotification = {
                id: `contract-signed-${signature.id}`,
                title: `✅ Contract signed by ${signature.signer_email}`,
                type: 'payment',
                timestamp: new Date(),
                isRead: false,
                priority: 'high',
                actionUrl: '/management/signatures'
              }

              setChatNotifications(prev => [notification, ...prev].slice(0, 20))
              
              playNotificationSound()
              setShowNotificationBadge(true)
              setTimeout(() => setShowNotificationBadge(false), 3000)

              toast({
                title: '✅ Contract signed!',
                description: `${artist?.name || 'Artist'} contract signed by ${signature.signer_email}`,
                duration: 5000,
              })

              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Contract Signed!', {
                  body: `${artist?.name || 'Artist'} contract signed by ${signature.signer_email}`,
                  icon: '/icon-192.png'
                })
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Contract channel status:', status)
        })
    } else {
      console.log('❌ Not admin - contract notifications disabled')
    }

    // Subscribe to new messages
    const channel = supabase
      .channel('dashboard_chat_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_chat_messages'
        },
        async (payload) => {
          const newMsg = payload.new as any
          
          // Solo notificar si el mensaje no es del usuario actual
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

              setUnreadCount(prev => prev + 1)

              // Create notification card
              const newNotification: CompactNotification = {
                id: newMsg.id,
                title: `💬 New message in ${project?.name || 'Project'}`,
                type: 'project',
                timestamp: new Date(newMsg.created_at),
                isRead: false,
                priority: 'high',
                actionUrl: `/team?project=${newMsg.project_id}`
              }

              setChatNotifications(prev => [newNotification, ...prev].slice(0, 10))

              // Play notification sound
              playNotificationSound()

              // Show badge animation
              setShowNotificationBadge(true)
              setTimeout(() => setShowNotificationBadge(false), 3000)

              toast({
                title: `💬 ${project?.name || 'New message'}`,
                description: `${sender?.full_name || 'Someone'}: ${newMsg.content.substring(0, 40)}...`,
                duration: 4000,
              })

              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`New message in ${project?.name || 'Project'}`, {
                  body: `${sender?.full_name}: ${newMsg.content}`,
                  icon: '/icon-192.png'
                })
              }
            }
          }
        }
      )
      .subscribe()

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      channel.unsubscribe()
      teamChannel.unsubscribe()
      if (contractChannel) {
        contractChannel.unsubscribe()
      }
    }
  }, [currentUser?.id])
  
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  // Play notification sound (iOS style)
  const playNotificationSound = () => {
    try {
      // Create audio context for iOS-style notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // iOS notification sound frequencies
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('Could not play notification sound:', error)
    }
  }

  const notificationUnreadCount = notifications.filter(n => !n.isRead).length
  // Usar datos reales del equipo
  const onlineCount = realTeamMembers.filter(m => m.isOnline).length
  const activeProjectsCount = projects.filter(p => p.status === 'active').length

  // Solo usar notificaciones de chat (datos reales)
  const allNotifications = chatNotifications.sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  )

  const recentNotifications = allNotifications.slice(0, 3)
  
  // Contador total de notificaciones no leídas
  const totalUnreadNotifications = allNotifications.filter(n => !n.isRead).length
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
    // If it's a chat notification, open the chat
    if (notification.title.includes('💬') && notification.actionUrl) {
      const projectId = notification.actionUrl.split('project=')[1]
      const project = projects.find(p => p.id === projectId)
      
      if (project) {
        setSelectedProject(project)
        setIsChatOpen(true)
        
        // Mark notification as read
        setChatNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        )
      }
    } else {
      onNotificationClick?.(notification)
      if (notification.actionUrl) {
        router.push(notification.actionUrl)
      }
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
            <div className={cn(
              "w-8 h-8 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50 relative",
              showNotificationBadge && "animate-bounce"
            )}>
              <Bell className={cn(
                "h-4 w-4 text-gray-600 dark:text-gray-400 transition-colors",
                showNotificationBadge && "text-primary animate-pulse"
              )} />
              {showNotificationBadge && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              )}
              {totalUnreadNotifications > 0 && !showNotificationBadge && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">{totalUnreadNotifications > 9 ? '9+' : totalUnreadNotifications}</span>
                </div>
              )}
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
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalUnreadNotifications}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Messages</div>
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
                {allNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You&apos;ll see chat messages here
                    </p>
                  </div>
                ) : (
                  allNotifications.map((notification) => (
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
                  ))
                )}
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
                    onClick={() => {
                      setSelectedProject(project)
                      setIsChatOpen(true)
                      onProjectClick?.(project)
                    }}
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
            <div className="h-full animate-in slide-in-from-right-2 duration-300 p-4">
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">Team Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a project from the Projects tab to start chatting with your team
                </p>
                <Button 
                  onClick={() => setActiveView('projects')}
                  variant="outline"
                  className="gap-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  View Projects
                </Button>
              </div>
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

      {/* Team Chat Modal */}
      {currentUser && (
        <TeamChat
          currentUser={currentUser}
          teamMembers={teamMembers}
          projectId={selectedProject?.id}
          projectName={selectedProject?.name}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onMinimize={() => setIsChatOpen(false)}
        />
      )}
    </Card>
  )
}

// Datos de ejemplo optimizados (solo datos reales, sin mock)
export const compactMockData = {
  // Solo notificaciones reales de eventos de la app
  notifications: [],
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
