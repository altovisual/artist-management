'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { AnalyticsSkeleton } from '@/components/analytics-skeleton'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Users, TrendingUp, Music, DollarSign, Filter, Search, BarChart3, Play, ExternalLink, Headphones, X, Trash2, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArtistAnalyticsDashboard } from '@/components/artist-analytics-dashboard'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ArtistData {
  id: string;
  name: string;
  genre: string | null;
  spotify_artist_id: string | null;
  muso_ai_profile_id: string | null;
  image_url: string | null;
}

export default function AnalyticsPage() {
  const [allArtists, setAllArtists] = useState<ArtistData[]>([])
  const [filteredArtists, setFilteredArtists] = useState<ArtistData[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [genreFilter, setGenreFilter] = useState('all')
  const [connectionFilter, setConnectionFilter] = useState('all')
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const handleDeleteUnconnectedArtists = async () => {
    // Contar cuántos artistas se eliminarán
    const unconnectedCount = allArtists.filter(
      a => !a.spotify_artist_id && !a.muso_ai_profile_id
    ).length

    if (unconnectedCount === 0) {
      toast({
        title: "No hay artistas para eliminar",
        description: "Todos los artistas tienen al menos una conexión",
      })
      return
    }

    const confirmMessage = `⚠️ ADVERTENCIA: Vas a eliminar ${unconnectedCount} artista(s) sin conexiones.\n\nArtistas que se eliminarán:\n${allArtists
      .filter(a => !a.spotify_artist_id && !a.muso_ai_profile_id)
      .map(a => `• ${a.name}`)
      .join('\n')}\n\n¿Estás SEGURO? Esta acción NO se puede deshacer.\n\nEscribe "ELIMINAR" para confirmar:`

    const userInput = prompt(confirmMessage)
    
    if (userInput !== 'ELIMINAR') {
      toast({
        title: "Cancelado",
        description: "No se eliminó ningún artista",
      })
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('artists')
        .delete()
        .is('spotify_artist_id', null)
        .is('muso_ai_profile_id', null)

      if (error) throw error

      toast({
        title: "Artistas eliminados",
        description: `Se eliminaron ${unconnectedCount} artistas sin conexiones`,
      })

      // Recargar la lista
      window.location.reload()
    } catch (err: any) {
      toast({
        title: "Error al eliminar",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/auth/login')
          return
        }

        // Check user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const userIsAdmin = profile?.role === 'admin' || user.app_metadata?.role === 'admin'
        setIsAdmin(userIsAdmin)

        if (!userIsAdmin) {
          router.push('/dashboard')
          return
        }

        // Admin: Load all artists with full data
        const { data: artists, error: artistsError } = await supabase
          .from('artists')
          .select('id, name, genre, spotify_artist_id, muso_ai_profile_id, image_url')
          .order('name')

        if (artistsError) {
          console.error('Error loading artists:', artistsError)
          setAllArtists([])
          setFilteredArtists([])
        } else {
          setAllArtists(artists || [])
          setFilteredArtists(artists || [])
        }
      } catch (err: any) {
        toast({
          title: "Error loading analytics",
          description: err.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter artists based on search and filters
  useEffect(() => {
    let filtered = allArtists

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(artist =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Genre filter
    if (genreFilter !== 'all') {
      filtered = filtered.filter(artist => artist.genre === genreFilter)
    }

    // Connection filter
    if (connectionFilter === 'spotify') {
      filtered = filtered.filter(artist => artist.spotify_artist_id)
    } else if (connectionFilter === 'musoai') {
      filtered = filtered.filter(artist => artist.muso_ai_profile_id)
    } else if (connectionFilter === 'both') {
      filtered = filtered.filter(artist => artist.spotify_artist_id && artist.muso_ai_profile_id)
    } else if (connectionFilter === 'none') {
      filtered = filtered.filter(artist => !artist.spotify_artist_id && !artist.muso_ai_profile_id)
    }

    setFilteredArtists(filtered)
  }, [searchQuery, genreFilter, connectionFilter, allArtists])

  if (loading) {
    return (
      <DashboardLayout>
        <AnalyticsSkeleton />
      </DashboardLayout>
    )
  }

  if (!isAdmin) {
    return null
  }

  const genres = Array.from(new Set(allArtists.map(a => a.genre).filter(Boolean)))
  const totalArtists = allArtists.length
  const withSpotify = allArtists.filter(a => a.spotify_artist_id).length
  const withMusoAI = allArtists.filter(a => a.muso_ai_profile_id).length
  const fullyConnected = allArtists.filter(a => a.spotify_artist_id && a.muso_ai_profile_id).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Overview of all artists and their platform connections
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteUnconnectedArtists}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Trash2 className="h-4 w-4 animate-pulse" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Unconnected Artists
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Artists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArtists}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Spotify Connected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{withSpotify}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalArtists > 0 ? Math.round((withSpotify / totalArtists) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Muso.AI Connected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{withMusoAI}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalArtists > 0 ? Math.round((withMusoAI / totalArtists) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fully Connected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{fullyConnected}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Both platforms linked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Genre</label>
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre as string}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Connection Status</label>
                <Select value={connectionFilter} onValueChange={setConnectionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All artists" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Artists</SelectItem>
                    <SelectItem value="both">Both Platforms</SelectItem>
                    <SelectItem value="spotify">Spotify Only</SelectItem>
                    <SelectItem value="musoai">Muso.AI Only</SelectItem>
                    <SelectItem value="none">Not Connected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Artists Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Artists ({filteredArtists.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedArtist(artist)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {artist.image_url ? (
                        <img src={artist.image_url} alt={artist.name} className="h-full w-full object-cover" />
                      ) : (
                        <Music className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground">{artist.genre || 'No genre'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {artist.spotify_artist_id ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Spotify
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="opacity-50">
                        No Spotify
                      </Badge>
                    )}
                    {artist.muso_ai_profile_id ? (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Muso.AI
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="opacity-50">
                        No Muso.AI
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {filteredArtists.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  {allArtists.length === 0 ? (
                    <div className="space-y-2">
                      <p className="font-semibold">No artists in database</p>
                      <p className="text-sm">Create artists from the Dashboard to see them here</p>
                      <Button asChild className="mt-4">
                        <a href="/artists/new">Create First Artist</a>
                      </Button>
                    </div>
                  ) : (
                    <p>No artists found matching your filters</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para mostrar dashboard de rendimiento del artista */}
      <Dialog open={!!selectedArtist} onOpenChange={(open) => !open && setSelectedArtist(null)}>
        <DialogContent className="!max-w-[92vw] !w-[92vw] !h-[92vh] max-h-[92vh] overflow-y-auto p-0" showCloseButton={false}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10 flex flex-row items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {selectedArtist?.name} - Performance Dashboard
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setSelectedArtist(null)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          <div className="px-8 pb-8 pt-6">
            {selectedArtist && (
              <ArtistAnalyticsDashboard
                artist={selectedArtist}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}