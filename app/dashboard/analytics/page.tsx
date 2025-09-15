'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { AnalyticsSkeleton } from '@/components/analytics-skeleton'
import { ArtistAnalyticsDashboard } from '@/components/artist-analytics-dashboard'

interface ArtistData {
  id: string;
  spotify_artist_id: string;
}

export default function AnalyticsPage() {
  const [artist, setArtist] = useState<ArtistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          throw new Error('User not logged in.')
        }

        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('id, spotify_artist_id')
          .eq('user_id', user.id)
          .single()

        if (artistError || !artistData) {
          throw new Error('Could not find artist profile for the current user.')
        }

        setArtist(artistData)
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "Error loading analytics",
          description: err.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchArtist()
  }, [supabase, toast])

  if (loading) {
    return (
      <DashboardLayout>
        <AnalyticsSkeleton />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-destructive font-semibold">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <ArtistAnalyticsDashboard artist={artist} />
    </DashboardLayout>
  )
}