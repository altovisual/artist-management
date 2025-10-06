'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { usePublicTrack } from '@/hooks/use-shareable-tracks'
import { useAudioAnalytics } from '@/hooks/use-audio-analytics'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, Pause, Volume2, VolumeX, Share2, Download,
  Music, Clock, Calendar, Headphones, ExternalLink
} from 'lucide-react'
import Image from 'next/image'
import { v4 as uuidv4 } from 'uuid'

export default function ListenPage() {
  const params = useParams()
  const shareCode = params.code as string
  const { track, isLoading, error } = usePublicTrack(shareCode)
  const supabase = createClient()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  // Use localStorage to persist session PER TRACK across page reloads
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      // Create a unique key per track to track each song separately
      const sessionKey = `shareable_track_session_${shareCode}`
      const stored = localStorage.getItem(sessionKey)
      if (stored) {
        console.log('📌 Using existing session for track:', shareCode, stored)
        return stored
      }
      const newId = uuidv4()
      localStorage.setItem(sessionKey, newId)
      console.log('🆕 Created new session for track:', shareCode, newId)
      return newId
    }
    return uuidv4()
  })
  // Load persisted state from localStorage
  const [playRecorded, setPlayRecorded] = useState(() => {
    if (typeof window !== 'undefined') {
      const key = `play_recorded_${shareCode}_${sessionId}`
      return localStorage.getItem(key) === 'true'
    }
    return false
  })
  const [playStartTime, setPlayStartTime] = useState<number | null>(null)
  const [seekCount, setSeekCount] = useState(() => {
    if (typeof window !== 'undefined') {
      const key = `seek_count_${shareCode}_${sessionId}`
      return parseInt(localStorage.getItem(key) || '0')
    }
    return 0
  })
  const [pauseCount, setPauseCount] = useState(() => {
    if (typeof window !== 'undefined') {
      const key = `pause_count_${shareCode}_${sessionId}`
      return parseInt(localStorage.getItem(key) || '0')
    }
    return 0
  })
  const [maxPositionReached, setMaxPositionReached] = useState(() => {
    if (typeof window !== 'undefined') {
      const key = `max_position_${shareCode}_${sessionId}`
      return parseFloat(localStorage.getItem(key) || '0')
    }
    return 0
  })
  
  // Use refs to always have current values in the interval (initialize from state)
  const seekCountRef = useRef(seekCount)
  const pauseCountRef = useRef(pauseCount)
  const maxPositionRef = useRef(maxPositionReached)
  const playStartTimeRef = useRef<number | null>(null)
  
  // Sync refs with state
  useEffect(() => {
    seekCountRef.current = seekCount
    pauseCountRef.current = pauseCount
    maxPositionRef.current = maxPositionReached
  }, [seekCount, pauseCount, maxPositionReached])

  // Audio Analytics
  useAudioAnalytics({
    trackInfo: track ? {
      trackId: track.id,
      trackName: track.track_name,
      artistName: track.artist_name,
      albumName: track.album_name,
      durationMs: track.duration_ms,
      source: 'other'
    } : {
      trackId: '',
      trackName: '',
      source: 'other'
    },
    audioElement: audioRef.current,
    enabled: !!track && !!audioRef.current
  })

  // Initialize audio element
  useEffect(() => {
    if (!track?.audio_file_url) return

    if (!audioRef.current) {
      audioRef.current = new Audio(track.audio_file_url)
      audioRef.current.volume = volume
    }

    const audio = audioRef.current

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      const newTime = audio.currentTime
      setCurrentTime(newTime)
      
      // Track max position reached
      if (newTime > maxPositionRef.current) {
        maxPositionRef.current = newTime
        setMaxPositionReached(newTime)
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`max_position_${shareCode}_${sessionId}`, newTime.toString())
        }
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      recordPlayEnd(true)
    }

    const handlePlay = () => {
      if (!playRecorded) {
        recordPlayStart()
        setPlayRecorded(true)
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`play_recorded_${shareCode}_${sessionId}`, 'true')
        }
        const now = Date.now()
        playStartTimeRef.current = now
        setPlayStartTime(now)
      }
      // Don't reset playStartTime on subsequent plays (after pause)
    }

    const handlePause = () => {
      pauseCountRef.current += 1
      setPauseCount(pauseCountRef.current)
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`pause_count_${shareCode}_${sessionId}`, pauseCountRef.current.toString())
      }
      console.log('⏸️ PAUSE - Count now:', pauseCountRef.current)
      // Update metrics immediately
      updatePlayMetrics()
    }

    const handleSeeking = () => {
      seekCountRef.current += 1
      setSeekCount(seekCountRef.current)
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`seek_count_${shareCode}_${sessionId}`, seekCountRef.current.toString())
      }
      console.log('⏭️ SEEK - Count now:', seekCountRef.current)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('seeking', handleSeeking)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('seeking', handleSeeking)
      audio.pause()
    }
  }, [track?.audio_file_url])

  // Track accumulated listen time (load from localStorage)
  const getInitialAccumulatedTime = () => {
    if (typeof window !== 'undefined') {
      const key = `accumulated_time_${shareCode}_${sessionId}`
      return parseInt(localStorage.getItem(key) || '0')
    }
    return 0
  }
  const accumulatedTimeRef = useRef(getInitialAccumulatedTime())
  const lastPlayTimeRef = useRef<number | null>(null)

  // ROBUST: Update metrics every second while playing
  useEffect(() => {
    if (!isPlaying || !playRecorded) {
      // When paused, save final state
      if (lastPlayTimeRef.current) {
        const finalTime = Date.now() - lastPlayTimeRef.current
        accumulatedTimeRef.current += finalTime
        if (typeof window !== 'undefined') {
          localStorage.setItem(`accumulated_time_${shareCode}_${sessionId}`, accumulatedTimeRef.current.toString())
        }
        lastPlayTimeRef.current = null
        console.log('⏸️ Saved accumulated time:', accumulatedTimeRef.current, 'ms')
      }
      return
    }

    console.log('▶️ Starting ROBUST metrics tracking (every 1s)')
    lastPlayTimeRef.current = Date.now()

    // Update every 1 second for precision
    const interval = setInterval(() => {
      if (audioRef.current && track && lastPlayTimeRef.current) {
        // Calculate EXACT time since last update
        const now = Date.now()
        const timeSinceLastUpdate = now - lastPlayTimeRef.current
        accumulatedTimeRef.current += timeSinceLastUpdate
        lastPlayTimeRef.current = now
        
        // ALWAYS persist to localStorage immediately
        if (typeof window !== 'undefined') {
          localStorage.setItem(`accumulated_time_${shareCode}_${sessionId}`, accumulatedTimeRef.current.toString())
        }

        const maxPos = Math.floor(maxPositionRef.current * 1000)
        const completionPct = duration > 0 ? (maxPositionRef.current / duration) * 100 : 0

        console.log('📊 [ROBUST] Metrics:', {
          sessionId: sessionId.substring(0, 8),
          accumulatedMs: accumulatedTimeRef.current,
          accumulatedSec: Math.floor(accumulatedTimeRef.current / 1000),
          maxPosSec: Math.floor(maxPositionRef.current),
          seeks: seekCountRef.current,
          pauses: pauseCountRef.current,
          completion: Math.floor(completionPct)
        })

        // Update database every 5 seconds to reduce load
        const secondsElapsed = Math.floor(accumulatedTimeRef.current / 1000)
        if (secondsElapsed % 5 === 0 || secondsElapsed < 5) {
          supabase
            .from('shareable_track_plays')
            .update({
              listen_duration_ms: accumulatedTimeRef.current,
              max_position_reached_ms: maxPos,
              completion_percentage: completionPct,
              seek_count: seekCountRef.current,
              pause_count: pauseCountRef.current,
              play_count: 1,
              updated_at: new Date().toISOString()
            })
            .eq('session_id', sessionId)
            .select()
            .then(({ data, error }) => {
              if (error) {
                console.error('❌ DB Update Error:', error.message)
              } else if (!data || data.length === 0) {
                console.error('⚠️ Session not found in DB:', sessionId.substring(0, 8))
              } else {
                console.log('✅ DB Updated:', {
                  durationSec: Math.floor(accumulatedTimeRef.current / 1000),
                  seeks: seekCountRef.current,
                  pauses: pauseCountRef.current
                })
              }
            })
        }
      }
    }, 1000) // Update EVERY SECOND for precision

    return () => {
      console.log('⏹️ Stopping metrics tracking')
      // Final update before stopping
      if (lastPlayTimeRef.current) {
        const finalTime = Date.now() - lastPlayTimeRef.current
        accumulatedTimeRef.current += finalTime
        if (typeof window !== 'undefined') {
          localStorage.setItem(`accumulated_time_${shareCode}_${sessionId}`, accumulatedTimeRef.current.toString())
        }
        // Final DB update
        if (track) {
          const maxPos = Math.floor(maxPositionRef.current * 1000)
          const completionPct = duration > 0 ? (maxPositionRef.current / duration) * 100 : 0
          supabase
            .from('shareable_track_plays')
            .update({
              listen_duration_ms: accumulatedTimeRef.current,
              max_position_reached_ms: maxPos,
              completion_percentage: completionPct,
              seek_count: seekCountRef.current,
              pause_count: pauseCountRef.current,
              updated_at: new Date().toISOString()
            })
            .eq('session_id', sessionId)
            .then(() => console.log('✅ Final DB update on cleanup'))
        }
        lastPlayTimeRef.current = null
      }
      clearInterval(interval)
    }
  }, [isPlaying, playRecorded, duration, track, shareCode, sessionId, supabase])

  // Record play start
  const recordPlayStart = async () => {
    if (!track) return

    try {
      const deviceInfo = getDeviceInfo()
      const locationInfo = await getLocationInfo()

      const playData = {
        shareable_track_id: track.id,
        share_code: shareCode,
        session_id: sessionId,
        device_type: deviceInfo.device_type,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        referrer_url: document.referrer || null,
        listener_country: locationInfo.country,
        listener_city: locationInfo.city,
        started_at: new Date().toISOString(),
        seek_count: 0,
        pause_count: 0,
        play_count: 1,
        listen_duration_ms: 0,
        max_position_reached_ms: 0,
        completion_percentage: 0,
        completed: false
      }

      // Use upsert to create or update the session
      console.log('💾 Upserting play data:', { session_id: sessionId, track_id: track.id })
      
      const { data, error } = await supabase
        .from('shareable_track_plays')
        .upsert(playData, {
          onConflict: 'session_id'
        })
        .select()
      
      if (error) {
        console.error('❌ Error upserting play:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
      } else {
        console.log('✅ Play session created/updated:', { sessionId, data })
      }
    } catch (error) {
      console.error('Error recording play start:', error)
    }
  }

  // ROBUST: Update play metrics immediately (called on pause/seek)
  const updatePlayMetrics = async () => {
    if (!track || !audioRef.current) return

    try {
      // CRITICAL: Update accumulated time if currently playing
      if (lastPlayTimeRef.current) {
        const additionalTime = Date.now() - lastPlayTimeRef.current
        accumulatedTimeRef.current += additionalTime
        lastPlayTimeRef.current = Date.now() // Reset for next interval
        
        // ALWAYS save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`accumulated_time_${shareCode}_${sessionId}`, accumulatedTimeRef.current.toString())
        }
      }

      const maxPosition = Math.floor(maxPositionRef.current * 1000)
      const completionPercentage = duration > 0 ? (maxPositionRef.current / duration) * 100 : 0

      console.log('💾 [IMMEDIATE UPDATE] Saving metrics:', {
        durationMs: accumulatedTimeRef.current,
        durationSec: Math.floor(accumulatedTimeRef.current / 1000),
        seeks: seekCountRef.current,
        pauses: pauseCountRef.current
      })

      const { error } = await supabase
        .from('shareable_track_plays')
        .update({
          listen_duration_ms: accumulatedTimeRef.current,
          max_position_reached_ms: maxPosition,
          completion_percentage: completionPercentage,
          seek_count: seekCountRef.current,
          pause_count: pauseCountRef.current,
          play_count: 1,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)

      if (error) {
        console.error('❌ Error updating metrics:', error)
      } else {
        console.log('✅ Metrics saved successfully')
      }
    } catch (error) {
      console.error('❌ Error updating play metrics:', error)
    }
  }

  // ROBUST: Record play end with final metrics
  const recordPlayEnd = async (completed: boolean = false) => {
    if (!track || !audioRef.current) return

    try {
      // CRITICAL: Update accumulated time one final time
      if (lastPlayTimeRef.current) {
        const finalTime = Date.now() - lastPlayTimeRef.current
        accumulatedTimeRef.current += finalTime
        lastPlayTimeRef.current = null
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`accumulated_time_${shareCode}_${sessionId}`, accumulatedTimeRef.current.toString())
        }
      }

      const maxPosition = Math.floor(maxPositionRef.current * 1000)
      const completionPercentage = duration > 0 ? (maxPositionRef.current / duration) * 100 : 0

      console.log('🏁 [FINAL] Recording play end:', {
        totalDurationMs: accumulatedTimeRef.current,
        totalDurationSec: Math.floor(accumulatedTimeRef.current / 1000),
        completed: completed || completionPercentage >= 90,
        completion: Math.floor(completionPercentage)
      })

      await supabase
        .from('shareable_track_plays')
        .update({
          ended_at: new Date().toISOString(),
          listen_duration_ms: accumulatedTimeRef.current,
          max_position_reached_ms: maxPosition,
          completion_percentage: completionPercentage,
          completed: completed || completionPercentage >= 90,
          seek_count: seekCountRef.current,
          pause_count: pauseCountRef.current,
          play_count: 1,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
      
      console.log('✅ Play end recorded successfully')
    } catch (error) {
      console.error('❌ Error recording play end:', error)
    }
  }

  const getDeviceInfo = () => {
    const ua = navigator.userAgent
    let device_type = 'desktop'
    let browser = 'unknown'
    let os = 'unknown'

    // Device type
    if (/mobile/i.test(ua)) device_type = 'mobile'
    else if (/tablet/i.test(ua)) device_type = 'tablet'

    // Browser
    if (ua.includes('Chrome')) browser = 'Chrome'
    else if (ua.includes('Safari')) browser = 'Safari'
    else if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Edge')) browser = 'Edge'

    // OS
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iOS')) os = 'iOS'

    return { device_type, browser, os }
  }

  const getLocationInfo = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      return {
        country: data.country_name || null,
        city: data.city || null
      }
    } catch {
      return { country: null, city: null }
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error)
    }
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return
    const newTime = value[0]
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return
    const newVolume = value[0]
    audioRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    if (isMuted) {
      audioRef.current.volume = volume || 0.5
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: track?.track_name,
          text: `Listen to ${track?.track_name} by ${track?.artist_name}`,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <Music className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-white text-lg">Loading track...</p>
        </div>
      </div>
    )
  }

  if (error || !track) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Track Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'This track is no longer available or the link has expired.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-16">
        {/* Main Player Card */}
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Album Art */}
              <div className="flex-shrink-0">
                <div className="relative w-full md:w-64 aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 shadow-2xl">
                  {track.cover_image_url ? (
                    <Image
                      src={track.cover_image_url}
                      alt={track.track_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-24 h-24 text-white/50" />
                    </div>
                  )}
                </div>
              </div>

              {/* Track Info & Controls */}
              <div className="flex-1 flex flex-col justify-between">
                {/* Track Info */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{track.track_name}</h1>
                    <p className="text-xl text-gray-300">{track.artist_name}</p>
                    {track.album_name && (
                      <p className="text-sm text-gray-400 mt-1">{track.album_name}</p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-3">
                    {track.genre && (
                      <Badge variant="secondary" className="bg-white/10">
                        {track.genre}
                      </Badge>
                    )}
                    {track.release_date && (
                      <Badge variant="outline" className="border-white/20">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(track.release_date).getFullYear()}
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-white/20">
                      <Headphones className="w-3 h-3 mr-1" />
                      {track.total_plays} plays
                    </Badge>
                  </div>

                  {track.description && (
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {track.description}
                    </p>
                  )}
                </div>

                {/* Player Controls */}
                <div className="space-y-4 mt-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => handleSeek([parseFloat(e.target.value)])}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        size="lg"
                        onClick={togglePlay}
                        className="h-14 w-14 rounded-full bg-white hover:bg-gray-200 text-black"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </Button>

                      {/* Volume Control */}
                      <div className="hidden md:flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={toggleMute}
                          className="text-white hover:text-white hover:bg-white/10"
                        >
                          {isMuted ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </Button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange([parseFloat(e.target.value)])}
                          className="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleShare}
                        className="text-white hover:text-white hover:bg-white/10"
                      >
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Powered by Artist Management Platform</p>
        </div>
      </div>
    </div>
  )
}
