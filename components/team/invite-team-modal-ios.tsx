'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { X, Mail, Search, UserPlus, Shield, Users, CheckCircle2, Circle } from 'lucide-react'
import { useTeamReal } from '@/hooks/use-team-real'
import { motion, AnimatePresence } from 'framer-motion'

interface InviteTeamModalIOSProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteTeamModalIOS({ open, onOpenChange }: InviteTeamModalIOSProps) {
  const { teamMembers, availableUsers, addTeamMember, currentUser } = useTeamReal()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'manager' | 'member'>('member')
  const [isInviting, setIsInviting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'invite' | 'members'>('invite')

  const filteredUsers = availableUsers.filter(user => 
    !user.is_team_member &&
    (user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleInvite = async () => {
    if (!email) return
    
    setIsInviting(true)
    try {
      const result = await addTeamMember(email, role)
      if (result.success) {
        setEmail('')
        setSearchQuery('')
        setActiveTab('members')
      }
    } finally {
      setIsInviting(false)
    }
  }

  const stats = {
    total: teamMembers.length,
    online: teamMembers.filter(m => m.isOnline).length,
    admins: teamMembers.filter(m => m.role === 'admin').length,
    managers: teamMembers.filter(m => m.role === 'manager').length,
    members: teamMembers.filter(m => m.role === 'member').length
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
        {/* iOS-style Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 p-2 rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-all duration-200 backdrop-blur-sm"
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-3 shadow-lg">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Team
            </DialogTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your workspace members
            </p>
          </div>
        </div>

        {/* Stats Cards - iOS Style */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-4 text-center border border-blue-200/50 dark:border-blue-800/30"
            >
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total}
              </div>
              <div className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70 mt-1">
                Total
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl p-4 text-center border border-green-200/50 dark:border-green-800/30"
            >
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.online}
              </div>
              <div className="text-xs font-medium text-green-600/70 dark:text-green-400/70 mt-1">
                Online
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-4 text-center border border-purple-200/50 dark:border-purple-800/30"
            >
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.admins}
              </div>
              <div className="text-xs font-medium text-purple-600/70 dark:text-purple-400/70 mt-1">
                Admins
              </div>
            </motion.div>
          </div>
        </div>

        {/* iOS-style Segmented Control */}
        <div className="px-6 pb-4">
          <div className="bg-gray-100/80 dark:bg-gray-800/50 rounded-2xl p-1 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setActiveTab('invite')}
                className={`relative py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'invite'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Invite
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`relative py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'members'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Members ({stats.total})
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 pb-6 max-h-[400px] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'invite' ? (
              <motion.div
                key="invite"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Email Input - iOS Style */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl text-base focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Role Selection - iOS Style */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'member', label: 'Member', icon: Users, desc: 'Can view and collaborate' },
                      { value: 'manager', label: 'Manager', icon: Shield, desc: 'Can manage team members' },
                      { value: 'admin', label: 'Admin', icon: Shield, desc: 'Full access to everything' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setRole(option.value as any)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                          role === option.value
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                            : 'bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          role === option.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          <option.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {option.desc}
                          </div>
                        </div>
                        {role === option.value && (
                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Available Users */}
                {availableUsers.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Or select from registered users
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl"
                      />
                    </div>
                    
                    {searchQuery && (
                      <div className="max-h-[200px] overflow-y-auto space-y-2 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-2">
                        {filteredUsers.map(user => (
                          <button
                            key={user.id}
                            onClick={() => {
                              setEmail(user.email)
                              setSearchQuery('')
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Invite Button - iOS Style */}
                <Button
                  onClick={handleInvite}
                  disabled={!email || isInviting}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50"
                >
                  {isInviting ? 'Sending Invite...' : 'Send Invitation'}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="members"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {member.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {member.name}
                        {member.id === currentUser?.id && (
                          <span className="ml-2 text-xs text-gray-500">(You)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {member.email}
                      </div>
                    </div>
                    <Badge 
                      variant={member.role === 'admin' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
