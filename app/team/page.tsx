'use client'

import { TeamWorkspace } from '@/components/team/team-workspace'
import { useTeamWorkspaceReal } from '@/hooks/use-team-workspace-real'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton'
import { AddTeamMemberDialog } from '@/components/team/add-team-member-dialog'
import { CreateTaskDialog } from '@/components/team/create-task-dialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function TeamPage() {
  const {
    projects,
    teamMembers,
    currentUser,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleFavorite,
    updateProjectStatus
  } = useTeamWorkspaceReal()
  
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [selectedProjectForTask, setSelectedProjectForTask] = useState<string | null>(null)
  const { toast } = useToast()

  if (isLoading || !currentUser) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-8rem)] -mx-4 -my-6">
          {/* Sidebar Skeleton */}
          <div className="w-80 border-r bg-muted/20 p-4 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleNewProject = () => {
    // Si hay proyectos, usar el primero como default
    // Si no, mostrar mensaje para crear un proyecto primero
    if (projects.length > 0) {
      setSelectedProjectForTask(projects[0].id)
      setIsCreateTaskOpen(true)
    } else {
      toast({
        title: 'No Projects Available',
        description: 'Please create a project first (add an artist) to create tasks.',
        variant: 'destructive'
      })
    }
  }

  const handleNewTask = async (projectId: string, taskData: any) => {
    await createTask(projectId, taskData)
  }

  const handleProjectSelect = (project: any) => {
    console.log('Selected project:', project.name)
  }

  const handleAddTeamMember = () => {
    setIsAddMemberOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 px-4 lg:px-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Team Workspace</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Collaborate on projects and manage tasks with your team
          </p>
        </div>
        <Button onClick={handleAddTeamMember} className="gap-2 w-full sm:w-auto">
          <UserPlus className="h-4 w-4" />
          Add Team Member
        </Button>
      </div>
      
      <div className="h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)] overflow-hidden -mx-4">
        <TeamWorkspace
          currentUser={currentUser}
          projects={projects}
          teamMembers={teamMembers}
          onProjectSelect={handleProjectSelect}
          onTaskUpdate={updateTask}
          onNewProject={handleNewProject}
          onNewTask={handleNewTask}
          onToggleFavorite={toggleFavorite}
          onUpdateProjectStatus={updateProjectStatus}
        />
      </div>

      <AddTeamMemberDialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
      />

      {selectedProjectForTask && (
        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          projectId={selectedProjectForTask}
          projectName={projects.find(p => p.id === selectedProjectForTask)?.name || 'Project'}
          teamMembers={teamMembers}
          onCreateTask={handleNewTask}
        />
      )}
    </DashboardLayout>
  )
}
