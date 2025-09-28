'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
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
  ExternalLink
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

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

interface NotificationCenterProps {
  notifications: NotificationItem[]
  onMarkAsRead?: (id: string) => void
  onMarkAsUnread?: (id: string) => void
  onDelete?: (id: string) => void
  onBulkAction?: (ids: string[], action: 'read' | 'unread' | 'delete') => void
  onNotificationClick?: (notification: NotificationItem) => void
  className?: string
}

export function NotificationCenter({ 
  notifications, 
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onBulkAction,
  onNotificationClick,
  className 
}: NotificationCenterProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all')
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(true)

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

  const unreadCount = notifications.filter(n => !n.isRead).length
  const selectedCount = selectedIds.length

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

  const getNotificationBadge = (type: NotificationItem['type']) => {
    switch (type) {
      case 'artist_created': return { text: 'New Artist', variant: 'default' as const }
      case 'project_added': return { text: 'Project', variant: 'secondary' as const }
      case 'contract_signed': return { text: 'Contract', variant: 'outline' as const }
      case 'release_scheduled': return { text: 'Release', variant: 'destructive' as const }
      case 'payment_received': return { text: 'Payment', variant: 'default' as const }
      case 'deadline_approaching': return { text: 'Deadline', variant: 'destructive' as const }
      default: return { text: 'Activity', variant: 'default' as const }
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

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id))
    }
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

  const handleNotificationAction = (notification: NotificationItem, action: 'read' | 'unread' | 'delete') => {
    switch (action) {
      case 'read':
        if (!notification.isRead && onMarkAsRead) onMarkAsRead(notification.id)
        break
      case 'unread':
        if (notification.isRead && onMarkAsUnread) onMarkAsUnread(notification.id)
        break
      case 'delete':
        if (onDelete) onDelete(notification.id)
        break
    }
  }

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

  if (notifications.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
        <p className="text-muted-foreground">You&apos;re all caught up! New notifications will appear here.</p>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <div className="p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold">Notifications</h3>
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notification Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction('read')}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All as Read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIds(notifications.map(n => n.id))}>
                  <Check className="h-4 w-4 mr-2" />
                  Select All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Search and Filters */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
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
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-4">
                <span className="text-sm font-medium">{selectedCount} selected</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('read')}>
                    <Check className="h-4 w-4 mr-1" />
                    Mark Read
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('unread')}>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Mark Unread
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Select All Checkbox */}
            {filteredNotifications.length > 0 && (
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <Checkbox
                  checked={selectedIds.length === filteredNotifications.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  Select all ({filteredNotifications.length})
                </span>
              </div>
            )}

            {/* Notifications List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                const colorClass = getNotificationColor(notification.type, notification.priority)
                const priorityClass = getPriorityColor(notification.priority)
                const badge = getNotificationBadge(notification.type)
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
                            <Badge variant={badge.variant} className="text-xs">
                              {badge.text}
                            </Badge>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                            {notification.actionUrl && (
                              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {notification.description}
                            {notification.isRead && <span className="text-muted-foreground">You're all caught up! 🎉</span>}
                          </p>
                          
                          {/* Metadata */}
                          {notification.metadata && (
                            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground mb-2">
                              {notification.metadata.artistName && (
                                <span className="bg-muted px-1.5 py-0.5 rounded">
                                  Artist: {notification.metadata.artistName}
                                </span>
                              )}
                              {notification.metadata.projectName && (
                                <span className="bg-muted px-1.5 py-0.5 rounded">
                                  Project: {notification.metadata.projectName}
                                </span>
                              )}
                              {notification.metadata.amount && (
                                <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                  ${notification.metadata.amount.toLocaleString()}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* User and Time */}
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
                        
                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {notification.isRead ? (
                              <DropdownMenuItem onClick={() => handleNotificationAction(notification, 'unread')}>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Mark as Unread
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleNotificationAction(notification, 'read')}>
                                <Eye className="h-4 w-4 mr-2" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleNotificationAction(notification, 'delete')}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredNotifications.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications match your filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  )
}
