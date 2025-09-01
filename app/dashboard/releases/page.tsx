'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from 'next/navigation'
import { ReleaseCalendar } from "@/components/release-calendar"
import { DashboardLayout } from "@/components/dashboard-layout"

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

export default function ReleasesPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const searchParams = useSearchParams();
  const initialArtistId = searchParams.get('artistId');

  const [events, setEvents] = useState<ReleaseEvent[]>([])
  const [artists, setArtists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
          allDay: true, // Assuming releases are all-day events
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

  return (
    <DashboardLayout>
      <ReleaseCalendar
        initialEvents={events}
        initialArtists={artists}
        initialArtistId={initialArtistId}
        isLoading={isLoading}
      />
    </DashboardLayout>
  )
}