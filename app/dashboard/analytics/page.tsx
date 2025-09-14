'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AnalyticsContent } from '@/components/analytics-content'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { AnalyticsSkeleton } from '@/components/analytics-skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'

export default function AnalyticsPage() {
  const [spotifyArtistId, setSpotifyArtistId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchArtistId = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          throw new Error('User not logged in.')
        }

        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('spotify_artist_id')
          .eq('user_id', user.id)
          .single()

        if (artistError || !artistData) {
          throw new Error('Could not find artist profile for the current user or Spotify Artist ID is not set.')
        }

        if (!artistData.spotify_artist_id) {
          throw new Error('Spotify Artist ID is not set for your artist profile. Please update your profile.')
        }

        setSpotifyArtistId(artistData.spotify_artist_id)
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

    fetchArtistId()
  }, [supabase, toast])

  const handleSyncMusoAIData = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/muso-ai/sync')
      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Muso.AI Sync Successful",
          description: data.message || "Data synchronized successfully.",
        })
      } else {
        throw new Error(data.error || "Failed to synchronize data.")
      }
    } catch (err: any) {
      toast({
        title: "Muso.AI Sync Failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

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
          <p className="text-sm text-muted-foreground mt-2">Please ensure your artist profile has a Spotify Artist ID set.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex justify-end mb-4">
        <Button onClick={handleSyncMusoAIData} disabled={isSyncing}>
          {isSyncing ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> Syncing...
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" /> Sync Muso.AI Data
            </>
          )}
        </Button>
      </div>
      <Suspense fallback={<AnalyticsSkeleton />}>
        {spotifyArtistId ? (
          <AnalyticsContent artistId={spotifyArtistId} />
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No Spotify Artist ID found for your profile.</p>
            <p className="text-sm text-muted-foreground mt-2">Please update your artist profile with your Spotify Artist ID.</p>
          </div>
        )}
      </Suspense>
    </DashboardLayout>
  )
}
