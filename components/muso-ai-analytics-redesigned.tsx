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
  Award, Headphones, Mic, Settings, Zap, Disc 
} from 'lucide-react'
import { AnalyticsSkeleton } from './analytics-skeleton'
import { PageHeader } from '@/components/ui/design-system/page-header'
import { StatsGrid } from '@/components/ui/design-system/stats-grid'
import { ContentSection } from '@/components/ui/design-system/content-section'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

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

      {/* Credit Detail Modal - Responsive */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 sm:p-6 pb-4 border-b bg-gradient-to-r from-background to-muted/20">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center">Track Details</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground text-center">
              Detailed information about this track from Muso.AI
            </DialogDescription>
          </DialogHeader>
          
          {selectedCredit && (
            <div className="p-4 sm:p-6">
              {/* Header Section - Centered Layout */}
              <div className="flex flex-col items-center text-center space-y-4 mb-8">
                {/* Album Cover - Larger and Centered */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-muted shadow-2xl">
                  <Image
                    src={selectedCredit.album?.albumArt || '/placeholder.svg'}
                    alt={selectedCredit.album?.title || 'Album cover'}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Track Info - Centered */}
                <div className="space-y-2 max-w-md">
                  <h2 className="text-2xl sm:text-3xl font-bold break-words leading-tight">
                    {selectedCredit.track?.title || 'Unknown Track'}
                  </h2>
                  <p className="text-lg sm:text-xl text-muted-foreground break-words">
                    {selectedCredit.artists?.map((artist: any) => artist.name || artist).join(', ') || 'Unknown Artist'}
                  </p>
                  <p className="text-base text-muted-foreground break-words">
                    {selectedCredit.album?.title || 'Unknown Album'}
                  </p>
                </div>
                
                {/* Play Button - Prominent */}
                <Button
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-400 px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => handlePlayPreview({
                    ...selectedCredit,
                    preview_url: selectedCredit.track?.spotifyPreviewUrl || selectedCredit.track?.preview_url || selectedCredit.preview_url,
                    id: selectedCredit.track?.id || selectedCredit.id
                  })}
                  disabled={!selectedCredit.track?.spotifyPreviewUrl && !selectedCredit.track?.preview_url && !selectedCredit.preview_url}
                >
                  {currentlyPlaying === (selectedCredit.track?.id || selectedCredit.id) ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause Spotify Preview
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {selectedCredit.track?.spotifyPreviewUrl || selectedCredit.track?.preview_url || selectedCredit.preview_url ? 'Play Spotify Preview' : 'No Preview Available'}
                    </>
                  )}
                </Button>
              </div>

              {/* Stats Grid - Improved Layout */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{selectedCredit.track?.popularity || 0}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Spotify Popularity</div>
                </Card>
                <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                    {selectedCredit.streams ? formatStreams(selectedCredit.streams) : 'N/A'}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300 font-medium">Streams</div>
                </Card>
                <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                    {selectedCredit.track?.duration ? formatDuration(selectedCredit.track.duration) : 'N/A'}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">Duration</div>
                </Card>
                <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">
                    {selectedCredit.releaseDate ? new Date(selectedCredit.releaseDate).getFullYear() : new Date().getFullYear()}
                  </div>
                  <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">Release Year</div>
                </Card>
              </div>

              {/* Credits Section */}
              {selectedCredit.credits && selectedCredit.credits.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Production Credits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCredit.credits.map((credit: any, index: number) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {credit.child || credit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Album Information - Card Layout */}
              <Card className="p-6 mb-6 bg-gradient-to-br from-background to-muted/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Disc className="w-5 h-5 text-primary" />
                  Album Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Album Name</span>
                      <span className="font-semibold break-words">{selectedCredit.album?.title || 'Unknown'}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Release Date</span>
                      <span className="font-semibold">{selectedCredit.releaseDate || 'Unknown'}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Label</span>
                      <span className="font-semibold break-words">{selectedCredit.label || 'Independent'}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Spotify ID</span>
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{selectedCredit.track?.spotifyId?.slice(0, 15)}...</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Copyright</span>
                      <span className="text-sm break-words">{selectedCredit.c_line || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Publisher</span>
                      <span className="text-sm break-words">{selectedCredit.publisher || selectedCredit.p_line || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Performance Metrics - Enhanced */}
              {(selectedCredit.track?.popularity || selectedCredit.streams) && (
                <Card className="p-6 mb-6 bg-gradient-to-br from-background to-muted/10">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Performance Metrics
                  </h3>
                  <div className="space-y-6">
                    {selectedCredit.track?.popularity && (
                      <div>
                        <div className="flex justify-between mb-3">
                          <span className="font-medium">Popularity Score</span>
                          <span className="text-sm text-muted-foreground font-mono">{selectedCredit.track.popularity}/100</span>
                        </div>
                        <Progress value={selectedCredit.track.popularity} className="h-3 bg-muted" />
                      </div>
                    )}
                    
                    {selectedCredit.streams && (
                      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-500/10 rounded-full">
                            <Headphones className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{formatStreams(selectedCredit.streams)}</div>
                            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Streams</div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </Card>
              )}

              {/* Action Buttons - Enhanced */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button asChild className="flex-1 h-12 bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <a
                    href={selectedCredit.track?.spotifyId ? `https://open.spotify.com/track/${selectedCredit.track.spotifyId}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    {selectedCredit.track?.spotifyId ? 'Open in Spotify' : 'No Spotify Link'}
                  </a>
                </Button>
                <Button variant="outline" className="flex-1 h-12 border-2 hover:bg-muted/50 transition-all duration-300">
                  <Users className="w-5 h-5 mr-2" />
                  View Collaborators
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
