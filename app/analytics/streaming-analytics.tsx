'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  PageHeader, 
  StatsGrid, 
  ContentSection, 
  PageLayout,
  DataTable 
} from "@/components/ui/design-system"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Music, 
  Users, 
  Star, 
  Play, 
  Pause,
  TrendingUp,
  Headphones,
  Award,
  Calendar,
  Eye,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react'
import Image from 'next/image'

interface StreamingAnalyticsProps {
  artistId?: string
}

export default function StreamingAnalytics({ artistId }: StreamingAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [spotifyData, setSpotifyData] = useState<any>(null)
  const [musoAiData, setMusoAiData] = useState<any>(null)
  const [topTracks, setTopTracks] = useState<any[]>([])
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [albums, setAlbums] = useState<any[]>([])
  const [nowPlaying, setNowPlaying] = useState<string | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  
  // Pagination states
  const [tracksPage, setTracksPage] = useState(1)
  const [collaboratorsPage, setCollaboratorsPage] = useState(1)
  const [albumsPage, setAlbumsPage] = useState(1)
  const [tracksTotal, setTracksTotal] = useState(0)
  const [collaboratorsTotal, setCollaboratorsTotal] = useState(0)
  const [albumsTotal, setAlbumsTotal] = useState(0)
  const [loadingTracks, setLoadingTracks] = useState(false)
  const [loadingCollaborators, setLoadingCollaborators] = useState(false)
  const [loadingAlbums, setLoadingAlbums] = useState(false)
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'streams' | 'popularity' | 'date'>('popularity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const [showTrackDetail, setShowTrackDetail] = useState(false)
  
  const ITEMS_PER_PAGE = 12
  const supabase = createClient()

  useEffect(() => {
    fetchStreamingData()
    return () => {
      audio?.pause()
    }
  }, [artistId])

  // Load initial data after musoAiData is available
  useEffect(() => {
    if (musoAiData?.id) {
      fetchTracks(1)
      fetchCollaborators(1)
      fetchAlbums(1)
    }
  }, [musoAiData])

  const fetchStreamingData = async () => {
    setIsLoading(true)
    try {
      // Fetch Spotify data
      if (artistId) {
        try {
          const spotifyRes = await fetch(`/api/spotify/artist-analytics?artist_id=${artistId}`)
          if (spotifyRes.ok) {
            const spotifyData = await spotifyRes.json()
            setSpotifyData(spotifyData)
          } else {
            console.log('Spotify API not available, using mock data')
            // Mock Spotify data
            setSpotifyData({
              followers: 34088,
              monthlyListeners: 125000,
              popularity: 65,
              topTracks: [
                { 
                  id: 'spotify-1',
                  name: 'Impaciente', 
                  popularity: 75,
                  album: {
                    name: 'Impaciente - Single',
                    images: [{ url: 'https://picsum.photos/400/400?random=501' }],
                    release_date: '2023-08-15'
                  },
                  artists: [{ name: 'Marval' }],
                  duration_ms: 195000,
                  preview_url: null
                },
                { 
                  id: 'spotify-2',
                  name: 'De Lejos', 
                  popularity: 68,
                  album: {
                    name: 'De Lejos - Single',
                    images: [{ url: 'https://picsum.photos/400/400?random=502' }],
                    release_date: '2023-06-20'
                  },
                  artists: [{ name: 'Marval' }],
                  duration_ms: 210000,
                  preview_url: null
                },
                { 
                  id: 'spotify-3',
                  name: 'Me Amas', 
                  popularity: 72,
                  album: {
                    name: 'Me Amas - Single',
                    images: [{ url: 'https://picsum.photos/400/400?random=503' }],
                    release_date: '2023-04-10'
                  },
                  artists: [{ name: 'Marval' }],
                  duration_ms: 188000,
                  preview_url: null
                },
                { 
                  id: 'spotify-4',
                  name: 'Como Tu', 
                  popularity: 65,
                  album: {
                    name: 'Como Tu - Single',
                    images: [{ url: 'https://picsum.photos/400/400?random=504' }],
                    release_date: '2023-02-14'
                  },
                  artists: [{ name: 'Marval' }],
                  duration_ms: 203000,
                  preview_url: null
                },
                { 
                  id: 'spotify-5',
                  name: 'Real', 
                  popularity: 70,
                  album: {
                    name: 'Real - Single',
                    images: [{ url: 'https://picsum.photos/400/400?random=505' }],
                    release_date: '2022-12-05'
                  },
                  artists: [{ name: 'Marval' }],
                  duration_ms: 225000,
                  preview_url: null
                },
                { 
                  id: 'spotify-6',
                  name: 'Cuidala', 
                  popularity: 63,
                  album: {
                    name: 'Cuidala - Single',
                    images: [{ url: 'https://picsum.photos/400/400?random=506' }],
                    release_date: '2022-10-18'
                  },
                  artists: [{ name: 'Marval' }],
                  duration_ms: 192000,
                  preview_url: null
                },
                { 
                  id: 'spotify-7',
                  name: 'Nervioso', 
                  popularity: 58,
                  album: {
                    name: 'Nervioso - Single',
                    images: [{ url: 'https://picsum.photos/400/400?random=507' }],
                    release_date: '2022-08-22'
                  },
                  artists: [{ name: 'Marval' }],
                  duration_ms: 178000,
                  preview_url: null
                },
                { 
                  id: 'spotify-8',
                  name: 'Sin Ti', 
                  popularity: 61,
                  album: {
                    name: 'Sin Ti - Single',
                    images: [{ url: 'https://picsum.photos/400/400?random=508' }],
                    release_date: '2022-06-30'
                  },
                  artists: [{ name: 'Marval' }],
                  duration_ms: 215000,
                  preview_url: null
                }
              ],
              albums: [
                {
                  id: 'album-1',
                  name: 'Debut EP',
                  images: [{ url: 'https://picsum.photos/400/400?random=601' }],
                  release_date: '2023-09-01',
                  total_tracks: 5,
                  album_type: 'album'
                },
                {
                  id: 'album-2',
                  name: 'Singles Collection',
                  images: [{ url: 'https://picsum.photos/400/400?random=602' }],
                  release_date: '2022-12-15',
                  total_tracks: 8,
                  album_type: 'compilation'
                }
              ]
            })
          }
        } catch (error) {
          console.log('Spotify API error, using mock data:', error)
          setSpotifyData({
            followers: 34088,
            monthlyListeners: 125000,
            popularity: 65,
            topTracks: [
              { 
                id: 'spotify-1',
                name: 'Impaciente', 
                popularity: 75,
                album: {
                  name: 'Impaciente - Single',
                  images: [{ url: 'https://picsum.photos/400/400?random=501' }],
                  release_date: '2023-08-15'
                },
                artists: [{ name: 'Marval' }],
                duration_ms: 195000,
                preview_url: null
              },
              { 
                id: 'spotify-2',
                name: 'De Lejos', 
                popularity: 68,
                album: {
                  name: 'De Lejos - Single',
                  images: [{ url: 'https://picsum.photos/400/400?random=502' }],
                  release_date: '2023-06-20'
                },
                artists: [{ name: 'Marval' }],
                duration_ms: 210000,
                preview_url: null
              }
            ],
            albums: [
              {
                id: 'album-1',
                name: 'Debut EP',
                images: [{ url: 'https://picsum.photos/400/400?random=601' }],
                release_date: '2023-09-01',
                total_tracks: 5,
                album_type: 'album'
              }
            ]
          })
        }

        // Fetch Muso.AI data
        try {
          const musoRes = await fetch(`/api/muso-ai/profiles?artist_id=${artistId}`)
          if (musoRes.ok) {
            const musoData = await musoRes.json()
            setMusoAiData(musoData.profile_data)
            
            // Fetch top tracks
            if (musoData.profile_data?.id) {
              const creditsRes = await fetch(`/api/muso-ai/credits?profile_id=${musoData.profile_data.id}&limit=10`)
              if (creditsRes.ok) {
                const creditsData = await creditsRes.json()
                setTopTracks(creditsData.data?.items || [])
              }

              // Fetch collaborators
              const collabRes = await fetch(`/api/muso-ai/collaborators?profile_id=${musoData.profile_data.id}&limit=8`)
              if (collabRes.ok) {
                const collabData = await collabRes.json()
                setCollaborators(collabData.data?.items || [])
              }
            }
          } else {
            console.log('Muso.AI API not available, using mock data')
            // Mock Muso.AI data
            setMusoAiData({
              id: 'mock-id',
              name: 'Marval',
              avatarUrl: '/placeholder.svg',
              popularity: 39,
              creditCount: 7,
              collaboratorsCount: 5,
              commonCredits: ['Vocals', 'Songwriter', 'Producer']
            })
            
            // Mock top tracks
            setTopTracks([
              {
                track: {
                  id: '1',
                  title: 'Impaciente',
                  spotifyPreviewUrl: null
                },
                album: {
                  albumArt: '/placeholder.svg'
                },
                artists: [{ name: 'Marval' }],
                credits: [
                  { child: 'Vocals' },
                  { child: 'Songwriter' }
                ]
              },
              {
                track: {
                  id: '2',
                  title: 'De Lejos',
                  spotifyPreviewUrl: null
                },
                album: {
                  albumArt: '/placeholder.svg'
                },
                artists: [{ name: 'Marval' }],
                credits: [
                  { child: 'Vocals' },
                  { child: 'Producer' }
                ]
              },
              {
                track: {
                  id: '3',
                  title: 'Me Amas',
                  spotifyPreviewUrl: null
                },
                album: {
                  albumArt: '/placeholder.svg'
                },
                artists: [{ name: 'Marval' }],
                credits: [
                  { child: 'Vocals' },
                  { child: 'Songwriter' }
                ]
              }
            ])
            
            // Mock collaborators
            setCollaborators([
              {
                id: '1',
                name: 'Producer One',
                avatarUrl: '/placeholder.svg',
                popularity: 45,
                collaborationsCount: 12,
                commonCredits: ['Producer', 'Mixing']
              },
              {
                id: '2',
                name: 'Songwriter Two',
                avatarUrl: '/placeholder.svg',
                popularity: 38,
                collaborationsCount: 8,
                commonCredits: ['Songwriter', 'Vocals']
              }
            ])
          }
        } catch (error) {
          console.log('Muso.AI API error, using mock data:', error)
          // Use same mock data as above
          setMusoAiData({
            id: 'mock-id',
            name: 'Marval',
            avatarUrl: '/placeholder.svg',
            popularity: 39,
            creditCount: 7,
            collaboratorsCount: 5,
            commonCredits: ['Vocals', 'Songwriter', 'Producer']
          })
        }
      } else {
        // No artist ID provided, use default mock data
        setSpotifyData({
          followers: 34088,
          monthlyListeners: 125000,
          popularity: 65,
          topTracks: [
            { 
              id: 'spotify-1',
              name: 'Impaciente', 
              popularity: 75,
              album: {
                name: 'Impaciente - Single',
                images: [{ url: 'https://picsum.photos/400/400?random=501' }],
                release_date: '2023-08-15'
              },
              artists: [{ name: 'Marval' }],
              duration_ms: 195000,
              preview_url: null
            },
            { 
              id: 'spotify-2',
              name: 'De Lejos', 
              popularity: 68,
              album: {
                name: 'De Lejos - Single',
                images: [{ url: 'https://picsum.photos/400/400?random=502' }],
                release_date: '2023-06-20'
              },
              artists: [{ name: 'Marval' }],
              duration_ms: 210000,
              preview_url: null
            }
          ],
          albums: [
            {
              id: 'album-1',
              name: 'Debut EP',
              images: [{ url: 'https://picsum.photos/400/400?random=601' }],
              release_date: '2023-09-01',
              total_tracks: 5,
              album_type: 'album'
            }
          ]
        })
        
        setMusoAiData({
          id: 'mock-id',
          name: 'Marval',
          avatarUrl: '/placeholder.svg',
          popularity: 39,
          creditCount: 7,
          collaboratorsCount: 5,
          commonCredits: ['Vocals', 'Songwriter', 'Producer']
        })
        
        // Mock top tracks for default case
        setTopTracks([
          {
            track: {
              id: '1',
              title: 'Impaciente',
              spotifyPreviewUrl: null
            },
            album: {
              albumArt: '/placeholder.svg'
            },
            artists: [{ name: 'Marval' }],
            credits: [
              { child: 'Vocals' },
              { child: 'Songwriter' }
            ]
          },
          {
            track: {
              id: '2',
              title: 'De Lejos',
              spotifyPreviewUrl: null
            },
            album: {
              albumArt: '/placeholder.svg'
            },
            artists: [{ name: 'Marval' }],
            credits: [
              { child: 'Vocals' },
              { child: 'Producer' }
            ]
          },
          {
            track: {
              id: '3',
              title: 'Me Amas',
              spotifyPreviewUrl: null
            },
            album: {
              albumArt: '/placeholder.svg'
            },
            artists: [{ name: 'Marval' }],
            credits: [
              { child: 'Vocals' },
              { child: 'Songwriter' }
            ]
          },
          {
            track: {
              id: '4',
              title: 'Como Tu',
              spotifyPreviewUrl: null
            },
            album: {
              albumArt: '/placeholder.svg'
            },
            artists: [{ name: 'Marval' }],
            credits: [
              { child: 'Vocals' },
              { child: 'Producer' }
            ]
          },
          {
            track: {
              id: '5',
              title: 'Real',
              spotifyPreviewUrl: null
            },
            album: {
              albumArt: '/placeholder.svg'
            },
            artists: [{ name: 'Marval' }],
            credits: [
              { child: 'Vocals' },
              { child: 'Songwriter' }
            ]
          }
        ])
        
        // Mock collaborators for default case
        setCollaborators([
          {
            id: '1',
            name: 'Producer One',
            avatarUrl: '/placeholder.svg',
            popularity: 45,
            collaborationsCount: 12,
            commonCredits: ['Producer', 'Mixing']
          },
          {
            id: '2',
            name: 'Songwriter Two',
            avatarUrl: '/placeholder.svg',
            popularity: 38,
            collaborationsCount: 8,
            commonCredits: ['Songwriter', 'Vocals']
          },
          {
            id: '3',
            name: 'Mix Engineer',
            avatarUrl: '/placeholder.svg',
            popularity: 42,
            collaborationsCount: 15,
            commonCredits: ['Mixing', 'Mastering']
          },
          {
            id: '4',
            name: 'Featured Artist',
            avatarUrl: '/placeholder.svg',
            popularity: 52,
            collaborationsCount: 6,
            commonCredits: ['Vocals', 'Songwriter']
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching streaming data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayPreview = (trackId: string, previewUrl: string) => {
    if (audio) audio.pause()
    if (nowPlaying === trackId) {
      setAudio(null)
      setNowPlaying(null)
    } else {
      const newAudio = new Audio(previewUrl)
      setAudio(newAudio)
      setNowPlaying(trackId)
      newAudio.play()
      newAudio.onended = () => setNowPlaying(null)
    }
  }

  const handleSyncData = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/muso-ai/sync', { method: 'POST' })
      await fetchStreamingData()
    } catch (error) {
      console.error('Error syncing data:', error)
    }
  }

  // Format duration from milliseconds to MM:SS
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Filter and sort tracks
  const getFilteredAndSortedTracks = () => {
    let filtered = topTracks.filter(track => 
      track.track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artists?.some((artist: any) => 
        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      track.album?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.track.title.toLowerCase()
          bValue = b.track.title.toLowerCase()
          break
        case 'streams':
          aValue = a.streams || 0
          bValue = b.streams || 0
          break
        case 'popularity':
          aValue = a.popularity || 0
          bValue = b.popularity || 0
          break
        case 'date':
          aValue = new Date(a.track.releaseDate || a.album?.releaseYear || 0).getTime()
          bValue = new Date(b.track.releaseDate || b.album?.releaseYear || 0).getTime()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  // Handle track selection
  const handleTrackSelect = (track: any) => {
    setSelectedTrack(track)
    setShowTrackDetail(true)
  }

  // Fetch tracks with pagination
  const fetchTracks = async (page: number = 1) => {
    if (!musoAiData?.id) return
    
    setLoadingTracks(true)
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE
      const response = await fetch(`/api/muso-ai/credits?profile_id=${musoAiData.id}&limit=${ITEMS_PER_PAGE}&offset=${offset}`)
      
      if (response.ok) {
        const data = await response.json()
        if (page === 1) {
          setTopTracks(data.data?.items || [])
        } else {
          setTopTracks(prev => [...prev, ...(data.data?.items || [])])
        }
        setTracksTotal(data.data?.totalCount || 0)
      } else {
        // Mock data for demonstration
        const mockTracks = generateMockTracks(page)
        if (page === 1) {
          setTopTracks(mockTracks)
        } else {
          setTopTracks(prev => [...prev, ...mockTracks])
        }
        setTracksTotal(50) // Mock total
      }
    } catch (error) {
      console.error('Error fetching tracks:', error)
      // Fallback to mock data
      const mockTracks = generateMockTracks(page)
      if (page === 1) {
        setTopTracks(mockTracks)
      } else {
        setTopTracks(prev => [...prev, ...mockTracks])
      }
      setTracksTotal(50)
    } finally {
      setLoadingTracks(false)
    }
  }

  // Fetch collaborators with pagination
  const fetchCollaborators = async (page: number = 1) => {
    if (!musoAiData?.id) return
    
    setLoadingCollaborators(true)
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE
      const response = await fetch(`/api/muso-ai/collaborators?profile_id=${musoAiData.id}&limit=${ITEMS_PER_PAGE}&offset=${offset}`)
      
      if (response.ok) {
        const data = await response.json()
        if (page === 1) {
          setCollaborators(data.data?.items || [])
        } else {
          setCollaborators(prev => [...prev, ...(data.data?.items || [])])
        }
        setCollaboratorsTotal(data.data?.totalCount || 0)
      } else {
        // Mock data for demonstration
        const mockCollaborators = generateMockCollaborators(page)
        if (page === 1) {
          setCollaborators(mockCollaborators)
        } else {
          setCollaborators(prev => [...prev, ...mockCollaborators])
        }
        setCollaboratorsTotal(30) // Mock total
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error)
      // Fallback to mock data
      const mockCollaborators = generateMockCollaborators(page)
      if (page === 1) {
        setCollaborators(mockCollaborators)
      } else {
        setCollaborators(prev => [...prev, ...mockCollaborators])
      }
      setCollaboratorsTotal(30)
    } finally {
      setLoadingCollaborators(false)
    }
  }

  // Fetch albums with pagination
  const fetchAlbums = async (page: number = 1) => {
    setLoadingAlbums(true)
    try {
      // Mock albums data since this might not be available in the API
      const mockAlbums = generateMockAlbums(page)
      if (page === 1) {
        setAlbums(mockAlbums)
      } else {
        setAlbums(prev => [...prev, ...mockAlbums])
      }
      setAlbumsTotal(25) // Mock total
    } catch (error) {
      console.error('Error fetching albums:', error)
    } finally {
      setLoadingAlbums(false)
    }
  }

  // Generate mock data functions
  const generateMockTracks = (page: number) => {
    const trackNames = [
      'Impaciente', 'De Lejos', 'Me Amas', 'Como Tu', 'Real', 'Cuidala', 'Nervioso',
      'Sin Ti', 'Corazón', 'Bailando', 'Noche', 'Sueños', 'Amor', 'Vida', 'Tiempo',
      'Fuego', 'Luna', 'Sol', 'Mar', 'Cielo', 'Estrella', 'Viento', 'Lluvia', 'Tierra'
    ]
    
    const credits = ['Vocals', 'Songwriter', 'Producer', 'Mixing', 'Mastering', 'Guitar', 'Piano']
    const artists = ['Marval', 'Colaborador 1', 'Colaborador 2', 'Featured Artist']
    
    return Array.from({ length: ITEMS_PER_PAGE }, (_, i) => {
      const trackIndex = (page - 1) * ITEMS_PER_PAGE + i
      if (trackIndex >= trackNames.length) return null
      
      return {
        track: {
          id: `track-${trackIndex + 1}`,
          title: trackNames[trackIndex],
          spotifyPreviewUrl: Math.random() > 0.5 ? 'https://example.com/preview.mp3' : null,
          duration: Math.floor(Math.random() * 180000) + 120000, // 2-5 minutes
          releaseDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString()
        },
        album: {
          albumArt: `https://picsum.photos/300/300?random=${trackIndex + 1}`,
          name: `Album ${Math.floor(trackIndex / 3) + 1}`,
          releaseYear: 2020 + Math.floor(Math.random() * 4)
        },
        artists: [
          { name: artists[0] },
          ...(Math.random() > 0.7 ? [{ name: artists[Math.floor(Math.random() * (artists.length - 1)) + 1] }] : [])
        ],
        credits: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
          child: credits[Math.floor(Math.random() * credits.length)]
        })),
        streams: Math.floor(Math.random() * 10000000) + 100000,
        popularity: Math.floor(Math.random() * 40) + 30
      }
    }).filter(Boolean)
  }

  const generateMockCollaborators = (page: number) => {
    const names = [
      'Producer One', 'Songwriter Two', 'Mix Engineer', 'Featured Artist', 'Vocal Coach',
      'Guitar Player', 'Drummer', 'Bass Player', 'Pianist', 'Sound Designer',
      'Mastering Engineer', 'Session Musician', 'Backup Vocalist', 'String Arranger'
    ]
    
    const roles = ['Producer', 'Songwriter', 'Mixing', 'Mastering', 'Musician', 'Vocalist', 'Arranger']
    
    return Array.from({ length: ITEMS_PER_PAGE }, (_, i) => {
      const collabIndex = (page - 1) * ITEMS_PER_PAGE + i
      if (collabIndex >= names.length) return null
      
      return {
        id: `collab-${collabIndex + 1}`,
        name: names[collabIndex],
        avatarUrl: `https://picsum.photos/150/150?random=${collabIndex + 100}`,
        popularity: Math.floor(Math.random() * 60) + 20,
        collaborationsCount: Math.floor(Math.random() * 20) + 5,
        commonCredits: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
          roles[Math.floor(Math.random() * roles.length)]
        ),
        totalTracks: Math.floor(Math.random() * 50) + 10,
        genres: ['Latin', 'R&B', 'Pop', 'Urban'].slice(0, Math.floor(Math.random() * 3) + 1)
      }
    }).filter(Boolean)
  }

  const generateMockAlbums = (page: number) => {
    const albumNames = [
      'Debut Album', 'Second Chapter', 'Evolution', 'Midnight Sessions', 'Urban Vibes',
      'Acoustic Sessions', 'Remix Collection', 'Live Performance', 'Collaborations'
    ]
    
    return Array.from({ length: ITEMS_PER_PAGE }, (_, i) => {
      const albumIndex = (page - 1) * ITEMS_PER_PAGE + i
      if (albumIndex >= albumNames.length) return null
      
      return {
        id: `album-${albumIndex + 1}`,
        name: albumNames[albumIndex],
        coverArt: `https://picsum.photos/400/400?random=${albumIndex + 200}`,
        releaseDate: new Date(2018 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), 1).toISOString(),
        trackCount: Math.floor(Math.random() * 15) + 8,
        totalStreams: Math.floor(Math.random() * 50000000) + 1000000,
        type: ['Album', 'EP', 'Single'][Math.floor(Math.random() * 3)],
        label: ['Independent', 'Major Label', 'Indie Label'][Math.floor(Math.random() * 3)]
      }
    }).filter(Boolean)
  }

  // Prepare stats data
  const statsData = [
    {
      title: "Spotify Followers",
      value: spotifyData?.followers?.toLocaleString() || "0",
      change: "+5%",
      changeType: 'positive' as const,
      icon: Users,
      description: "Total followers"
    },
    {
      title: "Muso.AI Popularity",
      value: musoAiData?.popularity || "0",
      icon: Star,
      description: "Industry ranking"
    },
    {
      title: "Total Credits",
      value: musoAiData?.creditCount || 0,
      change: "+12%",
      changeType: 'positive' as const,
      icon: Music,
      description: "Music credits"
    },
    {
      title: "Collaborators",
      value: musoAiData?.collaboratorsCount || 0,
      icon: Users,
      description: "Industry connections"
    },
    {
      title: "Monthly Listeners",
      value: spotifyData?.monthlyListeners?.toLocaleString() || "0",
      change: "+8%",
      changeType: 'positive' as const,
      icon: Headphones,
      description: "Spotify streams",
      colSpan: 2
    }
  ]

  // Enhanced track columns with more data
  const trackColumns = [
    {
      key: 'album',
      label: 'Cover',
      render: (value: any, item: any) => (
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Image 
              src={value?.albumArt || '/placeholder.svg'} 
              alt={item.track.title} 
              width={60} 
              height={60} 
              className="w-15 h-15 rounded-lg object-cover shadow-md group-hover:shadow-lg transition-shadow"
            />
            {item.track.spotifyPreviewUrl && (
              <Button 
                variant="ghost" 
                size="sm"
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                onClick={() => handlePlayPreview(item.track.id, item.track.spotifyPreviewUrl)}
              >
                {nowPlaying === item.track.id ? 
                  <Pause className="h-6 w-6 text-white" /> : 
                  <Play className="h-6 w-6 text-white" />
                }
              </Button>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'track',
      label: 'Track Info',
      render: (value: any, item: any) => (
        <div className="min-w-0">
          <p className="font-semibold text-base truncate">{value.title}</p>
          <p className="text-sm text-muted-foreground truncate">
            {item.artists?.map((a: any) => a.name).join(', ')}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.album?.name} • {item.album?.releaseYear}
          </p>
        </div>
      )
    },
    {
      key: 'streams',
      label: 'Streams',
      render: (value: number) => (
        <div className="text-right">
          <p className="font-medium">{value?.toLocaleString() || '0'}</p>
          <p className="text-xs text-muted-foreground">plays</p>
        </div>
      )
    },
    {
      key: 'popularity',
      label: 'Popularity',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="w-12 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${value || 0}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{value || 0}</span>
        </div>
      )
    },
    {
      key: 'credits',
      label: 'Credits',
      render: (value: any[]) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 2).map((credit: any, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {credit.child}
            </Badge>
          ))}
          {value?.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      )
    }
  ]

  // Enhanced collaborators table columns
  const collaboratorColumns = [
    {
      key: 'avatarUrl',
      label: 'Avatar',
      render: (value: string, item: any) => (
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shadow-md">
          {value ? (
            <Image 
              src={value} 
              alt={item.name} 
              width={48} 
              height={48} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-primary">
              {item.name?.[0] || '?'}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Collaborator Info',
      render: (value: string, item: any) => (
        <div className="min-w-0">
          <p className="font-semibold text-base truncate">{value}</p>
          <p className="text-sm text-muted-foreground truncate">
            {item.commonCredits?.slice(0, 2).join(', ')}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.genres?.join(', ')}
          </p>
        </div>
      )
    },
    {
      key: 'popularity',
      label: 'Popularity',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-400" />
          <div className="flex items-center gap-2">
            <div className="w-12 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full" 
                style={{ width: `${value || 0}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{value || 0}</span>
          </div>
        </div>
      )
    },
    {
      key: 'collaborationsCount',
      label: 'Collaborations',
      render: (value: number, item: any) => (
        <div className="text-center">
          <p className="font-medium">{value || 0}</p>
          <p className="text-xs text-muted-foreground">
            {item.totalTracks || 0} tracks
          </p>
        </div>
      )
    }
  ]

  // Albums table columns
  const albumColumns = [
    {
      key: 'coverArt',
      label: 'Cover',
      render: (value: string, item: any) => (
        <div className="relative group">
          <Image 
            src={value || '/placeholder.svg'} 
            alt={item.name} 
            width={80} 
            height={80} 
            className="w-20 h-20 rounded-lg object-cover shadow-lg group-hover:shadow-xl transition-shadow"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Eye className="h-6 w-6 text-white" />
          </div>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Album Info',
      render: (value: string, item: any) => (
        <div className="min-w-0">
          <p className="font-semibold text-base truncate">{value}</p>
          <p className="text-sm text-muted-foreground">
            {item.type} • {item.trackCount} tracks
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(item.releaseDate).getFullYear()} • {item.label}
          </p>
        </div>
      )
    },
    {
      key: 'totalStreams',
      label: 'Total Streams',
      render: (value: number) => (
        <div className="text-right">
          <p className="font-medium">{value?.toLocaleString() || '0'}</p>
          <p className="text-xs text-muted-foreground">streams</p>
        </div>
      )
    },
    {
      key: 'releaseDate',
      label: 'Release Date',
      render: (value: string) => (
        <div className="text-center">
          <p className="font-medium">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-muted-foreground">
            {Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24 * 365))} years ago
          </p>
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout spacing="normal">
      {/* Page Header */}
      <PageHeader
        title="Streaming Analytics"
        subtitle="Spotify & Muso.AI Insights"
        description="Comprehensive streaming data, industry connections, and performance metrics across platforms."
        badge={{
          text: spotifyData || musoAiData ? "Demo Data" : "No Data",
          variant: 'secondary'
        }}
        avatar={musoAiData?.avatarUrl ? {
          src: musoAiData.avatarUrl,
          fallback: musoAiData.name?.[0] || 'A'
        } : undefined}
        actions={[
          {
            label: "Sync Muso.AI Data",
            onClick: handleSyncData,
            variant: 'outline',
            icon: RefreshCw
          },
          {
            label: "View Trends",
            onClick: () => console.log('View trends'),
            icon: TrendingUp
          }
        ]}
      />

      {/* Demo Data Notice */}
      {(spotifyData || musoAiData) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Demo Data Active</h3>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            You're viewing demonstration data for Marval's streaming analytics. 
            Connect your Spotify for Artists and Muso.AI accounts to see real data.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <StatsGrid stats={statsData} columns={6} />

      {/* Content Tabs */}
      <ContentSection
        title="Streaming Insights"
        description="Detailed analytics from Spotify and Muso.AI platforms"
        icon={Music}
      >
        <Tabs defaultValue="tracks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tracks">
              Tracks ({tracksTotal})
            </TabsTrigger>
            <TabsTrigger value="albums">
              Albums ({albumsTotal})
            </TabsTrigger>
            <TabsTrigger value="collaborators">
              Collaborators ({collaboratorsTotal})
            </TabsTrigger>
            <TabsTrigger value="spotify">
              Spotify Data
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracks">
            <div className="space-y-6">
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tracks, artists, or albums..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="streams">Streams</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="date">Release Date</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Filtered Results Info */}
              {searchQuery && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Found {getFilteredAndSortedTracks().length} tracks</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="h-6 px-2"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              )}

              {/* Tracks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFilteredAndSortedTracks().map((track) => (
                  <div key={track.track.id} className="group cursor-pointer" onClick={() => handleTrackSelect(track)}>
                    <div className="relative mb-3">
                      <Image
                        src={track.album?.albumArt || '/placeholder.svg'}
                        alt={track.track.title}
                        width={200}
                        height={200}
                        className="w-full aspect-square rounded-lg object-cover shadow-md group-hover:shadow-xl transition-shadow"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="flex gap-2">
                          {track.track.spotifyPreviewUrl && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-white/90 text-black hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlayPreview(track.track.id, track.track.spotifyPreviewUrl)
                              }}
                            >
                              {nowPlaying === track.track.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white/90 text-black hover:bg-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Popularity Badge */}
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                        {track.popularity || 0}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {track.track.title}
                      </h4>
                      <p className="text-muted-foreground text-xs truncate">
                        {track.artists?.map((artist: any) => artist.name).join(', ')}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{track.streams?.toLocaleString() || '0'} streams</span>
                        <span>{track.album?.releaseYear || 'N/A'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {track.credits?.slice(0, 2).map((credit: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {credit.child}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {getFilteredAndSortedTracks().length === 0 && (
                <div className="text-center py-12">
                  <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? 'No tracks found' : 'No tracks available'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? `No tracks match "${searchQuery}". Try a different search term.`
                      : 'Sync Muso.AI data to see track analytics'
                    }
                  </p>
                </div>
              )}
              
              {/* Load More Button for Tracks */}
              {!searchQuery && topTracks.length < tracksTotal && (
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={() => {
                      const nextPage = Math.floor(topTracks.length / ITEMS_PER_PAGE) + 1
                      fetchTracks(nextPage)
                    }}
                    disabled={loadingTracks}
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    {loadingTracks ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Tracks ({tracksTotal - topTracks.length} remaining)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="albums">
            <div className="space-y-4">
              <DataTable
                title="Albums & EPs"
                description={`Showing ${albums.length} of ${albumsTotal} releases with streaming data`}
                data={albums}
                columns={albumColumns}
                emptyState={{
                  title: "No albums found",
                  description: "Albums and EPs will appear here when available",
                  icon: Music
                }}
              />
              
              {/* Load More Button for Albums */}
              {albums.length < albumsTotal && (
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={() => {
                      const nextPage = Math.floor(albums.length / ITEMS_PER_PAGE) + 1
                      fetchAlbums(nextPage)
                    }}
                    disabled={loadingAlbums}
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    {loadingAlbums ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Albums ({albumsTotal - albums.length} remaining)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="collaborators">
            <div className="space-y-4">
              <DataTable
                title="Industry Collaborators"
                description={`Showing ${collaborators.length} of ${collaboratorsTotal} collaborators in your network`}
                data={collaborators}
                columns={collaboratorColumns}
                emptyState={{
                  title: "No collaborators found",
                  description: "Sync Muso.AI data to see collaboration network",
                  icon: Users
                }}
              />
              
              {/* Load More Button for Collaborators */}
              {collaborators.length < collaboratorsTotal && (
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={() => {
                      const nextPage = Math.floor(collaborators.length / ITEMS_PER_PAGE) + 1
                      fetchCollaborators(nextPage)
                    }}
                    disabled={loadingCollaborators}
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    {loadingCollaborators ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Collaborators ({collaboratorsTotal - collaborators.length} remaining)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="spotify">
            <div className="space-y-8">
              {/* Spotify Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-900 dark:text-green-100">Followers</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{spotifyData?.followers?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Total followers</p>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium text-purple-900 dark:text-purple-100">Monthly Listeners</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{spotifyData?.monthlyListeners?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Active listeners</p>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-orange-900 dark:text-orange-100">Popularity</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{spotifyData?.popularity || '0'}</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Spotify score</p>
                </div>
              </div>

              {/* Albums/Releases List */}
              {spotifyData?.albums && spotifyData.albums.length > 0 && (
                <ContentSection
                  title="Latest Releases"
                  description="Recent albums and EPs on Spotify"
                  icon={Music}
                  actions={[
                    {
                      label: "View All on Spotify",
                      onClick: () => window.open('https://open.spotify.com/artist/marval', '_blank'),
                      icon: ExternalLink,
                      variant: 'outline'
                    }
                  ]}
                >
                  <div className="space-y-4">
                    {spotifyData.albums.map((album: any) => (
                      <div key={album.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <Image
                          src={album.images[0]?.url || '/placeholder.svg'}
                          alt={album.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-lg object-cover shadow-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg truncate">{album.name}</h4>
                          <p className="text-muted-foreground text-sm">
                            {album.album_type} • {album.total_tracks} tracks
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Released {new Date(album.release_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ContentSection>
              )}

              {/* Songs Grid */}
              {spotifyData?.topTracks && spotifyData.topTracks.length > 0 && (
                <ContentSection
                  title="All Songs"
                  description={`${spotifyData.topTracks.length} tracks available on Spotify`}
                  icon={Music}
                  actions={[
                    {
                      label: "Open Spotify",
                      onClick: () => window.open('https://artists.spotify.com', '_blank'),
                      icon: ExternalLink,
                      variant: 'outline'
                    }
                  ]}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {spotifyData.topTracks.map((track: any) => (
                      <div key={track.id} className="group cursor-pointer">
                        <div className="relative mb-3">
                          <Image
                            src={track.album.images[0]?.url || '/placeholder.svg'}
                            alt={track.name}
                            width={200}
                            height={200}
                            className="w-full aspect-square rounded-lg object-cover shadow-lg group-hover:shadow-xl transition-shadow"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            {track.preview_url ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="bg-white/90 text-black hover:bg-white"
                                onClick={() => handlePlayPreview(track.id, track.preview_url)}
                              >
                                {nowPlaying === track.id ? (
                                  <Pause className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5" />
                                )}
                              </Button>
                            ) : (
                              <div className="bg-white/90 text-black px-3 py-1 rounded-full text-xs font-medium">
                                Preview N/A
                              </div>
                            )}
                          </div>
                          
                          {/* Popularity Badge */}
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {track.popularity}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                            {track.name}
                          </h4>
                          <p className="text-muted-foreground text-xs truncate">
                            {track.artists.map((artist: any) => artist.name).join(', ')}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatDuration(track.duration_ms)}</span>
                            <span>{new Date(track.album.release_date).getFullYear()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ContentSection>
              )}

              {/* Empty State */}
              {(!spotifyData?.topTracks || spotifyData.topTracks.length === 0) && (
                <div className="text-center py-12">
                  <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Spotify Data Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your Spotify for Artists account to see your releases and tracks
                  </p>
                  <Button onClick={() => window.open('https://artists.spotify.com', '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Spotify for Artists
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </ContentSection>

      {/* Track Detail Modal */}
      <Dialog open={showTrackDetail} onOpenChange={setShowTrackDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Music className="h-5 w-5" />
              Track Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTrack && (
            <div className="space-y-6">
              {/* Track Header */}
              <div className="flex gap-4">
                <Image
                  src={selectedTrack.album?.albumArt || '/placeholder.svg'}
                  alt={selectedTrack.track.title}
                  width={120}
                  height={120}
                  className="w-30 h-30 rounded-lg object-cover shadow-lg"
                />
                <div className="flex-1 space-y-2">
                  <h2 className="text-2xl font-bold">{selectedTrack.track.title}</h2>
                  <p className="text-lg text-muted-foreground">
                    {selectedTrack.artists?.map((artist: any) => artist.name).join(', ')}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedTrack.album?.name} • {selectedTrack.album?.releaseYear}
                  </p>
                  
                  {/* Play Button */}
                  {selectedTrack.track.spotifyPreviewUrl && (
                    <Button
                      onClick={() => handlePlayPreview(selectedTrack.track.id, selectedTrack.track.spotifyPreviewUrl)}
                      className="mt-3"
                    >
                      {nowPlaying === selectedTrack.track.id ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Preview
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Play Preview
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="text-2xl font-bold text-primary">{selectedTrack.popularity || 0}</div>
                  <div className="text-sm text-muted-foreground">Popularity</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="text-2xl font-bold text-primary">{selectedTrack.streams?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-muted-foreground">Streams</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="text-2xl font-bold text-primary">{formatDuration(selectedTrack.track.duration || 0)}</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="text-2xl font-bold text-primary">{selectedTrack.album?.releaseYear || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Year</div>
                </div>
              </div>

              {/* Credits Section */}
              {selectedTrack.credits && selectedTrack.credits.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Credits & Roles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrack.credits.map((credit: any, index: number) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                        {credit.child}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Album Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Album Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Album:</span>
                    <span className="font-medium">{selectedTrack.album?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Release Year:</span>
                    <span className="font-medium">{selectedTrack.album?.releaseYear || 'Unknown'}</span>
                  </div>
                  {selectedTrack.track.releaseDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Release Date:</span>
                      <span className="font-medium">{new Date(selectedTrack.track.releaseDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </h3>
                <div className="space-y-3">
                  {/* Popularity Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Popularity Score</span>
                      <span>{selectedTrack.popularity || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${selectedTrack.popularity || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Stream Count with Visual */}
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Streams</div>
                        <div className="text-xl font-bold">{selectedTrack.streams?.toLocaleString() || '0'}</div>
                      </div>
                      <Headphones className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Spotify
                </Button>
                <Button variant="outline" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  View Collaborators
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
