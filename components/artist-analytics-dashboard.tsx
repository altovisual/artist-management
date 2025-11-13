
'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { AnalyticsContentRedesigned } from '@/components/analytics-content-redesigned'
import { MusoAiAnalyticsRedesigned } from '@/components/muso-ai-analytics-redesigned'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { AnalyticsSkeleton } from '@/components/analytics-skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCcw, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ArtistAnalyticsDashboardProps {
  artist: {
    id: string;
    name: string;
    spotify_artist_id: string | null;
    muso_ai_profile_id: string | null;
  } | null;
}

export function ArtistAnalyticsDashboard({ artist }: ArtistAnalyticsDashboardProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [musoAiUrl, setMusoAiUrl] = useState('')
  const { toast } = useToast()
  const supabase = createClient()

  if (!artist) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No artist data provided.</p>
      </div>
    )
  }

  const extractSpotifyId = (urlOrId: string): string | null => {
    const trimmedUrl = urlOrId.trim()
    if (!trimmedUrl) return null
    try {
      if (trimmedUrl.includes('spotify.com')) {
        const url = new URL(trimmedUrl)
        const pathParts = url.pathname.split('/')
        const artistId = pathParts.find(part => part.length === 22)
        return artistId || null
      }
      if (trimmedUrl.startsWith('spotify:artist:')) {
        return trimmedUrl.split(':')[2]
      }
      return trimmedUrl
    } catch (error) {
      return urlOrId
    }
  }

  const extractMusoAiId = (url: string): string | null => {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return null
    try {
      if (trimmedUrl.includes('muso.ai')) {
        const urlParts = trimmedUrl.split('/')
        const profileIndex = urlParts.indexOf('profile')
        if (profileIndex !== -1 && urlParts.length > profileIndex + 1) {
          return urlParts[profileIndex + 1]
        }
      }
      if (trimmedUrl.length === 36) return trimmedUrl
      return null
    } catch (error) {
      return null
    }
  }

  const handleLinkSpotify = async () => {
    if (!spotifyUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Spotify URL or ID",
        variant: "destructive",
      })
      return
    }

    setIsLinking(true)
    try {
      const spotifyId = extractSpotifyId(spotifyUrl)
      if (!spotifyId) {
        throw new Error('Invalid Spotify URL or ID')
      }

      const { error } = await supabase
        .from('artists')
        .update({ spotify_artist_id: spotifyId })
        .eq('id', artist.id)

      if (error) throw error

      toast({
        title: "Success!",
        description: "Spotify account linked successfully",
      })
      
      window.location.reload()
    } catch (err: any) {
      toast({
        title: "Error linking Spotify",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLinking(false)
    }
  }

  const handleLinkMusoAI = async () => {
    if (!musoAiUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Muso.AI URL or ID",
        variant: "destructive",
      })
      return
    }

    setIsLinking(true)
    try {
      const musoId = extractMusoAiId(musoAiUrl)
      if (!musoId) {
        throw new Error('Invalid Muso.AI URL or ID')
      }

      const { error } = await supabase
        .from('artists')
        .update({ muso_ai_profile_id: musoId })
        .eq('id', artist.id)

      if (error) throw error

      toast({
        title: "Success!",
        description: "Muso.AI account linked successfully",
      })
      
      window.location.reload()
    } catch (err: any) {
      toast({
        title: "Error linking Muso.AI",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLinking(false)
    }
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
    <div className="space-y-6">
      {/* Connection Status Cards - Redesigned */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spotify Card */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-base">Spotify</CardTitle>
                  <CardDescription className="text-xs">Music Streaming Platform</CardDescription>
                </div>
              </div>
              {artist.spotify_artist_id && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">Connected</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {artist.spotify_artist_id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">Artist ID</span>
                  <code className="text-xs font-mono">{artist.spotify_artist_id.substring(0, 12)}...</code>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(`https://open.spotify.com/artist/${artist.spotify_artist_id}`, '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  Open in Spotify
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="spotify-url" className="text-xs">Spotify Artist URL or ID</Label>
                  <Input
                    id="spotify-url"
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    placeholder="https://open.spotify.com/artist/..."
                    disabled={isLinking}
                    className="text-sm h-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleLinkSpotify} 
                    disabled={isLinking} 
                    size="sm" 
                    className="flex-1 h-9"
                  >
                    <LinkIcon className="h-3.5 w-3.5 mr-2" />
                    {isLinking ? 'Linking...' : 'Link Account'}
                  </Button>
                  <Button variant="outline" size="sm" className="h-9" asChild>
                    <a href="https://open.spotify.com/search" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Muso.AI Card */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-base">Muso.AI</CardTitle>
                  <CardDescription className="text-xs">Music Analytics Platform</CardDescription>
                </div>
              </div>
              {artist.muso_ai_profile_id && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Connected</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {artist.muso_ai_profile_id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">Profile ID</span>
                  <code className="text-xs font-mono">{artist.muso_ai_profile_id.substring(0, 12)}...</code>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-9"
                    onClick={() => window.open(`https://muso.ai/profile/${artist.muso_ai_profile_id}`, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    Open in Muso.AI
                  </Button>
                  <Button 
                    onClick={handleSyncMusoAIData} 
                    disabled={isSyncing} 
                    size="sm" 
                    variant="secondary"
                    className="h-9"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCcw className="h-3.5 w-3.5 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="h-3.5 w-3.5 mr-2" />
                        Sync
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="muso-url" className="text-xs">Muso.AI Profile URL or ID</Label>
                  <Input
                    id="muso-url"
                    value={musoAiUrl}
                    onChange={(e) => setMusoAiUrl(e.target.value)}
                    placeholder="https://muso.ai/profile/..."
                    disabled={isLinking}
                    className="text-sm h-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleLinkMusoAI} 
                    disabled={isLinking} 
                    size="sm" 
                    className="flex-1 h-9"
                  >
                    <LinkIcon className="h-3.5 w-3.5 mr-2" />
                    {isLinking ? 'Linking...' : 'Link Account'}
                  </Button>
                  <Button variant="outline" size="sm" className="h-9" asChild>
                    <a href="https://muso.ai" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs - Redesigned */}
      <Tabs defaultValue="spotify" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-11">
          <TabsTrigger value="spotify" className="gap-2">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Spotify Analytics
          </TabsTrigger>
          <TabsTrigger value="musoai" className="gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Muso.AI Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="spotify" className="mt-6">
          <Suspense fallback={<AnalyticsSkeleton />}>
            {artist.spotify_artist_id ? (
              <AnalyticsContentRedesigned artistId={artist.spotify_artist_id} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Connect Spotify Account</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Link your Spotify account above to view detailed analytics including streams, followers, and top tracks.
                  </p>
                </CardContent>
              </Card>
            )}
          </Suspense>
        </TabsContent>
        <TabsContent value="musoai" className="mt-6">
          <Suspense fallback={<AnalyticsSkeleton />}>
            {artist.muso_ai_profile_id ? (
              <MusoAiAnalyticsRedesigned artistId={artist.id} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Connect Muso.AI Account</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Link your Muso.AI account above to view advanced music analytics, credits, and collaborator insights.
                  </p>
                </CardContent>
              </Card>
            )}
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
