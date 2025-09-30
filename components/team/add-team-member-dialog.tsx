'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, UserPlus, Mail, Shield, Users, Check } from 'lucide-react'
import { useTeamReal, AvailableUser } from '@/hooks/use-team-real'

interface AddTeamMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTeamMemberDialog({ open, onOpenChange }: AddTeamMemberDialogProps) {
  const { availableUsers, addTeamMember, refreshAvailableUsers } = useTeamReal()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'manager' | 'member'>('member')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null)

  // Filtrar usuarios disponibles
  const filteredUsers = availableUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch && !user.is_team_member
  })

  const handleSelectUser = (user: AvailableUser) => {
    setSelectedUser(user)
    setEmail(user.email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      const result = await addTeamMember(email, role)
      
      if (result.success) {
        // Limpiar y cerrar
        setEmail('')
        setRole('member')
        setSelectedUser(null)
        setSearchQuery('')
        onOpenChange(false)
      } else {
        alert(result.error || 'Error adding team member')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Team Member
          </DialogTitle>
          <DialogDescription>
            Add registered users to your team by email. They must have an account to be added.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search Users */}
          <div className="space-y-2">
            <Label>Search Registered Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Users List */}
            {searchQuery && (
              <div className="max-h-[200px] overflow-y-auto border rounded-lg divide-y">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {selectedUser?.id === user.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected User or Manual Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="inline h-4 w-4 mr-1" />
              Email Address
            </Label>
            {selectedUser ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{selectedUser.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(null)
                    setEmail('')
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">
              <Shield className="inline h-4 w-4 mr-1" />
              Role
            </Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Member</span>
                    <Badge variant="secondary" className="ml-2">Basic Access</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Manager</span>
                    <Badge variant="secondary" className="ml-2">Can Manage</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-yellow-600" />
                    <span>Admin</span>
                    <Badge variant="secondary" className="ml-2">Full Access</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!email || isLoading}>
              {isLoading ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
