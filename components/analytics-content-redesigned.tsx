'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Users, Music, Disc, Star, PlayCircle, Pause, ExternalLink, TrendingUp, Calendar, Clock, Hash, ChevronUp, ChevronDown, X, Shuffle, SkipBack, SkipForward, Repeat } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AnalyticsSkeleton } from './analytics-skeleton'
import { PageHeader } from '@/components/ui/design-system/page-header'
import { StatsGrid } from '@/components/ui/design-system/stats-grid'
import { ContentSection } from '@/components/ui/design-system/content-section'
import { DataTable } from '@/components/ui/design-system/data-table'

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
  album: { 
    name: string; 
    images: { url: string }[];
    release_date?: string;
    album_type?: string;
    total_tracks?: number;
  };
  external_urls: { spotify: string };
  popularity: number;
  artists: { name: string }[];
  duration_ms?: number;
  preview_url?: string;
}

interface Album {
  id: string;
  name: string;
  album_type: string;
  release_date: string;
  images: { url: string }[];
  external_urls: { spotify: string };
  total_tracks?: number;
}

interface AnalyticsData {
  artist: ArtistProfile;
  topTracks: TopTrack[];
  albums: Album[];
}

interface AnalyticsContentProps {
  artistId?: string;
}

export const AnalyticsContentRedesigned = ({ artistId }: AnalyticsContentProps) => {
  const searchParams = useSearchParams()
  const status = searchParams.get('status')
  const message = searchParams.get('message')
  const supabase = createClient()

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)
  const [showAllAlbums, setShowAllAlbums] = useState(false)
  const [showAllReleases, setShowAllReleases] = useState(false)
  const [selectedSpotifyTrack, setSelectedSpotifyTrack] = useState<TopTrack | null>(null)
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      setError(null)
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

        // Usar datos reales de Spotify con sus preview_url originales
        if (data && data.topTracks) {
          const tracksWithPreviews = data.topTracks.filter(t => t.preview_url).length
          const totalTracks = data.topTracks.length
          
          console.log('🎵 Spotify tracks received:', {
            total: totalTracks,
            withPreviews: tracksWithPreviews,
            withoutPreviews: totalTracks - tracksWithPreviews,
            tracks: data.topTracks.map(t => ({
              name: t.name,
              preview_url: t.preview_url,
              hasPreview: !!t.preview_url,
              external_urls: t.external_urls
            }))
          })
          
          console.log('🎶 Using original Spotify preview URLs (30-second clips)')
          
          // Usar datos exactamente como vienen de Spotify
          setAnalyticsData(data)
        } else {
          // Datos mock completos si no hay datos reales
          setAnalyticsData({
            artist: {
              name: 'Borngud',
              followers: 34088,
              imageUrl: 'https://picsum.photos/200/200?random=artist',
              genres: ['Latin', 'Urban', 'Pop']
            },
            topTracks: [
              {
                id: 'mock-track-1',
                name: 'Impaciente',
                popularity: 75,
                album: {
                  name: 'Impaciente - Single',
                  images: [{ url: 'https://picsum.photos/400/400?random=1001' }]
                },
                artists: [{ name: 'Borngud' }],
                duration_ms: 195000,
                preview_url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
                external_urls: { spotify: 'https://open.spotify.com/track/mock1' }
              },
              {
                id: 'mock-track-2',
                name: 'De Lejos',
                popularity: 68,
                album: {
                  name: 'De Lejos - Single',
                  images: [{ url: 'https://picsum.photos/400/400?random=1002' }]
                },
                artists: [{ name: 'Borngud' }],
                duration_ms: 210000,
                preview_url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
                external_urls: { spotify: 'https://open.spotify.com/track/mock2' }
              },
              {
                id: 'mock-track-3',
                name: 'Me Amas',
                popularity: 72,
                album: {
                  name: 'Me Amas - Single',
                  images: [{ url: 'https://picsum.photos/400/400?random=1003' }]
                },
                artists: [{ name: 'Borngud' }],
                duration_ms: 188000,
                preview_url: null, // Sin preview para mostrar estado
                external_urls: { spotify: 'https://open.spotify.com/track/mock3' }
              }
            ],
            albums: [
              {
                id: 'mock-album-1',
                name: 'Debut EP',
                images: [{ url: 'https://picsum.photos/400/400?random=2001' }],
                release_date: '2023-09-01',
                total_tracks: 5,
                album_type: 'album',
                external_urls: { spotify: 'https://open.spotify.com/album/mock1' }
              }
            ]
          })
        }
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [supabase, artistId])

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getYearsAgo = (dateString: string) => {
    const years = new Date().getFullYear() - new Date(dateString).getFullYear()
    return years > 0 ? `${years} year${years > 1 ? 's' : ''} ago` : 'This year'
  }

  const handlePlayPreview = (track: TopTrack) => {
    console.log('🎵 Play button clicked for track:', track.name)
    console.log('🔗 Preview URL:', track.preview_url)
    console.log('🎯 Track ID:', track.id)
    
    // Si no hay preview URL, mostrar mensaje
    if (!track.preview_url) {
      console.log('❌ No preview available for this track:', track.name)
      console.log('📋 This is normal - not all Spotify tracks have 30-second previews')
      return
    }

    // Verificar si la URL es válida
    try {
      new URL(track.preview_url)
      console.log('✅ Preview URL is valid:', track.preview_url)
    } catch (e) {
      console.log('❌ Invalid preview URL:', track.preview_url)
      return
    }

    // Si ya está reproduciendo esta canción, pausar
    if (currentlyPlaying === track.id && audioRef) {
      console.log('⏸️ Pausing current track:', track.name)
      audioRef.pause()
      setCurrentlyPlaying(null)
      return
    }

    // Pausar cualquier audio anterior
    if (audioRef) {
      console.log('⏹️ Stopping previous audio')
      audioRef.pause()
    }

    console.log('▶️ Starting playback for:', track.name, 'with URL:', track.preview_url)
    
    // Crear nuevo elemento de audio
    const audio = new Audio()
    
    // Configurar eventos ANTES de asignar src
    audio.addEventListener('loadstart', () => {
      console.log('📥 Loading started for:', track.name)
    })

    audio.addEventListener('loadeddata', () => {
      console.log('📊 Audio data loaded for:', track.name)
    })

    audio.addEventListener('canplay', () => {
      console.log('✅ Audio ready to play:', track.name)
    })

    audio.addEventListener('playing', () => {
      console.log('🎶 Audio is now playing:', track.name)
    })

    audio.addEventListener('ended', () => {
      console.log('🔚 Audio ended for:', track.name)
      setCurrentlyPlaying(null)
      setAudioRef(null)
    })

    audio.addEventListener('error', (e) => {
      console.log('❌ Audio error for:', track.name)
      const audioElement = e.target as HTMLAudioElement
      console.log('❌ Error details:', {
        error: audioElement?.error,
        code: audioElement?.error?.code,
        message: audioElement?.error?.message,
        url: track.preview_url
      })
      setCurrentlyPlaying(null)
      setAudioRef(null)
    })

    audio.addEventListener('stalled', () => {
      console.log('⏳ Audio stalled for:', track.name)
    })

    audio.addEventListener('waiting', () => {
      console.log('⏳ Audio waiting for:', track.name)
    })

    // Configurar CORS y otras propiedades
    audio.crossOrigin = 'anonymous'
    audio.preload = 'metadata'
    
    // Asignar URL y configurar estado
    audio.src = track.preview_url
    setAudioRef(audio)
    setCurrentlyPlaying(track.id)

    // Intentar reproducir
    audio.play().then(() => {
      console.log('🎶 Play promise resolved for:', track.name)
    }).catch((error) => {
      console.log('❌ Play promise rejected for:', track.name)
      console.log('❌ Play error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        url: track.preview_url
      })
      setCurrentlyPlaying(null)
      setAudioRef(null)
    })
  }

  const handleSpotifyTrackClick = (track: TopTrack) => {
    setSelectedSpotifyTrack(track)
    setIsSpotifyModalOpen(true)
  }

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album)
    setIsAlbumModalOpen(true)
  }

  const renderStatusAlert = () => {
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

    if (status === 'success') {
      return (
        <Alert variant="default" className="mb-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">Connection Successful!</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Your Spotify account has been connected successfully. Your analytics will start syncing soon.
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
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load analytics</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{error}</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Music className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No data available</h3>
        <p className="text-sm text-muted-foreground">Connect your Spotify account to see analytics</p>
      </div>
    )
  }

  const { artist, topTracks, albums } = analyticsData;

  // Stats data for the grid
  const statsData = [
    {
      title: 'Total Followers',
      value: artist.followers?.toLocaleString() || '0',
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users,
      description: 'Spotify followers'
    },
    {
      title: 'Top Tracks',
      value: topTracks?.length?.toString() || '0',
      change: '+3',
      trend: 'up' as const,
      icon: Music,
      description: 'Popular songs'
    },
    {
      title: 'Albums',
      value: albums?.length?.toString() || '0',
      change: '+1',
      trend: 'up' as const,
      icon: Disc,
      description: 'Released albums'
    },
    {
      title: 'Genres',
      value: artist.genres?.length?.toString() || '0',
      change: 'stable',
      trend: 'stable' as const,
      icon: Hash,
      description: 'Music genres'
    },
    {
      title: 'Avg Popularity',
      value: topTracks?.length ? Math.round(topTracks.reduce((acc, track) => acc + track.popularity, 0) / topTracks.length).toString() : '0',
      change: '+5.2%',
      trend: 'up' as const,
      icon: TrendingUp,
      description: 'Track popularity'
    },
    {
      title: 'Latest Release',
      value: albums?.length ? getYearsAgo(albums[0].release_date) : 'N/A',
      change: 'recent',
      trend: 'stable' as const,
      icon: Calendar,
      description: 'Most recent album'
    }
  ]

  // Tracks table columns
  const tracksColumns = [
    {
      key: 'cover',
      label: '',
      render: (value: any, track: TopTrack) => (
        <div className="relative group">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={track.album?.images?.[0]?.url || '/placeholder.svg'}
              alt={track.album?.name || 'Album cover'}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:text-white hover:bg-white/20 p-1 h-auto"
              onClick={() => setCurrentlyPlaying(currentlyPlaying === track.id ? null : track.id)}
            >
              <PlayCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    },
    {
      key: 'info',
      label: 'Track',
      render: (value: any, track: TopTrack) => (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{track.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {track.artists?.map(artist => artist.name).join(', ')} • {track.album?.name}
          </div>
        </div>
      )
    },
    {
      key: 'popularity',
      label: 'Popularity',
      render: (value: any, track: TopTrack) => (
        <div className="flex items-center gap-2 min-w-[100px]">
          <Progress value={track.popularity} className="flex-1 h-2" />
          <span className="text-xs font-medium w-8 text-right">{track.popularity}</span>
        </div>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (value: any, track: TopTrack) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {track.duration_ms ? formatDuration(track.duration_ms) : 'N/A'}
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (value: any, track: TopTrack) => (
        <Button
          size="sm"
          variant="ghost"
          asChild
          className="h-8 w-8 p-0"
        >
          <a
            href={track.external_urls?.spotify}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      )
    }
  ]

  // Albums table columns
  const albumsColumns = [
    {
      key: 'cover',
      label: '',
      render: (value: any, album: Album) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={album.images?.[0]?.url || '/placeholder.svg'}
            alt={album.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      )
    },
    {
      key: 'info',
      label: 'Album',
      render: (value: any, album: Album) => (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{album.name}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Badge variant="outline" className="text-xs px-2 py-0">
              {album.album_type}
            </Badge>
            {album.total_tracks && (
              <span>{album.total_tracks} track{album.total_tracks > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'release',
      label: 'Release Date',
      render: (value: any, album: Album) => (
        <div className="text-sm">
          <div>{formatReleaseDate(album.release_date)}</div>
          <div className="text-xs text-muted-foreground">{getYearsAgo(album.release_date)}</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (value: any, album: Album) => (
        <Button
          size="sm"
          variant="ghost"
          asChild
          className="h-8 w-8 p-0"
        >
          <a
            href={album.external_urls?.spotify}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-8">
      {!artistId && renderStatusAlert()}
      
      {/* Page Header */}
      <PageHeader
        title={artist.name}
        description="Spotify Analytics Dashboard"
        avatar={{
          src: artist.imageUrl || '/placeholder.svg',
          fallback: artist.name.charAt(0)
        }}
        badge={artist.genres?.[0] ? {
          text: artist.genres[0],
          variant: 'secondary' as const
        } : undefined}
        actions={[
          {
            label: 'Open in Spotify',
            href: `https://open.spotify.com/artist/${artistId}`,
            variant: 'default',
            icon: ExternalLink
          }
        ]}
      />

      {/* Stats Grid */}
      <StatsGrid stats={statsData} columns={6} />


      {/* Top Tracks Section - Grid Style */}
      <ContentSection
        title="Top Tracks"
        description="Most popular songs on Spotify"
        icon={Music}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(topTracks && topTracks.length > 0 ? topTracks : [
            {
              id: 'demo-track-1',
              name: 'Impaciente',
              popularity: 75,
              album: {
                name: 'Impaciente - Single',
                images: [{ url: 'https://picsum.photos/400/400?random=1001' }]
              },
              artists: [{ name: 'Borngud' }],
              duration_ms: 195000,
              preview_url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
              external_urls: { spotify: 'https://open.spotify.com/track/demo1' }
            },
            {
              id: 'demo-track-2',
              name: 'De Lejos',
              popularity: 68,
              album: {
                name: 'De Lejos - Single',
                images: [{ url: 'https://picsum.photos/400/400?random=1002' }]
              },
              artists: [{ name: 'Borngud' }],
              duration_ms: 210000,
              preview_url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
              external_urls: { spotify: 'https://open.spotify.com/track/demo2' }
            },
            {
              id: 'demo-track-3',
              name: 'Me Amas',
              popularity: 72,
              album: {
                name: 'Me Amas - Single',
                images: [{ url: 'https://picsum.photos/400/400?random=1003' }]
              },
              artists: [{ name: 'Borngud' }],
              duration_ms: 188000,
              preview_url: null, // Sin preview para mostrar estado
              external_urls: { spotify: 'https://open.spotify.com/track/demo3' }
            }
          ] as TopTrack[]).map((track) => (
              <Card 
                key={track.id} 
                className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 cursor-pointer"
                onClick={() => handleSpotifyTrackClick(track)}
              >
                <CardContent className="p-4">
                  {/* Track Cover */}
                  <div className="relative mb-4 aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={track.album?.images?.[0]?.url || '/placeholder.svg'}
                      alt={track.album?.name || 'Album cover'}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="rounded-full bg-green-500 hover:bg-green-400 text-white border-0 shadow-xl"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlayPreview(track)
                        }}
                        disabled={!track.preview_url}
                      >
                        {currentlyPlaying === track.id ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <PlayCircle className="w-6 h-6" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Preview Status */}
                    {!track.preview_url && (
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="bg-black/80 text-white text-xs px-2 py-1">
                          🚫 No Preview
                        </Badge>
                      </div>
                    )}
                    
                    {/* Preview Available Indicator */}
                    {track.preview_url && (
                      <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="secondary" className="bg-green-500/90 text-white text-xs px-2 py-1">
                          🎵 Preview Available
                        </Badge>
                      </div>
                    )}
                    {/* Popularity Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-green-500/90 text-white text-xs">
                        {track.popularity}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Track Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {track.name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artists?.map(artist => artist.name).join(', ')}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{track.album?.name}</span>
                      {track.duration_ms && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(track.duration_ms)}
                        </span>
                      )}
                    </div>
                    
                    {/* Popularity Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Popularity</span>
                        <span className="font-medium">{track.popularity}/100</span>
                      </div>
                      <Progress value={track.popularity} className="h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ContentSection>

      {/* Albums Section - Horizontal Cards */}
      {albums && albums.length > 0 && (
        <ContentSection
          title="Albums & Releases"
          description={`Discography and releases (${albums.length} total)`}
          icon={Disc}
          actions={[
            {
              label: 'View All on Spotify',
              href: `https://open.spotify.com/artist/${artistId}/discography`,
              variant: 'outline',
              icon: ExternalLink
            }
          ]}
        >
          <div className="space-y-4">
            {/* Albums List */}
            {(showAllAlbums ? albums : albums.slice(0, 4)).map((album) => (
              <Card 
                key={album.id} 
                className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-r from-background to-muted/10 cursor-pointer"
                onClick={() => handleAlbumClick(album)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Album Cover */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Image
                        src={album.images?.[0]?.url || '/placeholder.svg'}
                        alt={album.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-full bg-white/90 hover:bg-white text-black border-0 shadow-lg"
                          asChild
                        >
                          <a
                            href={album.external_urls?.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Album Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {album.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="text-xs px-2 py-1 capitalize">
                              {album.album_type}
                            </Badge>
                            {album.total_tracks && (
                              <span className="text-sm text-muted-foreground">
                                {album.total_tracks} track{album.total_tracks > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-medium">
                            {formatReleaseDate(album.release_date)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getYearsAgo(album.release_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Ver más / Ver menos button */}
            {albums.length > 4 && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllAlbums(!showAllAlbums)}
                  className="group hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  {showAllAlbums ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                      Ver menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                      Ver más ({albums.length - 4} álbumes más)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </ContentSection>
      )}

      {/* Genres Section - Enhanced */}
      {artist.genres && artist.genres.length > 0 && (
        <ContentSection
          title="Music Genres"
          description="Artist's musical style and genres"
          icon={Hash}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artist.genres.map((genre, index) => (
              <Card key={genre} className="group hover:shadow-md transition-all duration-300 border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                    <Hash className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm capitalize group-hover:text-primary transition-colors">
                    {genre}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Music Genre
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ContentSection>
      )}

      {/* Advanced Analytics Section */}
      <ContentSection
        title="Advanced Analytics"
        description="Detailed performance insights"
        icon={TrendingUp}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Track Performance Chart */}
          <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Track Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTracks?.slice(0, 5).map((track, index) => (
                  <div key={track.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{track.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Popularity: {track.popularity}/100
                      </div>
                    </div>
                    <div className="w-16">
                      <Progress value={track.popularity} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Release Timeline */}
          <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Release Timeline
                {albums && albums.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {albums.length} releases
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(showAllReleases ? albums : albums?.slice(0, 5))?.map((album, index) => (
                  <div key={album.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{album.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatReleaseDate(album.release_date)} • {album.album_type}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getYearsAgo(album.release_date)}
                    </Badge>
                  </div>
                ))}
                
                {/* Ver más / Ver menos button */}
                {albums && albums.length > 5 && (
                  <div className="flex justify-center pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllReleases(!showAllReleases)}
                      className="group hover:bg-primary/10 transition-all duration-300"
                    >
                      {showAllReleases ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                          Ver menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                          Ver más ({albums.length - 5} releases más)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      {/* Spotify Track Modal - Estilo Spotify Now Playing */}
      <Dialog open={isSpotifyModalOpen} onOpenChange={setIsSpotifyModalOpen}>
        <DialogContent className="max-w-md w-[95vw] h-[90vh] p-0 bg-black border-none overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">
            Now Playing: {selectedSpotifyTrack?.name || 'Track'}
          </DialogTitle>
          {selectedSpotifyTrack && (
            <div className="relative w-full h-full">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <Image
                  src={selectedSpotifyTrack.album?.images?.[0]?.url || '/placeholder.svg'}
                  alt={selectedSpotifyTrack.album?.name || 'Album cover'}
                  fill
                  className="object-cover"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-teal-900/60 via-teal-800/70 to-black/95" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="relative h-full flex flex-col justify-between p-6 text-white">
                {/* Top Section */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-300 uppercase tracking-widest mb-1">Playing from Artist</p>
                    <p className="text-sm text-white font-medium">
                      {selectedSpotifyTrack.artists?.[0]?.name || 'Artist'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsSpotifyModalOpen(false)}
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Bottom Section - Player Controls */}
                <div className="space-y-6">
                  {/* Track Info */}
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                      {selectedSpotifyTrack.name}
                    </h2>
                    <p className="text-base text-gray-200">
                      {selectedSpotifyTrack.artists?.map(artist => artist.name).join(', ')}
                    </p>
                    
                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-300">
                      {selectedSpotifyTrack.album?.name && (
                        <div className="flex items-center gap-1">
                          <Disc className="w-3 h-3" />
                          <span>{selectedSpotifyTrack.album.name}</span>
                        </div>
                      )}
                      {selectedSpotifyTrack.album?.release_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(selectedSpotifyTrack.album.release_date).getFullYear()}</span>
                        </div>
                      )}
                      {selectedSpotifyTrack.popularity !== undefined && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{selectedSpotifyTrack.popularity}/100</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {selectedSpotifyTrack.duration_ms && (
                    <div className="space-y-2">
                      <Progress 
                        value={50} 
                        className="h-1 bg-white/30" 
                      />
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>0:00</span>
                        <span>{formatDuration(selectedSpotifyTrack.duration_ms)}</span>
                      </div>
                    </div>
                  )}

                  {/* Player Controls */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10"
                    >
                      <Shuffle className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                      >
                        <SkipBack className="w-7 h-7" />
                      </Button>

                      <Button
                        size="icon"
                        className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black shadow-xl"
                        onClick={() => handlePlayPreview(selectedSpotifyTrack)}
                        disabled={!selectedSpotifyTrack.preview_url}
                      >
                        {currentlyPlaying === selectedSpotifyTrack.id ? (
                          <Pause className="w-8 h-8" />
                        ) : (
                          <PlayCircle className="w-8 h-8" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                      >
                        <SkipForward className="w-7 h-7" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10"
                    >
                      <Repeat className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Additional Track Details */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                    {selectedSpotifyTrack.album?.album_type && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Album Type</p>
                        <p className="text-sm text-white font-medium capitalize">{selectedSpotifyTrack.album.album_type}</p>
                      </div>
                    )}
                    {selectedSpotifyTrack.album?.total_tracks && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Total Tracks</p>
                        <p className="text-sm text-white font-medium">{selectedSpotifyTrack.album.total_tracks} tracks</p>
                      </div>
                    )}
                    {selectedSpotifyTrack.duration_ms && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Duration</p>
                        <p className="text-sm text-white font-medium">{formatDuration(selectedSpotifyTrack.duration_ms)}</p>
                      </div>
                    )}
                    {selectedSpotifyTrack.popularity !== undefined && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Popularity</p>
                        <div className="flex items-center gap-2">
                          <Progress value={selectedSpotifyTrack.popularity} className="h-1.5 bg-white/20 flex-1" />
                          <span className="text-sm text-white font-medium">{selectedSpotifyTrack.popularity}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                      asChild
                    >
                      <a
                        href={selectedSpotifyTrack.external_urls?.spotify || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in Spotify
                      </a>
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#1DB954] rounded-full flex items-center justify-center">
                        <Music className="w-4 h-4 text-black" />
                      </div>
                      <span className="text-xs font-semibold">Spotify</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Album Modal - Estilo Spotify */}
      <Dialog open={isAlbumModalOpen} onOpenChange={setIsAlbumModalOpen}>
        <DialogContent className="max-w-md w-[95vw] h-[90vh] p-0 bg-black border-none overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">
            Album: {selectedAlbum?.name || 'Album'}
          </DialogTitle>
          {selectedAlbum && (
            <div className="relative w-full h-full">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <Image
                  src={selectedAlbum.images?.[0]?.url || '/placeholder.svg'}
                  alt={selectedAlbum.name}
                  fill
                  className="object-cover"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 via-purple-800/70 to-black/95" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="relative h-full flex flex-col justify-between p-6 text-white">
                {/* Top Section */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-300 uppercase tracking-widest mb-1">Album</p>
                    <p className="text-sm text-white font-medium capitalize">
                      {selectedAlbum.album_type}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsAlbumModalOpen(false)}
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Bottom Section */}
                <div className="space-y-6">
                  {/* Album Info */}
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                      {selectedAlbum.name}
                    </h2>
                    
                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-300">
                      {selectedAlbum.release_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatReleaseDate(selectedAlbum.release_date)}</span>
                        </div>
                      )}
                      {selectedAlbum.total_tracks && (
                        <div className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          <span>{selectedAlbum.total_tracks} tracks</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Disc className="w-3 h-3" />
                        <span className="capitalize">{selectedAlbum.album_type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Album Details Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Release Date</p>
                      <p className="text-sm text-white font-medium">{formatReleaseDate(selectedAlbum.release_date)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Years Ago</p>
                      <p className="text-sm text-white font-medium">{getYearsAgo(selectedAlbum.release_date)}</p>
                    </div>
                    {selectedAlbum.total_tracks && (
                      <>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Tracks</p>
                          <p className="text-sm text-white font-medium">{selectedAlbum.total_tracks} songs</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Type</p>
                          <p className="text-sm text-white font-medium capitalize">{selectedAlbum.album_type}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                      asChild
                    >
                      <a
                        href={selectedAlbum.external_urls?.spotify || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in Spotify
                      </a>
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#1DB954] rounded-full flex items-center justify-center">
                        <Disc className="w-4 h-4 text-black" />
                      </div>
                      <span className="text-xs font-semibold">Spotify</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
