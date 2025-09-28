'use client'

import { TeamWorkspace } from '@/components/team/team-workspace'
import { useTeamWorkspace } from '@/hooks/use-team-workspace'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeamPage() {
  const {
    projects,
    teamMembers,
    currentUser,
    isLoading,
    createProject,
    updateProject,
    createTask,
    updateTask,
    toggleFavorite
  } = useTeamWorkspace()

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
    // Aquí podrías abrir un modal o navegar a una página de creación
    console.log('Create new project')
  }

  const handleNewTask = (projectId: string) => {
    // Aquí podrías abrir un modal para crear una nueva tarea
    console.log('Create new task for project:', projectId)
  }

  const handleProjectSelect = (project: any) => {
    console.log('Selected project:', project.name)
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] overflow-hidden -mx-4 -my-6">
        <TeamWorkspace
          currentUser={currentUser}
          projects={projects}
          teamMembers={teamMembers}
          onProjectSelect={handleProjectSelect}
          onTaskUpdate={updateTask}
          onNewProject={handleNewProject}
          onNewTask={handleNewTask}
        />
      </div>
    </DashboardLayout>
  )
}
