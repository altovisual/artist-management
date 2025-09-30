'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'member'
  isOnline: boolean
}

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'in_review' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee?: TeamMember
  dueDate?: Date
  createdAt: Date
}

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const isCompleted = task.status === 'completed'

  return (
    <Card 
      className={`p-4 cursor-pointer hover:shadow-md transition-shadow group ${isCompleted ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className={`font-medium text-sm flex-1 ${isCompleted ? 'line-through' : ''}`}>
          {task.title}
        </h4>
        <Badge variant={getPriorityColor(task.priority)} className="text-xs">
          {task.priority}
        </Badge>
      </div>
      
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={task.assignee.avatar} />
              <AvatarFallback className="text-xs">
                {task.assignee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        )}
        
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
