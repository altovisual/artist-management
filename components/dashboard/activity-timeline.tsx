'use client'

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Music, FileText, Award } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  type: 'artist_created' | 'project_added' | 'contract_signed' | 'release_scheduled'
  title: string
  description: string
  timestamp: Date
  user?: {
    name: string
    avatar?: string
  }
  metadata?: {
    artistName?: string
    projectName?: string
    contractType?: string
  }
}

interface ActivityTimelineProps {
  activities: ActivityItem[]
  className?: string
}

export function ActivityTimeline({ activities, className }: ActivityTimelineProps) {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'artist_created':
        return User
      case 'project_added':
        return Music
      case 'contract_signed':
        return FileText
      case 'release_scheduled':
        return Award
      default:
        return Clock
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'artist_created':
        return 'bg-blue-500'
      case 'project_added':
        return 'bg-green-500'
      case 'contract_signed':
        return 'bg-purple-500'
      case 'release_scheduled':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getActivityBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'artist_created':
        return { text: 'New Artist', variant: 'default' as const }
      case 'project_added':
        return { text: 'Project', variant: 'secondary' as const }
      case 'contract_signed':
        return { text: 'Contract', variant: 'outline' as const }
      case 'release_scheduled':
        return { text: 'Release', variant: 'destructive' as const }
      default:
        return { text: 'Activity', variant: 'default' as const }
    }
  }

  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
        <p className="text-muted-foreground">Activity will appear here as you manage your artists and projects.</p>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold">Recent Activity</h3>
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type)
            const colorClass = getActivityColor(activity.type)
            const badge = getActivityBadge(activity.type)
            
            return (
              <div key={activity.id} className="relative flex gap-3 sm:gap-4">
                {/* Timeline Line */}
                {index < activities.length - 1 && (
                  <div className="absolute left-4 sm:left-6 top-10 sm:top-12 w-px h-4 sm:h-6 bg-border" />
                )}
                
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full ${colorClass} flex items-center justify-center`}>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <h4 className="font-medium text-xs sm:text-sm truncate">{activity.title}</h4>
                          <Badge variant={badge.variant} className="text-xs w-fit">
                            {badge.text}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                      
                      {/* Time and User - Mobile: Below content, Desktop: Right side */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground mt-2 sm:mt-0">
                        {activity.user && (
                          <div className="flex items-center gap-1">
                            <Avatar className="h-3 w-3 sm:h-4 sm:w-4">
                              <AvatarImage src={activity.user.avatar} />
                              <AvatarFallback className="text-xs">
                                {activity.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-20 sm:max-w-none">{activity.user.name}</span>
                          </div>
                        )}
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="flex flex-wrap gap-1 sm:gap-2 text-xs text-muted-foreground">
                        {activity.metadata.artistName && (
                          <span className="bg-muted px-1.5 py-0.5 rounded">Artist: {activity.metadata.artistName}</span>
                        )}
                        {activity.metadata.projectName && (
                          <span className="bg-muted px-1.5 py-0.5 rounded">Project: {activity.metadata.projectName}</span>
                        )}
                        {activity.metadata.contractType && (
                          <span className="bg-muted px-1.5 py-0.5 rounded">Type: {activity.metadata.contractType}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
