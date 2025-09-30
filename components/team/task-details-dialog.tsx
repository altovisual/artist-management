'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  User, 
  Flag, 
  CheckCircle2, 
  Clock,
  Trash2,
  Save
} from "lucide-react"
import { format } from 'date-fns'

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

interface TaskDetailsDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  teamMembers: TeamMember[]
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask?: (taskId: string) => void
}

export function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
  teamMembers,
  onUpdateTask,
  onDeleteTask
}: TaskDetailsDialogProps) {
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        dueDate: task.dueDate
      })
    }
  }, [task])

  if (!task) return null

  const handleSave = () => {
    if (onUpdateTask) {
      onUpdateTask(task.id, editedTask)
    }
    setIsEditing(false)
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (onDeleteTask && confirm('Are you sure you want to delete this task?')) {
      onDeleteTask(task.id)
      onOpenChange(false)
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-500'
      case 'in_progress': return 'bg-blue-500'
      case 'in_review': return 'bg-yellow-500'
      case 'completed': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'To Do'
      case 'in_progress': return 'In Progress'
      case 'in_review': return 'In Review'
      case 'completed': return 'Completed'
      default: return 'Unknown'
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Task Details
          </DialogTitle>
          <DialogDescription>
            View and edit task information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            {isEditing ? (
              <Input
                id="title"
                value={editedTask.title || ''}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                placeholder="Task title"
              />
            ) : (
              <h3 className="text-lg font-semibold">{task.title}</h3>
            )}
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {isEditing ? (
                <Select
                  value={editedTask.status}
                  onValueChange={(value: Task['status']) => 
                    setEditedTask({ ...editedTask, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                  <span className="text-sm font-medium">{getStatusLabel(task.status)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              {isEditing ? (
                <Select
                  value={editedTask.priority}
                  onValueChange={(value: Task['priority']) => 
                    setEditedTask({ ...editedTask, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={getPriorityColor(task.priority)} className="w-fit">
                  <Flag className="h-3 w-3 mr-1" />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="Task description"
                rows={4}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          <Separator />

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="assignee">Assigned To</Label>
            {isEditing ? (
              <Select
                value={editedTask.assignee?.id || 'unassigned'}
                onValueChange={(value) => {
                  const member = teamMembers.find(m => m.id === value)
                  setEditedTask({ ...editedTask, assignee: member })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div>
                {task.assignee ? (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={task.assignee.avatar} />
                      <AvatarFallback>
                        {task.assignee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{task.assignee.name}</p>
                      <p className="text-xs text-muted-foreground">{task.assignee.email}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {task.assignee.role}
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Unassigned</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            {isEditing ? (
              <Input
                id="dueDate"
                type="date"
                value={editedTask.dueDate ? format(editedTask.dueDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined
                  setEditedTask({ ...editedTask, dueDate: date })
                }}
              />
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {task.dueDate ? (
                  <span>{format(task.dueDate, 'PPP')}</span>
                ) : (
                  <span className="text-muted-foreground">No due date set</span>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Created {format(task.createdAt, 'PPp')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Task
          </Button>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    setEditedTask({
                      title: task.title,
                      description: task.description,
                      status: task.status,
                      priority: task.priority,
                      assignee: task.assignee,
                      dueDate: task.dueDate
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Task
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
