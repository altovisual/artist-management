'use client'

import { useState, useEffect, useRef } from "react"
import { useRealTeam } from "@/hooks/use-real-team"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Users, 
  MessageCircle, 
  MoreVertical, 
  UserPlus, 
  Crown, 
  Shield, 
  User,
  Mail,
  Clock,
  Trash2,
  Settings,
  X,
  MoreHorizontal
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

// Interfaces
interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'member'
  isOnline: boolean
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

interface RealTeamSectionProps {
  className?: string
}

export function RealTeamSection({ className }: RealTeamSectionProps) {
  // Usar datos reales del hook
  const {
    teamMembers,
    currentUser,
    teamStats,
    isLoading,
    error,
    updateMemberRole,
    updateMemberOnlineStatus,
    inviteMember,
    removeMember
  } = useRealTeam()
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'member'>('member')
  const [isInviting, setIsInviting] = useState(false)
  const [shareableLink, setShareableLink] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredMembers, setFilteredMembers] = useState(teamMembers)
  const [showAllMembers, setShowAllMembers] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const onlineMembers = teamMembers.filter(member => member.isOnline)
  const offlineMembers = teamMembers.filter(member => !member.isOnline)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown
      case 'manager': return Shield
      case 'member': return User
      default: return User
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-yellow-600 dark:text-yellow-400'
      case 'manager': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail || isInviting) return
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      alert('Por favor ingresa un email válido.')
      return
    }

    // Verificar si el miembro ya existe
    const existingMember = teamMembers.find(member => 
      member.email.toLowerCase() === inviteEmail.toLowerCase()
    )
    if (existingMember) {
      alert('Este miembro ya forma parte del equipo.')
      return
    }
    
    setIsInviting(true)
    try {
      await inviteMember(inviteEmail, inviteRole)
      
      // Limpiar formulario y mostrar éxito
      setInviteEmail('')
      setSearchQuery('')
      setShowSuggestions(false)
      
      // Mostrar mensaje de éxito
      alert(`¡Invitación enviada exitosamente a ${inviteEmail}!`)
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        setInviteDialogOpen(false)
      }, 1000)
      
    } catch (error) {
      console.error('Error inviting member:', error)
      alert('Error al invitar miembro. Por favor intenta de nuevo.')
    } finally {
      setIsInviting(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'manager' | 'member') => {
    try {
      await updateMemberRole(memberId, newRole)
    } catch (err) {
      console.error('Error updating role:', err)
      alert('Error al actualizar el rol. Por favor intenta de nuevo.')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId)
    } catch (err) {
      console.error('Error removing member:', err)
      alert('Error al remover miembro. Por favor intenta de nuevo.')
    }
  }

  const handleGetShareableLink = () => {
    // Generar un link de invitación (esto podría ser un endpoint real)
    const baseUrl = window.location.origin
    const inviteToken = btoa(`invite-${Date.now()}-${Math.random()}`)
    const link = `${baseUrl}/invite?token=${inviteToken}`
    setShareableLink(link)
    
    // Copiar al clipboard
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copiado al clipboard!')
    }).catch(() => {
      alert('No se pudo copiar el link. Puedes copiarlo manualmente.')
    })
  }

  // Filtrar miembros para sugerencias
  const getFilteredSuggestions = () => {
    if (!searchQuery.trim()) return []
    
    return teamMembers.filter(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5) // Máximo 5 sugerencias
  }

  // Manejar selección de sugerencia
  const handleSelectSuggestion = (email: string) => {
    setInviteEmail(email)
    setSearchQuery(email)
    setShowSuggestions(false)
  }

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setInviteEmail(value)
    setShowSuggestions(value.length > 0)
  }

  // Manejar scroll en la lista de miembros
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
    setScrollPosition(scrollPercentage)
  }

  // Cerrar modal y limpiar estados
  const closeModal = () => {
    setInviteDialogOpen(false)
    setInviteEmail('')
    setSearchQuery('')
    setShowSuggestions(false)
    setSelectedMembers([])
    setShareableLink(null)
    setShowAllMembers(false)
    setScrollPosition(0)
  }

  const canManageMembers = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  // Actualizar miembros filtrados cuando cambian los datos
  useEffect(() => {
    setFilteredMembers(teamMembers)
  }, [teamMembers])

  // Filtrar miembros basado en búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(teamMembers)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = teamMembers.filter(member => {
      // Búsqueda por texto
      const matchesText = 
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      
      // Búsqueda por estado especial
      const matchesOnline = query === 'online' && member.isOnline
      const matchesOffline = (query === 'offline' || query === 'inactive') && !member.isOnline
      
      return matchesText || matchesOnline || matchesOffline
    })
    
    setFilteredMembers(filtered)
  }, [searchQuery, teamMembers])

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Mostrar loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  // Mostrar error state
  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center p-4 text-red-600">
          <p>Error al cargar el equipo: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-2">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Team Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{teamStats.onlineMembers}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Online Now</div>
        </div>
        <div className="p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{teamStats.totalMembers}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Members</div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="flex gap-1 text-xs">
        <Badge variant="outline" className="gap-1">
          <Crown className="h-3 w-3" />
          {teamStats.adminCount} Admin{teamStats.adminCount !== 1 ? 's' : ''}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" />
          {teamStats.managerCount} Manager{teamStats.managerCount !== 1 ? 's' : ''}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <User className="h-3 w-3" />
          {teamStats.memberCount} Member{teamStats.memberCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Online Members */}
      {onlineMembers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Online Now</h4>
            <Badge variant="secondary" className="text-xs">
              {onlineMembers.length}
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {onlineMembers.map(member => {
              const RoleIcon = getRoleIcon(member.role)
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/40 dark:border-gray-700/40"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      {member.id === currentUser?.id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <RoleIcon className={cn("h-3 w-3", getRoleColor(member.role))} />
                      <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8 rounded-full hover:bg-white/60 dark:hover:bg-gray-700/60 backdrop-blur-sm"
                    >
                      <MessageCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>

                    {canManageMembers && member.id !== currentUser?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-8 w-8 rounded-full hover:bg-white/60 dark:hover:bg-gray-700/60"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'admin')}>
                            <Crown className="h-4 w-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'manager')}>
                            <Shield className="h-4 w-4 mr-2" />
                            Make Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'member')}>
                            <User className="h-4 w-4 mr-2" />
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Offline Members */}
      {offlineMembers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Offline</h4>
            <Badge variant="outline" className="text-xs">
              {offlineMembers.length}
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {offlineMembers.slice(0, 3).map(member => {
              const RoleIcon = getRoleIcon(member.role)
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/20 opacity-75"
                >
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-gray-400 rounded-full border border-background" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{member.name}</p>
                    <div className="flex items-center gap-1">
                      <RoleIcon className={cn("h-2 w-2", getRoleColor(member.role))} />
                      <p className="text-xs text-muted-foreground">
                        {member.lastSeen 
                          ? formatDistanceToNow(member.lastSeen, { addSuffix: true })
                          : 'Offline'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {offlineMembers.length > 3 && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  +{offlineMembers.length - 3} more offline
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {canManageMembers && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-full sm:max-w-[420px] max-h-[90vh] sm:max-h-[85vh] overflow-hidden p-0 touch-manipulation bg-white rounded-2xl border-0 shadow-2xl mx-2 sm:mx-auto">
              {/* Header estilo iPhone - Responsive */}
              <div className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 sm:w-10"></div>
                  <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 text-center flex-1">
                    Invite Teammates
                  </DialogTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={closeModal}
                    className="h-10 w-10 p-0 touch-manipulation rounded-full hover:bg-gray-200/60 transition-colors flex-shrink-0"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              </div>

              {/* Contenido con scroll - Responsive padding */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-6 sm:pb-8">
                  {/* Search Input estilo iPhone - Mobile Optimized */}
                  <div className="relative" ref={searchRef}>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-gray-100 rounded-2xl p-4 min-h-[60px] sm:min-h-[50px]">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-10 w-10 sm:h-8 sm:w-8 flex-shrink-0">
                          <AvatarFallback className="bg-blue-500 text-white text-sm">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative">
                          <Input
                            type="email"
                            placeholder="Enter email address..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 text-base sm:text-sm p-0 h-auto min-h-[24px]"
                          />
                          {searchQuery && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSearchQuery('')
                                setInviteEmail('')
                                setShowSuggestions(false)
                              }}
                              className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 rounded-full touch-manipulation"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <Button 
                        onClick={handleInviteMember} 
                        disabled={!inviteEmail || isInviting}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium min-h-[44px] touch-manipulation w-full sm:w-auto flex-shrink-0"
                      >
                        {isInviting ? 'Inviting...' : 'Invite'}
                      </Button>
                    </div>

                    {/* Sugerencias de autocompletado - Mobile Optimized */}
                    {showSuggestions && getFilteredSuggestions().length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[280px] overflow-y-auto">
                        {getFilteredSuggestions().map((member) => (
                          <button
                            key={member.id}
                            onClick={() => handleSelectSuggestion(member.email)}
                            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left touch-manipulation"
                          >
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm font-medium">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate text-base sm:text-sm">{member.name}</p>
                              <p className="text-sm text-gray-500 truncate">{member.email}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                member.isOnline 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {member.isOnline ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Shareable Link Section - Mobile Optimized */}
                  <div className="bg-red-50 rounded-2xl p-4 sm:p-5 border border-red-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-base sm:text-sm">Shareable Link is now Live!</p>
                          <p className="text-sm sm:text-xs text-gray-600 mt-1 sm:mt-0">Create and get shareable link for this workspace.</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full bg-white border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium min-h-[44px] sm:min-h-[36px] touch-manipulation w-full sm:w-auto flex-shrink-0"
                        onClick={handleGetShareableLink}
                      >
                        {shareableLink ? 'Link Copied!' : 'Get Link'}
                      </Button>
                    </div>
                  </div>

                  {/* Team Statistics */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{teamStats.totalMembers}</div>
                        <div className="text-xs text-gray-600">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{teamStats.onlineMembers}</div>
                        <div className="text-xs text-gray-600">Online</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {teamStats.adminCount + teamStats.managerCount}
                        </div>
                        <div className="text-xs text-gray-600">Managers</div>
                      </div>
                    </div>
                  </div>

                  {/* Search Bar for Members */}
                  <div className="relative">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <Input
                          type="text"
                          placeholder="Search members by name, email or role..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 text-sm p-0 h-auto"
                        />
                      </div>
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 rounded-full touch-manipulation"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Quick filters */}
                    {!searchQuery && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery('admin')}
                          className="text-xs px-3 py-1 h-7 rounded-full border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                        >
                          Admins ({teamStats.adminCount})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery('manager')}
                          className="text-xs px-3 py-1 h-7 rounded-full border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          Managers ({teamStats.managerCount})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery('online')}
                          className="text-xs px-3 py-1 h-7 rounded-full border-green-200 text-green-700 hover:bg-green-50"
                        >
                          Online ({teamStats.onlineMembers})
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Team Members List with Professional Scroll */}
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700">
                        Team Members ({filteredMembers.length})
                      </h3>
                      {filteredMembers.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllMembers(!showAllMembers)}
                          className="text-xs text-blue-600 hover:text-blue-700 p-1 h-auto"
                        >
                          {showAllMembers ? 'Show Less' : 'Show All'}
                        </Button>
                      )}
                    </div>

                    {/* Members List with Professional Scroll */}
                    <div 
                      ref={scrollRef}
                      onScroll={handleScroll}
                      className={`space-y-2 ${
                        !showAllMembers && filteredMembers.length > 5 
                          ? 'max-h-[320px] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400' 
                          : ''
                      } ${filteredMembers.length > 5 ? 'pr-1' : ''}`}
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d1d5db #f3f4f6'
                      }}
                    >
                      {(showAllMembers ? filteredMembers : filteredMembers.slice(0, 5)).map((member) => (
                        <div key={member.id} className="flex items-center justify-between gap-3 p-4 sm:p-3 hover:bg-gray-50 active:bg-gray-100 rounded-2xl transition-colors touch-manipulation">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="h-12 w-12 sm:h-10 sm:w-10 flex-shrink-0">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-base sm:text-sm font-medium">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900 truncate text-base sm:text-sm leading-tight">{member.name}</p>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                  member.role === 'admin' ? 'bg-yellow-100 text-yellow-700' :
                                  member.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {member.role}
                                </span>
                              </div>
                              <p className="text-sm sm:text-xs text-gray-500 truncate mt-1 sm:mt-0">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                              member.isOnline 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {member.isOnline ? 'Online' : 
                                member.lastSeen ? 
                                  `Inactive` : 
                                  'Offline'
                              }
                            </span>
                            {canManageMembers && member.id !== currentUser?.id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-10 w-10 sm:h-8 sm:w-8 p-0 touch-manipulation rounded-full hover:bg-gray-200/60 flex-shrink-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'admin')}>
                                    <Crown className="h-4 w-4 mr-2" />
                                    Make Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'manager')}>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Make Manager
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'member')}>
                                    <User className="h-4 w-4 mr-2" />
                                    Make Member
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Professional Scroll Indicators */}
                    {!showAllMembers && filteredMembers.length > 5 && (
                      <>
                        {/* Top fade */}
                        {scrollPosition > 5 && (
                          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white via-white/90 to-transparent pointer-events-none z-10" />
                        )}
                        
                        {/* Bottom fade */}
                        {scrollPosition < 95 && (
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-10" />
                        )}
                        
                        {/* Scroll progress indicator */}
                        <div className="absolute right-1 top-2 bottom-2 w-1 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="w-full bg-blue-500 rounded-full transition-all duration-200 ease-out"
                            style={{ 
                              height: `${Math.max(10, (5 / filteredMembers.length) * 100)}%`,
                              transform: `translateY(${(scrollPosition / 100) * (100 - Math.max(10, (5 / filteredMembers.length) * 100))}%)`
                            }}
                          />
                        </div>
                      </>
                    )}

                    {/* No Results */}
                    {filteredMembers.length === 0 && searchQuery && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">No members found matching "{searchQuery}"</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                          className="mt-2 text-blue-600 hover:text-blue-700"
                        >
                          Clear search
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Selection - Mobile Optimized */}
              {inviteEmail && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-6">
                  <label className="text-base sm:text-sm font-medium text-gray-700 mb-4 sm:mb-3 block">Select Role</label>
                  <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                    <SelectTrigger className="bg-white border-gray-200 rounded-2xl min-h-[52px] sm:min-h-[48px] touch-manipulation text-base sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-200">
                      <SelectItem value="member" className="rounded-xl p-4 sm:p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-base sm:text-sm">Member</p>
                            <p className="text-sm sm:text-xs text-gray-500">Basic access</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="manager" className="rounded-xl p-4 sm:p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Shield className="h-5 w-5 sm:h-4 sm:w-4 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-base sm:text-sm">Manager</p>
                            <p className="text-sm sm:text-xs text-gray-500">Can manage members</p>
                          </div>
                        </div>
                      </SelectItem>
                      {currentUser?.role === 'admin' && (
                        <SelectItem value="admin" className="rounded-xl p-4 sm:p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Crown className="h-5 w-5 sm:h-4 sm:w-4 text-yellow-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-base sm:text-sm">Admin</p>
                              <p className="text-sm sm:text-xs text-gray-500">Full access</p>
                            </div>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
        
        <Button variant="outline" size="sm" className="w-full gap-2">
          <MessageCircle className="h-4 w-4" />
          Team Chat
        </Button>
      </div>
    </div>
  )
}
