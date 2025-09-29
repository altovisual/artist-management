'use client'

import { Button } from "@/components/ui/button"
import { PlusCircle, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"
import { AnimatedTitle } from "@/components/animated-title"

interface HeroSectionProps {
  userName?: string
  userRole?: string
  totalArtists: number
  activeProjects: number
}

export function HeroSection({ userName, userRole, totalArtists, activeProjects }: HeroSectionProps) {
  const isAdmin = userRole === 'admin'
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-sm">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 transform" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 transform" />
      </div>
      
      {/* Content */}
      <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="flex flex-col gap-6 lg:gap-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-primary">
                {isAdmin ? 'Admin Dashboard' : 'Artist Management'}
              </span>
            </div>
            
            <div className="space-y-2">
              <AnimatedTitle 
                text={`Welcome back${userName ? `, ${userName}` : ''}!`}
                level={1} 
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
              />
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                {isAdmin 
                  ? `Managing ${totalArtists} artists across the platform with ${activeProjects} active projects.`
                  : `You're managing ${totalArtists} artists with ${activeProjects} active projects. Keep building your music empire.`
                }
              </p>
            </div>
          </div>

          {/* Stats and Actions Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            {/* Quick Stats */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium">{totalArtists}</p>
                  <p className="text-xs text-muted-foreground">Artists</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-secondary/10">
                  <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium">{activeProjects}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 w-full xs:w-auto">
                <Link href="/artists/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">New Artist</span>
                  <span className="xs:hidden">New</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="w-full xs:w-auto">
                <Link href="/dashboard/analytics">
                  <span className="hidden sm:inline">View Analytics</span>
                  <span className="sm:hidden">Analytics</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
