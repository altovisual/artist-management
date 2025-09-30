'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

export interface AudioTrackInfo {
  trackId: string
  trackName: string
  artistName?: string
  albumName?: string
  durationMs?: number
  source?: 'spotify' | 'muso_ai' | 'creative_vault' | 'other'
}

export interface AudioAnalyticsEvent {
  eventType: 'play' | 'pause' | 'complete' | 'seek' | 'progress' | 'error'
  currentPositionMs: number
  previousPositionMs?: number
  listenDurationMs?: number
}

export interface UseAudioAnalyticsOptions {
  trackInfo: AudioTrackInfo
  audioElement: HTMLAudioElement | null
  enabled?: boolean
  progressIntervalMs?: number // Default: 30000 (30 seconds)
}

export function useAudioAnalytics({
  trackInfo,
  audioElement,
  enabled = true,
  progressIntervalMs = 30000
}: UseAudioAnalyticsOptions) {
  const supabase = createClient()
  const sessionIdRef = useRef<string>(uuidv4())
  const lastPositionRef = useRef<number>(0)
  const playStartTimeRef = useRef<number | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Get user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [supabase])

  // Detect device type
  const getDeviceType = (): string => {
    if (typeof window === 'undefined') return 'unknown'
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  // Track event to Supabase
  const trackEvent = useCallback(async (event: AudioAnalyticsEvent) => {
    if (!enabled || !userId || !trackInfo.trackId) return

    try {
      const completionPercentage = trackInfo.durationMs 
        ? (event.currentPositionMs / trackInfo.durationMs) * 100 
        : 0

      const eventData = {
        user_id: userId,
        session_id: sessionIdRef.current,
        track_id: trackInfo.trackId,
        track_name: trackInfo.trackName,
        artist_name: trackInfo.artistName,
        album_name: trackInfo.albumName,
        track_duration_ms: trackInfo.durationMs,
        event_type: event.eventType,
        event_timestamp: new Date().toISOString(),
        current_position_ms: Math.round(event.currentPositionMs),
        previous_position_ms: event.previousPositionMs ? Math.round(event.previousPositionMs) : null,
        listen_duration_ms: event.listenDurationMs ? Math.round(event.listenDurationMs) : null,
        completion_percentage: Math.round(completionPercentage * 100) / 100,
        source: trackInfo.source || 'other',
        device_type: getDeviceType()
      }

      console.log('🎵 Audio Analytics Event:', {
        type: event.eventType,
        track: trackInfo.trackName,
        position: `${Math.round(event.currentPositionMs / 1000)}s`,
        completion: `${Math.round(completionPercentage)}%`
      })

      const { error } = await supabase
        .from('audio_events')
        .insert(eventData)

      if (error) {
        console.error('❌ Error tracking audio event:', error)
      }
    } catch (error) {
      console.error('❌ Error in trackEvent:', error)
    }
  }, [enabled, userId, trackInfo, supabase])

  // Handle play event
  const handlePlay = useCallback(() => {
    if (!audioElement) return
    
    const currentPosition = audioElement.currentTime * 1000
    lastPositionRef.current = currentPosition
    playStartTimeRef.current = Date.now()

    trackEvent({
      eventType: 'play',
      currentPositionMs: currentPosition
    })

    // Start progress tracking interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    progressIntervalRef.current = setInterval(() => {
      if (audioElement && !audioElement.paused) {
        const position = audioElement.currentTime * 1000
        trackEvent({
          eventType: 'progress',
          currentPositionMs: position,
          listenDurationMs: progressIntervalMs
        })
      }
    }, progressIntervalMs)
  }, [audioElement, trackEvent, progressIntervalMs])

  // Handle pause event
  const handlePause = useCallback(() => {
    if (!audioElement) return

    const currentPosition = audioElement.currentTime * 1000
    const listenDuration = playStartTimeRef.current 
      ? Date.now() - playStartTimeRef.current 
      : 0

    trackEvent({
      eventType: 'pause',
      currentPositionMs: currentPosition,
      listenDurationMs: listenDuration
    })

    // Clear progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }

    playStartTimeRef.current = null
  }, [audioElement, trackEvent])

  // Handle ended (complete) event
  const handleEnded = useCallback(() => {
    if (!audioElement) return

    const currentPosition = audioElement.currentTime * 1000
    const listenDuration = playStartTimeRef.current 
      ? Date.now() - playStartTimeRef.current 
      : 0

    trackEvent({
      eventType: 'complete',
      currentPositionMs: currentPosition,
      listenDurationMs: listenDuration
    })

    // Clear progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }

    playStartTimeRef.current = null
  }, [audioElement, trackEvent])

  // Handle seek event
  const handleSeeking = useCallback(() => {
    if (!audioElement) return

    const currentPosition = audioElement.currentTime * 1000
    const previousPosition = lastPositionRef.current

    // Only track if it's a significant seek (more than 2 seconds)
    if (Math.abs(currentPosition - previousPosition) > 2000) {
      trackEvent({
        eventType: 'seek',
        currentPositionMs: currentPosition,
        previousPositionMs: previousPosition
      })
    }

    lastPositionRef.current = currentPosition
  }, [audioElement, trackEvent])

  // Handle error event
  const handleError = useCallback(() => {
    if (!audioElement) return

    const currentPosition = audioElement.currentTime * 1000

    trackEvent({
      eventType: 'error',
      currentPositionMs: currentPosition
    })

    // Clear progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [audioElement, trackEvent])

  // Attach event listeners
  useEffect(() => {
    if (!audioElement || !enabled) return

    audioElement.addEventListener('play', handlePlay)
    audioElement.addEventListener('pause', handlePause)
    audioElement.addEventListener('ended', handleEnded)
    audioElement.addEventListener('seeked', handleSeeking)
    audioElement.addEventListener('error', handleError)

    return () => {
      audioElement.removeEventListener('play', handlePlay)
      audioElement.removeEventListener('pause', handlePause)
      audioElement.removeEventListener('ended', handleEnded)
      audioElement.removeEventListener('seeked', handleSeeking)
      audioElement.removeEventListener('error', handleError)

      // Clear progress interval on unmount
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [audioElement, enabled, handlePlay, handlePause, handleEnded, handleSeeking, handleError])

  // Generate new session ID when track changes
  useEffect(() => {
    sessionIdRef.current = uuidv4()
    lastPositionRef.current = 0
    playStartTimeRef.current = null

    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [trackInfo.trackId])

  return {
    sessionId: sessionIdRef.current,
    trackEvent // Expose for manual tracking if needed
  }
}
