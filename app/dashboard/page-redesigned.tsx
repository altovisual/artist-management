'use client'

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { 
  PageHeader, 
  StatsGrid, 
  ContentSection, 
  PageLayout,
  DataTable 
} from "@/components/ui/design-system"
import { 
  Users, 
  Music, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Award,
  Plus,
  Edit,
  Trash2,
  Eye
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function DashboardRedesigned() {
  const [artists, setArtists] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    
    try {
      const [artistsRes, projectsRes] = await Promise.all([
        supabase.from('artists').select('*').limit(5),
        supabase.from('projects').select('*').limit(5)
      ])

      setArtists(artistsRes.data || [])
      setProjects(projectsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Stats data
  const statsData = [
    {
      title: "Total Artists",
      value: artists.length,
      change: "+12%",
      changeType: 'positive' as const,
      icon: Users,
      description: "Active profiles"
    },
    {
      title: "Active Projects", 
      value: projects.length,
      change: "+8%",
      changeType: 'positive' as const,
      icon: Music,
      description: "In development"
    },
    {
      title: "Monthly Revenue",
      value: "$15,420",
      change: "+23%",
      changeType: 'positive' as const,
      icon: DollarSign,
      description: "This month",
      colSpan: 2
    },
    {
      title: "Growth Rate",
      value: "+18.2%",
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: "vs last month"
    },
    {
      title: "Upcoming Releases",
      value: 8,
      icon: Calendar,
      description: "Next 30 days"
    }
  ]

  // Table columns
  const artistColumns = [
    { 
      key: 'profile_image', 
      label: 'Avatar',
      render: (value: string, item: any) => (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-medium text-primary">
            {item.name?.[0] || '?'}
          </span>
        </div>
      )
    },
    { key: 'name', label: 'Name' },
    { key: 'genre', label: 'Genre' },
    { 
      key: 'created_at', 
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ]

  const projectColumns = [
    { key: 'name', label: 'Project' },
    { key: 'type', label: 'Type' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'completed' ? 'bg-green-100 text-green-700' :
          value === 'in_progress' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'release_date', 
      label: 'Release Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : 'TBD'
    }
  ]

  // Table actions
  const artistActions = [
    {
      label: 'View',
      onClick: (item: any) => window.location.href = `/artists/${item.id}`,
      icon: Eye
    },
    {
      label: 'Edit',
      onClick: (item: any) => window.location.href = `/artists/${item.id}/edit`,
      icon: Edit
    },
    {
      label: 'Delete',
      onClick: (item: any) => console.log('Delete', item),
      icon: Trash2,
      variant: 'destructive' as const
    }
  ]

  const projectActions = [
    {
      label: 'View',
      onClick: (item: any) => console.log('View project', item),
      icon: Eye
    },
    {
      label: 'Edit',
      onClick: (item: any) => console.log('Edit project', item),
      icon: Edit
    }
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageLayout spacing="normal">
        {/* Page Header */}
        <PageHeader
          title="Welcome back!"
          subtitle="Artist Management Dashboard"
          description={`Managing ${artists.length} artists across the platform with ${projects.length} active projects.`}
          badge={{
            text: "Admin Dashboard",
            variant: 'secondary'
          }}
          actions={[
            {
              label: "New Artist",
              href: "/artists/new",
              variant: 'default',
              icon: Plus
            },
            {
              label: "View Analytics",
              href: "/analytics",
              variant: 'outline',
              icon: TrendingUp
            }
          ]}
        />

        {/* Stats Grid */}
        <StatsGrid stats={statsData} columns={6} />

        {/* Artists Section */}
        <ContentSection
          title="Recent Artists"
          description="Latest artist profiles added to the platform"
          icon={Users}
          actions={[
            {
              label: "View All",
              href: "/artists",
              variant: 'outline'
            },
            {
              label: "Add Artist",
              href: "/artists/new",
              icon: Plus
            }
          ]}
        >
          <DataTable
            data={artists}
            columns={artistColumns}
            actions={artistActions}
            emptyState={{
              title: "No artists found",
              description: "Create your first artist profile to get started",
              icon: Users
            }}
          />
        </ContentSection>

        {/* Projects Section */}
        <ContentSection
          title="Active Projects"
          description="Current music projects in development"
          icon={Music}
          actions={[
            {
              label: "View All",
              href: "/projects",
              variant: 'outline'
            },
            {
              label: "New Project",
              href: "/projects/new",
              icon: Plus
            }
          ]}
        >
          <DataTable
            data={projects}
            columns={projectColumns}
            actions={projectActions}
            emptyState={{
              title: "No projects found",
              description: "Start your first music project",
              icon: Music
            }}
          />
        </ContentSection>
      </PageLayout>
    </DashboardLayout>
  )
}
