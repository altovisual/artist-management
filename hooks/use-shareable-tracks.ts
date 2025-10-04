'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ShareableTrack {
  id: string
  user_id: string
  artist_id?: string
  track_name: string
  artist_name: string
  album_name?: string
  cover_image_url?: string
  audio_file_url: string
  duration_ms?: number
  share_code: string
  share_url?: string
  is_active: boolean
  is_public: boolean
  password_hash?: string
  max_plays?: number
  expires_at?: string
  description?: string
  genre?: string
  release_date?: string
  total_plays: number
  unique_listeners: number
  total_listen_time_ms: number
  avg_completion_rate: number
  created_at: string
  updated_at: string
}

export interface TrackPlay {
  id: string
  shareable_track_id: string
  share_code: string
  session_id: string
  user_id?: string
  listener_ip?: string
  listener_country?: string
  listener_city?: string
  device_type?: string
  browser?: string
  os?: string
  referrer_url?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  started_at: string
  ended_at?: string
  listen_duration_ms: number
  max_position_reached_ms: number
  completion_percentage: number
  completed: boolean
  play_count: number
  pause_count: number
  seek_count: number
}

export interface TrackAnalytics {
  total_plays: number
  unique_listeners: number
  total_listen_time_ms: number
  avg_listen_time_ms: number
  completion_rate: number
  total_completes: number
  top_countries: Array<{ country: string; plays: number }>
  top_devices: Array<{ device_type: string; plays: number }>
  top_referrers: Array<{ referrer_url: string; plays: number }>
  plays_by_day: Array<{ date: string; plays: number }>
}

export function useShareableTracks() {
  const supabase = createClient()
  const [tracks, setTracks] = useState<ShareableTrack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's shareable tracks
  const fetchTracks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('shareable_tracks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTracks(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching shareable tracks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Create new shareable track
  const createTrack = async (trackData: {
    track_name: string
    artist_name: string
    album_name?: string
    cover_image_url?: string
    audio_file_url: string
    duration_ms?: number
    artist_id?: string
    description?: string
    genre?: string
    release_date?: string
    is_public?: boolean
    password?: string
    max_plays?: number
    expires_at?: string
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate share code
      const { data: shareCodeData, error: codeError } = await supabase
        .rpc('generate_share_code')

      if (codeError) throw codeError
      const shareCode = shareCodeData as string

      // Create share URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const shareUrl = `${baseUrl}/listen/${shareCode}`

      // Insert track
      const { data, error } = await supabase
        .from('shareable_tracks')
        .insert({
          ...trackData,
          user_id: user.id,
          share_code: shareCode,
          share_url: shareUrl
        })
        .select()
        .single()

      if (error) throw error

      await fetchTracks()
      return data as ShareableTrack
    } catch (err: any) {
      setError(err.message)
      console.error('Error creating shareable track:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Update track
  const updateTrack = async (trackId: string, updates: Partial<ShareableTrack>) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('shareable_tracks')
        .update(updates)
        .eq('id', trackId)
        .select()
        .single()

      if (error) throw error

      await fetchTracks()
      return data as ShareableTrack
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating shareable track:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Delete track
  const deleteTrack = async (trackId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('shareable_tracks')
        .delete()
        .eq('id', trackId)

      if (error) throw error

      await fetchTracks()
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting shareable track:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Get track analytics
  const getTrackAnalytics = async (
    trackId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TrackAnalytics | null> => {
    try {
      const { data, error } = await supabase.rpc('get_shareable_track_analytics', {
        p_track_id: trackId,
        p_start_date: startDate?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        p_end_date: endDate?.toISOString() || new Date().toISOString()
      })

      if (error) throw error
      return data?.[0] || null
    } catch (err: any) {
      console.error('Error fetching track analytics:', err)
      return null
    }
  }

  // Toggle track active status
  const toggleActive = async (trackId: string, isActive: boolean) => {
    return updateTrack(trackId, { is_active: isActive })
  }

  useEffect(() => {
    fetchTracks()
  }, [])

  return {
    tracks,
    isLoading,
    error,
    fetchTracks,
    createTrack,
    updateTrack,
    deleteTrack,
    getTrackAnalytics,
    toggleActive
  }
}

// Hook for public track access (no auth required)
export function usePublicTrack(shareCode: string) {
  const supabase = createClient()
  const [track, setTrack] = useState<ShareableTrack | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrack = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .rpc('get_shareable_track_by_code', { p_share_code: shareCode })

        if (error) {
          console.error('RPC Error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          throw new Error(error.message || 'Failed to fetch track')
        }
        
        if (!data || data.length === 0) {
          throw new Error('Track not found or no longer available')
        }

        setTrack(data[0] as any)
      } catch (err: any) {
        const errorMessage = err?.message || err?.toString() || 'Unknown error occurred'
        setError(errorMessage)
        console.error('Error fetching public track:', {
          message: errorMessage,
          error: err,
          shareCode
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (shareCode) {
      fetchTrack()
    }
  }, [shareCode, supabase])

  return { track, isLoading, error }
}
