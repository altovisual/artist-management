'use client'

import { useState } from "react"
import { useTeamReal } from "@/hooks/use-team-real"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InviteTeamModalIOS } from "@/components/team/invite-team-modal-ios"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { 
  Users, 
  MessageCircle, 
  MoreVertical, 
  UserPlus, 
  Crown, 
  Shield, 
  User,
  Trash2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface RealTeamSectionProps {
  className?: string
  onMemberClick?: (memberId: string) => void
}

export function RealTeamSection({ className, onMemberClick }: RealTeamSectionProps) {
  const {
    teamMembers,
    currentUser,
    isLoading,
    error,
    updateMemberRole,
    removeMember
  } = useTeamReal()

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  // Calcular stats
  const teamStats = {
    totalMembers: teamMembers.length,
    onlineMembers: teamMembers.filter(m => m.isOnline).length,
    adminCount: teamMembers.filter(m => m.role === 'admin').length,
    managerCount: teamMembers.filter(m => m.role === 'manager').length,
    memberCount: teamMembers.filter(m => m.role === 'member').length
  }

  const canManageMembers = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'manager' | 'member') => {
    await updateMemberRole(memberId, newRole)
  }

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      await removeMember(memberId)
    }
  }

  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-xl shadow-sm p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("bg-white rounded-xl shadow-sm p-6", className)}>
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-xl shadow-sm", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Team Management</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {teamStats.totalMembers} members
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-3 border-b border-gray-100 dark:border-gray-800">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {teamStats.onlineMembers}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Online Now</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {teamStats.totalMembers}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Members</div>
        </div>
      </div>

      {/* Role Stats */}
      <div className="p-4 flex items-center justify-around border-b border-gray-100 dark:border-gray-800 text-xs">
        <div className="flex items-center gap-1.5">
          <Crown className="h-3.5 w-3.5 text-yellow-600" />
          <span className="text-gray-600 dark:text-gray-400">{teamStats.adminCount} Admins</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">{teamStats.managerCount} Managers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-gray-600" />
          <span className="text-gray-600 dark:text-gray-400">{teamStats.memberCount} Members</span>
        </div>
      </div>

      {/* Members List */}
      <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
        {teamMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No team members yet</p>
          </div>
        ) : (
          teamMembers.map(member => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              <button
                onClick={() => onMemberClick?.(member.id)}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {member.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {member.name}
                    {member.id === currentUser?.id && (
                      <span className="ml-1.5 text-xs text-gray-500">(You)</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {member.email}
                  </div>
                </div>
              </button>

              <Badge 
                variant={member.role === 'admin' ? 'default' : 'secondary'}
                className="capitalize text-xs"
              >
                {member.role}
              </Badge>

              {canManageMembers && member.id !== currentUser?.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2 border-t border-gray-100 dark:border-gray-800">
        {canManageMembers && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={() => setInviteDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
        
        <Button variant="outline" size="sm" className="w-full gap-2">
          <MessageCircle className="h-4 w-4" />
          Team Chat
        </Button>
      </div>

      {/* iOS Modal */}
      <InviteTeamModalIOS
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  )
}
