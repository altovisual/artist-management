'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, MessageCircle, FolderOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

interface TeamMember {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  role: string
}

interface TeamProject {
  id: string
  name: string
  tasksCount: number
  status: 'active' | 'completed'
}

interface TeamWidgetProps {
  teamMembers: TeamMember[]
  activeProjects: TeamProject[]
  className?: string
}

export function TeamWidget({ teamMembers, activeProjects, className }: TeamWidgetProps) {
  const onlineMembers = teamMembers.filter(member => member.isOnline)
  const activeProjectsCount = activeProjects.filter(p => p.status === 'active').length

  return (
    <Card className={className}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Team Workspace</h3>
          </div>
          <Link href="/team">
            <Button variant="ghost" size="sm" className="gap-2">
              Open <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{onlineMembers.length}</div>
            <div className="text-sm text-muted-foreground">Online Now</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{activeProjectsCount}</div>
            <div className="text-sm text-muted-foreground">Active Projects</div>
          </div>
        </div>

        {/* Online Team Members */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Team Online</h4>
            <Badge variant="secondary" className="text-xs">
              {onlineMembers.length}/{teamMembers.length}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {onlineMembers.slice(0, 6).map(member => (
              <div key={member.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate max-w-20">{member.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </div>
              </div>
            ))}
            
            {onlineMembers.length > 6 && (
              <div className="flex items-center justify-center p-2 bg-muted/30 rounded-lg min-w-[60px]">
                <span className="text-xs text-muted-foreground">
                  +{onlineMembers.length - 6} more
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Recent Projects</h4>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            {activeProjects.slice(0, 3).map(project => (
              <div key={project.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium truncate">{project.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {project.tasksCount} tasks
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link href="/team" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <FolderOpen className="h-4 w-4" />
              View Projects
            </Button>
          </Link>
          <Link href="/team" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <MessageCircle className="h-4 w-4" />
              Team Chat
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

// Datos de ejemplo para el widget
export const mockTeamData = {
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
      name: 'Mike Wilson',
      avatar: undefined,
      isOnline: false,
      role: 'member'
    },
    {
      id: '4',
      name: 'Emily Davis',
      avatar: undefined,
      isOnline: true,
      role: 'member'
    },
    {
      id: '5',
      name: 'Alex Rodriguez',
      avatar: undefined,
      isOnline: false,
      role: 'manager'
    }
  ],
  activeProjects: [
    {
      id: '1',
      name: 'John - SaaS Website',
      tasksCount: 4,
      status: 'active' as const
    },
    {
      id: '2',
      name: 'Metrica - CRM Web App',
      tasksCount: 2,
      status: 'active' as const
    },
    {
      id: '3',
      name: 'Stylee - Fashion Landing',
      tasksCount: 2,
      status: 'active' as const
    },
    {
      id: '4',
      name: 'Frey - Banking Mobile App',
      tasksCount: 2,
      status: 'active' as const
    }
  ]
}
