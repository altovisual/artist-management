'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, Star, Music, Facebook, Instagram, Play, Pause, 
  ExternalLink, TrendingUp, Calendar, Clock, Hash, 
  Award, Headphones, Mic, Settings, Zap, Disc, X, Shuffle, SkipBack, SkipForward, Repeat 
} from 'lucide-react'
import { AnalyticsSkeleton } from './analytics-skeleton'
import { PageHeader } from '@/components/ui/design-system/page-header'
import { StatsGrid } from '@/components/ui/design-system/stats-grid'
import { ContentSection } from '@/components/ui/design-system/content-section'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useAudioAnalytics } from '@/hooks/use-audio-analytics'

interface MusoAiAnalyticsProps {
  artistId: string;
}

export const MusoAiAnalyticsRedesigned = ({ artistId }: MusoAiAnalyticsProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [credits, setCredits] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [selectedCredit, setSelectedCredit] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllCredits, setShowAllCredits] = useState(false);
  const [currentCredit, setCurrentCredit] = useState<any | null>(null);

  // Audio Analytics Integration
  useAudioAnalytics({
    trackInfo: currentCredit ? {
      trackId: currentCredit.track?.id || currentCredit.id || '',
      trackName: currentCredit.track?.title || 'Unknown',
      artistName: currentCredit.artists?.[0]?.name || currentCredit.artists?.[0] || 'Unknown',
      albumName: currentCredit.album?.name,
      durationMs: currentCredit.track?.duration,
      source: 'muso_ai'
    } : {
      trackId: '',
      trackName: '',
      source: 'muso_ai'
    },
    audioElement: audioRef,
    enabled: !!currentCredit && !!audioRef
  });

  useEffect(() => {
    async function fetchMusoAiData() {
      setIsLoading(true);
      setError(null);
      try {
        console.log('🎯 Fetching Muso.AI data for artist:', artistId);
        
        // Fetch profile data
        const profileRes = await fetch(`/api/muso-ai/profiles?artist_id=${artistId}`);
        console.log('📡 Profile response status:', profileRes.status);
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          console.log('👤 Profile data received:', profileData);
          
          if (profileData.profile_data) {
            setProfile(profileData.profile_data);
            console.log('✅ Profile set:', profileData.profile_data);
            
            // Fetch credits and collaborators if we have a profile ID
            const profileId = profileData.muso_ai_profile_id || profileData.profile_data.id;
            console.log('🆔 Using profile ID:', profileId);
            
            if (profileId) {
              // Fetch credits
              try {
                console.log('🎵 Fetching credits for profile:', profileId);
                const creditsRes = await fetch(`/api/muso-ai/credits?profile_id=${profileId}&limit=12`);
                console.log('📡 Credits response status:', creditsRes.status);
                
                if (creditsRes.ok) {
                  const creditsData = await creditsRes.json();
                  console.log('🎼 Credits data received:', creditsData);
                  const creditsItems = creditsData.data?.items || [];
                  setCredits(creditsItems);
                  console.log('✅ Credits set:', creditsItems.length, 'items');
                } else {
                  console.log('❌ Credits request failed:', creditsRes.status);
                }
              } catch (creditsError) {
                console.log('❌ Credits fetch error:', creditsError);
              }

              // Fetch collaborators
              try {
                console.log('👥 Fetching collaborators for profile:', profileId);
                const collabRes = await fetch(`/api/muso-ai/collaborators?profile_id=${profileId}&limit=12`);
                console.log('📡 Collaborators response status:', collabRes.status);
                
                if (collabRes.ok) {
                  const collabData = await collabRes.json();
                  console.log('🤝 Collaborators data received:', collabData);
                  const collabItems = collabData.data?.items || [];
                  setCollaborators(collabItems);
                  console.log('✅ Collaborators set:', collabItems.length, 'items');
                } else {
                  console.log('❌ Collaborators request failed:', collabRes.status);
                }
              } catch (collabError) {
                console.log('❌ Collaborators fetch error:', collabError);
              }
            } else {
              console.log('⚠️ No profile ID found, cannot fetch credits/collaborators');
            }
          } else {
            console.log('⚠️ No profile_data in response, using fallback');
            setProfile({ popularity: profileData.popularity });
          }
        } else {
          const errorBody = await profileRes.json();
          console.log('❌ Profile request failed:', profileRes.status, errorBody);
          throw new Error(errorBody.error || 'Failed to fetch Muso.AI data.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (artistId) {
      fetchMusoAiData();
    }
  }, [artistId]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatStreams = (streams: number) => {
    if (streams >= 1000000) {
      return `${(streams / 1000000).toFixed(1)}M`
    } else if (streams >= 1000) {
      return `${(streams / 1000).toFixed(1)}K`
    }
    return streams.toString()
  }

  const handlePlayPreview = (credit: any) => {
    const trackId = credit.track?.id || credit.id
    const previewUrl = credit.track?.preview_url || credit.preview_url

    // Si no hay preview URL, mostrar mensaje
    if (!previewUrl) {
      console.log('No preview available for this track')
      return
    }

    // Si ya está reproduciendo esta canción, pausar
    if (currentlyPlaying === trackId && audioRef) {
      audioRef.pause()
      setCurrentlyPlaying(null)
      return
    }

    // Pausar cualquier audio anterior
    if (audioRef) {
      audioRef.pause()
    }

    // Crear nuevo elemento de audio
    const audio = new Audio(previewUrl)
    setAudioRef(audio)
    setCurrentlyPlaying(trackId)
    setCurrentCredit(credit) // Set current credit for analytics

    // Configurar eventos del audio
    audio.addEventListener('ended', () => {
      setCurrentlyPlaying(null)
      setAudioRef(null)
    })

    audio.addEventListener('error', () => {
      console.log('Error playing preview')
      setCurrentlyPlaying(null)
      setAudioRef(null)
    })

    // Reproducir
    audio.play().catch((error) => {
      console.log('Error playing audio:', error)
      setCurrentlyPlaying(null)
      setAudioRef(null)
    })
  }

  // Cleanup del audio al desmontar el componente
  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause()
        setAudioRef(null)
      }
    }
  }, [audioRef])

  const handleCreditClick = (credit: any) => {
    console.log('🎯 Credit clicked:', credit);
    console.log('📊 Credit details:', {
      track: credit.track,
      album: credit.album,
      artists: credit.artists,
      credits: credit.credits,
      popularity: credit.popularity,
      streams: credit.streams
    });
    setSelectedCredit(credit)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-destructive mb-2">Muso.AI Connection Error</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">Please try syncing the Muso.AI data again</p>
        </div>
      </div>
    );
  }

  if (!profile || !profile.id) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Muso.AI Data</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No Muso.AI data available for this artist. Sync data from the main analytics page to see the analytics.
          </p>
        </div>
      </div>
    );
  }

  // Stats data for the grid
  const statsData = [
    {
      title: 'Popularity Score',
      value: profile.popularity?.toString() || '0',
      change: '+5.2%',
      trend: 'up' as const,
      icon: Star,
      description: 'Muso.AI popularity rating'
    },
    {
      title: 'Total Credits',
      value: profile.creditCount?.toString() || credits.length.toString() || '0',
      change: '+3',
      trend: 'up' as const,
      icon: Award,
      description: 'Music production credits'
    },
    {
      title: 'Collaborators',
      value: profile.collaboratorsCount?.toString() || collaborators.length.toString() || '0',
      change: '+2',
      trend: 'up' as const,
      icon: Users,
      description: 'Industry collaborations'
    },
    {
      title: 'Common Credits',
      value: profile.commonCredits?.length?.toString() || '0',
      change: 'stable',
      trend: 'stable' as const,
      icon: Hash,
      description: 'Most frequent roles'
    },
    {
      title: 'Total Streams',
      value: credits.length ? formatStreams(credits.reduce((acc, credit) => acc + (credit.streams || 0), 0)) : '0',
      change: '+12.8%',
      trend: 'up' as const,
      icon: Headphones,
      description: 'Combined track streams'
    },
    {
      title: 'Avg Popularity',
      value: credits.length ? Math.round(credits.reduce((acc, credit) => acc + (credit.popularity || 0), 0) / credits.length).toString() : '0',
      change: '+4.1%',
      trend: 'up' as const,
      icon: TrendingUp,
      description: 'Average track popularity'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title={profile.name || 'Artist Profile'}
        description="Muso.AI Analytics Dashboard"
        avatar={{
          src: profile.avatarUrl || '/placeholder.svg',
          fallback: profile.name?.charAt(0) || 'A'
        }}
        badge={profile.commonCredits?.[0] ? {
          text: profile.commonCredits[0],
          variant: 'secondary' as const
        } : undefined}
        actions={[
          ...(profile.facebook ? [{
            label: 'Facebook',
            href: profile.facebook,
            variant: 'outline' as const,
            icon: Facebook
          }] : []),
          ...(profile.instagram ? [{
            label: 'Instagram',
            href: profile.instagram,
            variant: 'outline' as const,
            icon: Instagram
          }] : [])
        ]}
      />

      {/* Stats Grid */}
      <StatsGrid stats={statsData} columns={6} />


      {/* Main Content Tabs */}
      <Tabs defaultValue="credits" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Credits ({credits.length})
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Collaborators ({collaborators.length})
          </TabsTrigger>
        </TabsList>

        {/* Credits Tab */}
        <TabsContent value="credits">
          <ContentSection
            title="Music Credits"
            description="Production credits and track contributions"
            icon={Award}
          >
            {credits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {credits.map((credit) => (
                  <Card 
                    key={credit.track?.id || Math.random()} 
                    className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 cursor-pointer"
                    onClick={() => handleCreditClick(credit)}
                  >
                    <CardContent className="p-4">
                      {/* Track Cover */}
                      <div className="relative mb-4 aspect-square rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={credit.album?.albumArt || '/placeholder.svg'}
                          alt={credit.album?.name || 'Album cover'}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="lg"
                            variant="secondary"
                            className="rounded-full bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-xl"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePlayPreview(credit)
                            }}
                            disabled={!credit.track?.preview_url && !credit.preview_url}
                          >
                            {currentlyPlaying === (credit.track?.id || credit.id) ? (
                              <Pause className="w-6 h-6" />
                            ) : (
                              <Play className="w-6 h-6" />
                            )}
                          </Button>
                        </div>
                        
                        {/* Preview Status */}
                        {!credit.track?.preview_url && !credit.preview_url && (
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                              No Preview
                            </Badge>
                          </div>
                        )}
                        {/* Popularity Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-blue-500/90 text-white text-xs">
                            {credit.popularity || 0}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Track Info */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {credit.track?.title || 'Unknown Track'}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {credit.artists?.map((artist: any) => artist.name).join(', ') || 'Unknown Artist'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{credit.album?.name || 'Unknown Album'}</span>
                          {credit.track?.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(credit.track.duration)}
                            </span>
                          )}
                        </div>
                        
                        {/* Credits Badges */}
                        {credit.credits && credit.credits.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {credit.credits.slice(0, 2).map((creditRole: any, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                                {creditRole.child || creditRole}
                              </Badge>
                            ))}
                            {credit.credits.length > 2 && (
                              <Badge variant="outline" className="text-xs px-2 py-0">
                                +{credit.credits.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Streams */}
                        {credit.streams && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Streams</span>
                            <span className="font-medium">{formatStreams(credit.streams)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Credits Found</h3>
                <p className="text-sm text-muted-foreground">No music credits available for this artist</p>
              </div>
            )}
          </ContentSection>
        </TabsContent>

        {/* Collaborators Tab */}
        <TabsContent value="collaborators">
          <ContentSection
            title="Collaborators Network"
            description="Industry connections and partnerships"
            icon={Users}
          >
            {collaborators.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collaborators.map((collaborator) => (
                  <Card key={collaborator.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={collaborator.avatarUrl || '/placeholder.svg'}
                            alt={collaborator.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                            {collaborator.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">
                              {collaborator.popularity || 0} popularity
                            </span>
                          </div>
                          
                          {/* Common Credits */}
                          {collaborator.commonCredits && collaborator.commonCredits.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {collaborator.commonCredits.slice(0, 2).map((credit: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                                  {credit}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Stats */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{collaborator.collaborationsCount || 0} collabs</span>
                            <span>{collaborator.totalTracks || 0} tracks</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Genres */}
                      {collaborator.genres && collaborator.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-4">
                          {collaborator.genres.slice(0, 3).map((genre: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Collaborators Found</h3>
                <p className="text-sm text-muted-foreground">No collaborator data available for this artist</p>
              </div>
            )}
          </ContentSection>
        </TabsContent>
      </Tabs>

      {/* Common Credits Section */}
      {profile.commonCredits && profile.commonCredits.length > 0 && (
        <ContentSection
          title="Most Common Credits"
          description="Primary roles and contributions"
          icon={Hash}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {profile.commonCredits.map((credit: string, index: number) => (
              <Card key={credit} className="group hover:shadow-md transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500/20 transition-colors">
                    <Settings className="w-6 h-6 text-blue-500" />
                  </div>
                  <h4 className="font-semibold text-sm capitalize group-hover:text-blue-600 transition-colors">
                    {credit}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Primary Role
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ContentSection>
      )}

      {/* Credit Detail Modal - Estilo Spotify Now Playing */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md w-[95vw] h-[90vh] p-0 bg-black border-none overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">
            Now Playing: {selectedCredit?.track?.title || 'Track'}
          </DialogTitle>
          {selectedCredit && (
            <div className="relative w-full h-full">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <Image
                  src={selectedCredit.album?.albumArt || '/placeholder.svg'}
                  alt={selectedCredit.album?.title || 'Album cover'}
                  fill
                  className="object-cover"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-800/70 to-black/95" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="relative h-full flex flex-col justify-between p-6 text-white">
                {/* Top Section */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-300 uppercase tracking-widest mb-1">Playing from Muso.AI</p>
                    <p className="text-sm text-white font-medium">
                      {selectedCredit.artists?.[0]?.name || selectedCredit.artists?.[0] || 'Artist'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Bottom Section - Player Controls */}
                <div className="space-y-6">
                  {/* Track Info */}
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                      {selectedCredit.track?.title || 'Unknown Track'}
                    </h2>
                    <p className="text-base text-gray-200">
                      {selectedCredit.artists?.map((artist: any) => artist.name || artist).join(', ') || 'Unknown Artist'}
                    </p>
                    
                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-300">
                      {selectedCredit.album?.title && (
                        <div className="flex items-center gap-1">
                          <Disc className="w-3 h-3" />
                          <span>{selectedCredit.album.title}</span>
                        </div>
                      )}
                      {selectedCredit.releaseDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(selectedCredit.releaseDate).getFullYear()}</span>
                        </div>
                      )}
                      {selectedCredit.track?.popularity !== undefined && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{selectedCredit.track.popularity}/100</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {selectedCredit.track?.duration && (
                    <div className="space-y-2">
                      <Progress 
                        value={50} 
                        className="h-1 bg-white/30" 
                      />
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>0:00</span>
                        <span>{formatDuration(selectedCredit.track.duration)}</span>
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
                        onClick={() => handlePlayPreview({
                          ...selectedCredit,
                          preview_url: selectedCredit.track?.spotifyPreviewUrl || selectedCredit.track?.preview_url || selectedCredit.preview_url,
                          id: selectedCredit.track?.id || selectedCredit.id
                        })}
                        disabled={!selectedCredit.track?.spotifyPreviewUrl && !selectedCredit.track?.preview_url && !selectedCredit.preview_url}
                      >
                        {currentlyPlaying === (selectedCredit.track?.id || selectedCredit.id) ? (
                          <Pause className="w-8 h-8" />
                        ) : (
                          <Play className="w-8 h-8" />
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
                    {selectedCredit.track?.popularity !== undefined && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Popularity</p>
                        <div className="flex items-center gap-2">
                          <Progress value={selectedCredit.track.popularity} className="h-1.5 bg-white/20 flex-1" />
                          <span className="text-sm text-white font-medium">{selectedCredit.track.popularity}%</span>
                        </div>
                      </div>
                    )}
                    {selectedCredit.streams && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Streams</p>
                        <p className="text-sm text-white font-medium">{formatStreams(selectedCredit.streams)}</p>
                      </div>
                    )}
                    {selectedCredit.track?.duration && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Duration</p>
                        <p className="text-sm text-white font-medium">{formatDuration(selectedCredit.track.duration)}</p>
                      </div>
                    )}
                    {selectedCredit.releaseDate && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Release Year</p>
                        <p className="text-sm text-white font-medium">{new Date(selectedCredit.releaseDate).getFullYear()}</p>
                      </div>
                    )}
                  </div>

                  {/* Credits Section */}
                  {selectedCredit.credits && selectedCredit.credits.length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Production Credits</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCredit.credits.slice(0, 4).map((credit: any, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-white/10 text-white border-white/20">
                            {credit.child || credit}
                          </Badge>
                        ))}
                        {selectedCredit.credits.length > 4 && (
                          <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                            +{selectedCredit.credits.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                      asChild
                    >
                      <a
                        href={selectedCredit.track?.spotifyId ? `https://open.spotify.com/track/${selectedCredit.track.spotifyId}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in Spotify
                      </a>
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Music className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold">Muso.AI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
