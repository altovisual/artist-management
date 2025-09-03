'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Users, Music, Disc, Bug } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from '@/components/ui/button'

// --- Interfaces for the new data structure ---
interface ArtistProfile {
  name: string;
  followers: number;
  imageUrl: string;
  genres: string[];
}

interface TopTrack {
  id: string;
  name: string;
  album: { name: string; images: { url: string }[] };
  external_urls: { spotify: string };
  popularity: number;
}

interface Album {
  id: string;
  name: string;
  album_type: string;
  release_date: string;
  images: { url: string }[];
  external_urls: { spotify: string };
}

interface AnalyticsData {
  artist: ArtistProfile;
  topTracks: TopTrack[];
  albums: Album[];
}

const AnalyticsContent = () => {
  const searchParams = useSearchParams()
  const status = searchParams.get('status')
  const message = searchParams.get('message')
  const supabase = createClient()

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawError, setRawError] = useState<any>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      setError(null)
      setRawError(null)
      try {
        const { data, error: invokeError } = await supabase.functions.invoke('fetch-spotify-analytics')

        if (invokeError) {
          setRawError(invokeError)
          throw new Error(invokeError.message)
        }
        
        if (data.error) {
          setRawError(data.error)
          throw new Error(data.error)
        }

        setAnalyticsData(data)
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [supabase])

  // ... renderStatusAlert function ...

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-4 text-muted-foreground">Fetching your Spotify analytics...</p>
      </div>
    )
  }

  // Always render the debug section if there is an error
  if (error) {
    return (
        <div className="space-y-6">
            <div className="text-center py-16">
                <p className="text-destructive font-semibold">Failed to load analytics</p>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
            <DebugSection error={rawError} data={analyticsData} />
        </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No data available.</p>
      </div>
    )
  }

  const { artist, topTracks, albums } = analyticsData;

  return (
    <div className="space-y-6">
      {/* ... status alert ... */}
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Image 
            src={artist.imageUrl || '/placeholder.svg'} 
            alt={artist.name} 
            width={80} 
            height={80} 
            className="rounded-full"
          />
          <div>
            <CardTitle className="text-2xl font-bold">{artist.name}</CardTitle>
            <div className="flex items-center gap-4 text-muted-foreground mt-1">
                <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{artist.followers.toLocaleString()} Followers</span>
                </div>
            </div>
             <div className="flex flex-wrap gap-2 mt-2">
              {artist.genres.map(genre => <Badge key={genre} variant="secondary" className="capitalize">{genre}</Badge>)}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(topTracks && topTracks.length > 0) && (
            <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><Music className="h-5 w-5"/> Top Tracks</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead className="w-[20px]">#</TableHead><TableHead>Track</TableHead><TableHead>Album</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {topTracks.map((track, index) => (
                            <TableRow key={track.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell><a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{track.name}</a></TableCell>
                                <TableCell className="text-muted-foreground">{track.album.name}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}

        {(albums && albums.length > 0) && (
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Disc className="h-5 w-5"/> Latest Releases</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {albums.map(album => (
                    <a key={album.id} href={album.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <Image src={album.images[0]?.url || '/placeholder.svg'} alt={album.name} width={48} height={48} className="rounded-md"/>
                        <div>
                        <p className="font-semibold leading-tight">{album.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{album.album_type} &middot; {new Date(album.release_date).getFullYear()}</p>
                        </div>
                    </a>
                    ))}
                </CardContent>
            </Card>
        )}
      </div>

      <DebugSection error={rawError} data={analyticsData} />
    </div>
  )
}

const DebugSection = ({ error, data }: { error: any, data: any }) => {
    return (
        <Collapsible className="mt-8">
            <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm"><Bug className="h-4 w-4 mr-2"/> Show Debug Info</Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <Card className="mt-2">
                    <CardHeader><CardTitle>Raw Data Response</CardTitle></CardHeader>
                    <CardContent>
                        {error && (
                            <>
                                <h4 className="font-semibold text-red-500">Error:</h4>
                                <pre className="mt-2 rounded-md bg-slate-950 p-4 text-slate-50 text-sm overflow-x-auto"><code>{JSON.stringify(error, null, 2)}</code></pre>
                            </>
                        )}
                        {data && (
                             <>
                                <h4 className="font-semibold mt-4">Data:</h4>
                                <pre className="mt-2 rounded-md bg-slate-950 p-4 text-slate-50 text-sm overflow-x-auto"><code>{JSON.stringify(data, null, 2)}</code></pre>
                            </>
                        )}
                    </CardContent>
                </Card>
            </CollapsibleContent>
        </Collapsible>
    )
}

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <AnalyticsContent />
      </Suspense>
    </DashboardLayout>
  )
}