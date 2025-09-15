
'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { AnalyticsContent } from '@/components/analytics-content'
import { MusoAiAnalytics } from '@/components/muso-ai-analytics'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { AnalyticsSkeleton } from '@/components/analytics-skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface ArtistAnalyticsDashboardProps {
  artist: {
    id: string;
    spotify_artist_id: string;
  } | null;
}

export function ArtistAnalyticsDashboard({ artist }: ArtistAnalyticsDashboardProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  if (!artist) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No artist data provided.</p>
      </div>
    )
  }

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
        window.location.reload(); 
      } else {
        const errorDetails = data.results?.find((r: any) => r.status === 'failed')?.error || data.error || "Failed to synchronize data.";
        throw new Error(errorDetails);
      }
    } catch (err: any) {
      toast({
        title: "Muso.AI Sync Failed",
        description: err.message,
        variant: "destructive",
        duration: 9000,
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <>
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
      <Tabs defaultValue="spotify" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="spotify">Spotify Analytics</TabsTrigger>
          <TabsTrigger value="musoai">Muso.AI Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="spotify">
          <Suspense fallback={<AnalyticsSkeleton />}>
            {artist.spotify_artist_id ? (
              <AnalyticsContent artistId={artist.spotify_artist_id} />
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No Spotify Artist ID found for this artist.</p>
              </div>
            )}
          </Suspense>
        </TabsContent>
        <TabsContent value="musoai">
          <Suspense fallback={<AnalyticsSkeleton />}>
            {artist.id ? (
              <MusoAiAnalytics artistId={artist.id} />
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No Artist Profile found in database.</p>
              </div>
            )}
          </Suspense>
        </TabsContent>
      </Tabs>
    </>
  )
}
