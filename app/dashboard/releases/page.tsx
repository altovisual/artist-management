'use client'

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from 'next/navigation'
import { ReleaseCalendar } from "@/components/release-calendar"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageHeader } from "@/components/ui/design-system/page-header"
import { StatsGrid } from "@/components/ui/design-system/stats-grid"
import { ContentSection } from "@/components/ui/design-system/content-section"
import { Music, Calendar, TrendingUp, Clock, Rocket, PlusCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type ProjectRow = {
  id: string | number
  name: string
  release_date: string
  type: string
  status: string
  cover_art_url?: string | null
  notes?: string | null
  music_file_url?: string | null
  artist_id: string;
}

type ReleaseEvent = {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource: ProjectRow
}

function ReleasesPageContent() {
  const supabase = createClient()
  const { toast } = useToast()
  const searchParams = useSearchParams();
  const initialArtistId = searchParams.get('artistId');

  const [events, setEvents] = useState<ReleaseEvent[]>([])
  const [artists, setArtists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      const { data: releasesData, error: releasesError } = await supabase
        .from("projects")
        .select("*")
        .order("release_date", { ascending: true })

      if (releasesError) {
        console.error("Error fetching releases:", releasesError)
        toast({
          title: "Error",
          description: "Could not load releases.",
          variant: "destructive",
        })
      } else {
        const formattedEvents = (releasesData || []).map((row: ProjectRow) => ({
          id: String(row.id),
          title: row.name,
          start: new Date(row.release_date),
          end: new Date(row.release_date),
          allDay: true,
          resource: row,
        }));
        setEvents(formattedEvents);
      }

      const { data: artistsData, error: artistsError } = await supabase
        .from("artists")
        .select("id, name")
        .order("name", { ascending: true })

      if (artistsError) {
        console.error("Error fetching artists:", artistsError)
        toast({
          title: "Error",
          description: "Could not load artists.",
          variant: "destructive",
        })
      } else {
        setArtists(artistsData || [])
      }
      setIsLoading(false)
    }

    fetchInitialData()
  }, [supabase, toast])

  // Calculate stats
  const getStats = () => {
    const today = new Date()
    const upcoming = events.filter(e => new Date(e.start) > today)
    const thisMonth = events.filter(e => {
      const date = new Date(e.start)
      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
    })
    const completed = events.filter(e => e.resource.status === 'released' || e.resource.status === 'completed')
    const pending = events.filter(e => e.resource.status === 'pending' || e.resource.status === 'in_progress')

    return {
      total: events.length,
      upcoming: upcoming.length,
      thisMonth: thisMonth.length,
      completed: completed.length,
      pending: pending.length
    }
  }

  const stats = getStats()

  const statsData = [
    {
      title: 'Total Releases',
      value: stats.total.toString(),
      change: '+12.5%',
      trend: 'up' as const,
      icon: Music,
      description: 'All time releases'
    },
    {
      title: 'Upcoming',
      value: stats.upcoming.toString(),
      change: `+${stats.thisMonth}`,
      trend: 'up' as const,
      icon: Rocket,
      description: 'Scheduled releases'
    },
    {
      title: 'This Month',
      value: stats.thisMonth.toString(),
      change: 'active',
      trend: 'stable' as const,
      icon: Calendar,
      description: 'Releases this month'
    },
    {
      title: 'Completed',
      value: stats.completed.toString(),
      change: '+8.2%',
      trend: 'up' as const,
      icon: TrendingUp,
      description: 'Successfully released'
    }
  ]

  // Get upcoming releases for quick view
  const upcomingReleases = events
    .filter(e => new Date(e.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Release Management"
          description="Plan, schedule, and track all your music releases in one place"
          badge={{
            text: `${stats.upcoming} Upcoming`,
            variant: 'default' as const
          }}
          actions={[
            {
              label: 'Add Release',
              onClick: () => setShowAddModal(true),
              variant: 'default',
              icon: PlusCircle
            }
          ]}
        />

        {/* Stats Grid */}
        <StatsGrid stats={statsData} columns={4} />

        {/* Upcoming Releases Highlight */}
        {upcomingReleases.length > 0 && (
          <ContentSection
            title="Next Releases"
            description="Your upcoming releases at a glance"
            icon={Rocket}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingReleases.map((release) => (
                <Card key={release.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          {release.resource.type || 'Release'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {new Date(release.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {release.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {Math.ceil((new Date(release.start).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(release.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ContentSection>
        )}

        {/* Calendar Section */}
        <ContentSection
          title="Release Calendar"
          description="Visual timeline of all your releases"
          icon={Calendar}
        >
          <ReleaseCalendar
            initialEvents={events}
            initialArtists={artists}
            initialArtistId={initialArtistId}
            isLoading={isLoading}
            showAddModal={showAddModal}
            onCloseAddModal={() => setShowAddModal(false)}
          />
        </ContentSection>
      </div>
    </DashboardLayout>
  )
}

export default function ReleasesPage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="flex items-center justify-center h-screen">Loading...</div></DashboardLayout>}>
      <ReleasesPageContent />
    </Suspense>
  )
}