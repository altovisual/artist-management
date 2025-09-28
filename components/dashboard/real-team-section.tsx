'use client'

import { useState } from "react"
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
  Settings
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
  teamMembers: TeamMember[]
  currentUser: TeamMember | null
  teamStats: TeamStats
  onUpdateMemberRole?: (memberId: string, role: 'admin' | 'manager' | 'member') => Promise<void>
  onUpdateOnlineStatus?: (memberId: string, isOnline: boolean) => Promise<void>
  onInviteMember?: (email: string, role: 'admin' | 'manager' | 'member') => Promise<void>
  onRemoveMember?: (memberId: string) => Promise<void>
  className?: string
}

export function RealTeamSection({
  teamMembers,
  currentUser,
  teamStats,
  onUpdateMemberRole,
  onUpdateOnlineStatus,
  onInviteMember,
  onRemoveMember,
  className
}: RealTeamSectionProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'member'>('member')
  const [isInviting, setIsInviting] = useState(false)

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
      case 'member': return 'text-gray-600 dark:text-gray-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail || !onInviteMember) return

    setIsInviting(true)
    try {
      await onInviteMember(inviteEmail, inviteRole)
      setInviteEmail('')
      setInviteRole('member')
      setInviteDialogOpen(false)
    } catch (err) {
      console.error('Error inviting member:', err)
    } finally {
      setIsInviting(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'manager' | 'member') => {
    if (!onUpdateMemberRole) return
    
    try {
      await onUpdateMemberRole(memberId, newRole)
    } catch (err) {
      console.error('Error updating role:', err)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!onRemoveMember) return
    
    try {
      await onRemoveMember(memberId)
    } catch (err) {
      console.error('Error removing member:', err)
    }
  }

  const canManageMembers = currentUser?.role === 'admin' || currentUser?.role === 'manager'

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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team workspace.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="member@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Member
                        </div>
                      </SelectItem>
                      <SelectItem value="manager">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Manager
                        </div>
                      </SelectItem>
                      {currentUser?.role === 'admin' && (
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Admin
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInviteMember} 
                  disabled={!inviteEmail || isInviting}
                >
                  {isInviting ? 'Inviting...' : 'Send Invite'}
                </Button>
              </DialogFooter>
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
