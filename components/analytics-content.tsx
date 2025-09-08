'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Users, Music, Disc, Bug, Star, ChevronDown, ChevronUp, SproutIcon, BarChart, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
// import { SpotifyConnectModal } from './spotify-connect-modal' // No longer needed for public analytics
import { TrackPopularityChart } from '@/components/ui/glowing-line'
import { GenreDistributionChart } from '@/components/ui/genre-distribution-chart'
import { AnalyticsSkeleton } from './analytics-skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

// --- Interfaces ---
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

interface AnalyticsContentProps {
  artistId?: string;
}

export const AnalyticsContent = ({ artistId }: AnalyticsContentProps) => {
  const searchParams = useSearchParams()
  const status = searchParams.get('status')
  const message = searchParams.get('message')
  const supabase = createClient()

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawError, setRawError] = useState<any>(null)
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [embedTrackId, setEmbedTrackId] = useState<string | null>(null);

  const genreDistribution = React.useMemo(() => {
    if (!analyticsData?.topTracks) return [];
    const genreCounts = analyticsData.topTracks.reduce((acc, track) => {
      const genres = (track as any).album?.genres || []; 
      genres.forEach((genre: string) => {
        const formattedGenre = genre.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        acc[formattedGenre] = (acc[formattedGenre] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(genreCounts).length === 0 && analyticsData.artist?.genres) {
      analyticsData.artist.genres.forEach(genre => {
        const formattedGenre = genre.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        genreCounts[formattedGenre] = 1;
      });
    }

    return Object.entries(genreCounts)
      .map(([name, value]) => ({ genre: name, count: value }))
      .sort((a, b) => b.count - a.count);
  }, [analyticsData?.topTracks, analyticsData?.artist?.genres]);

  const genreChartConfig = React.useMemo(() => {
    if (!genreDistribution) return {};
    return Object.fromEntries(
        genreDistribution.map(({ genre }, index) => [
            genre,
            { color: `hsl(var(--chart-${(index % 5) + 1}))` }
        ])
    );
  }, [genreDistribution]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      setError(null)
      setRawError(null)
      try {
        if (!artistId) {
          throw new Error('No artist ID provided for analytics.');
        }
        const { data, error: invokeError } = await supabase.functions.invoke('fetch-spotify-analytics', {
          body: { artist_id: artistId },
        });

        if (invokeError) {
          throw new Error(invokeError.message);
        }

        if (data.error) {
          throw new Error(data.error)
        }

        setAnalyticsData(data)
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.')
        setRawError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [supabase, artistId])

  const renderStatusAlert = () => {
    if (status === 'success') {
      return (
        <Alert variant="default" className="mb-6 bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Connection Successful!</AlertTitle>
          <AlertDescription>
            Your Spotify account has been connected successfully. Your analytics will start syncing soon.
          </AlertDescription>
        </Alert>
      )
    }

    if (status === 'error') {
      return (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription>
            {message || 'An unknown error occurred. Please try connecting your account again.'}
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

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
  const visibleTracks = showAllTracks ? topTracks : topTracks.slice(0, 10);

  return (
    <>
      <div className="space-y-6">
        {!artistId && renderStatusAlert()}
        
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 space-y-0">
            <Image 
              src={artist.imageUrl || '/placeholder.svg'} 
              alt={artist.name} 
              width={100} 
              height={100} 
              className="rounded-full border-4 border-background shadow-lg"
            />
            <div className="flex-grow">
              <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-3">
                {artist.name}
                <Image src="/icono-spoty.svg" alt="Spotify" width={28} height={28} className="inline-block" />
              </CardTitle>
              <div className="flex items-center gap-6 text-muted-foreground mt-2">
                  <div className="flex items-center gap-1.5">
                      <Users className="h-5 w-5" />
                      <span className="font-semibold">{artist.followers.toLocaleString()}</span>
                      <span className="text-sm">Followers</span>
                  </div>
              </div>
               <div className="flex flex-wrap gap-2 mt-3">
                {artist.genres.map(genre => <Badge key={genre} variant="secondary" className="capitalize text-sm">{genre}</Badge>)}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
              {(topTracks && topTracks.length > 0) && (
                  <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Music className="h-5 w-5"/> Top Tracks
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                          <div className="space-y-2">
                              {visibleTracks.map((track) => (
                                 <div 
                                  key={track.id} 
                                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                                >
                                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                                      <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={() => setEmbedTrackId(track.id)}
                                      >
                                          <PlayCircle className="h-6 w-6" />
                                      </Button>
                                  </div>
                                  <Image 
                                      src={track.album.images[0]?.url || '/placeholder.svg'} 
                                      alt={track.album.name} 
                                      width={48} 
                                      height={48} 
                                      className="w-12 h-12 object-cover rounded-md"
                                  />
                                  <div className="flex-grow overflow-hidden">
                                      <p className="font-semibold whitespace-nowrap truncate text-sm sm:text-base">{track.name}</p>
                                      <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap truncate">{track.album.name}</p>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground w-20 sm:w-24 justify-end">
                                      <Star className="h-4 w-4 text-yellow-400"/>
                                      <span>{track.popularity}</span>
                                      <Progress value={track.popularity} className="w-8 sm:w-12 h-1.5" />
                                  </div>
                                  <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="ml-2">
                                      <Button variant="ghost" size="icon">
                                          <Image src="/icono-spoty.svg" alt="Spotify" width={20} height={20} />
                                      </Button>
                                  </a>
                                </div>
                              ))}
                          </div>
                          {topTracks.length > 10 && (
                              <div className="text-center mt-4">
                                  <Button variant="ghost" onClick={() => setShowAllTracks(!showAllTracks)}>
                                      {showAllTracks ? (
                                          <><ChevronUp className="h-4 w-4 mr-2"/> Show Less</>
                                      ) : (
                                          <><ChevronDown className="h-4 w-4 mr-2"/> Show All {topTracks.length} Tracks</>
                                      )}
                                  </Button>
                              </div>
                          )}
                      </CardContent>
                  </Card>
              )}
          </div>

          <div className="lg:col-span-1">
              {(topTracks && topTracks.length > 0) && (
                  <TrackPopularityChart 
                      data={topTracks.slice(0, 5).map(track => ({ date: track.name, [track.name]: track.popularity }))}
                      chartConfig={Object.fromEntries(topTracks.slice(0, 5).map((track, index) => [
                          track.name,
                          {
                              label: track.name,
                              color: `hsl(var(--chart-${index + 1}))`,
                          },
                      ]))}
                  />
              )}
          </div>
          <div className="lg:col-span-1">
              {(genreDistribution && genreDistribution.length > 0) && (
                  <GenreDistributionChart data={genreDistribution} chartConfig={genreChartConfig} />
              )}
          </div>
        </div>

          {(albums && albums.length > 0) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Disc className="h-5 w-5" /> Latest Releases
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {albums.map(album => (
                        <a 
                          key={album.id} 
                          href={album.external_urls.spotify} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="group"
                        >
                          <div className="aspect-square overflow-hidden rounded-lg">
                            <Image 
                              src={album.images[0]?.url || '/placeholder.svg'} 
                              alt={album.name} 
                              width={200} 
                              height={200} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <p className="font-semibold text-sm mt-2 truncate group-hover:underline">{album.name}</p>
                        </a>
                      ))}
                  </div>
              </CardContent>
            </Card>
          )}

        <DebugSection error={rawError} data={analyticsData} />
      </div>
      <Dialog open={!!embedTrackId} onOpenChange={(isOpen) => !isOpen && setEmbedTrackId(null)}>
        <DialogContent className="max-w-sm md:max-w-md p-0">
          <DialogHeader>
            <DialogTitle className="sr-only">Spotify Embed Player</DialogTitle>
            <DialogDescription className="sr-only">
              An embedded Spotify player for the selected track.
            </DialogDescription>
          </DialogHeader>
          {embedTrackId && (
            <iframe
              key={embedTrackId}
              style={{ borderRadius: "12px" }}
              src={`https://open.spotify.com/embed/track/${embedTrackId}?utm_source=generator`}
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify Embed Player"
            ></iframe>
          )}
        </DialogContent>
      </Dialog>
    </>
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