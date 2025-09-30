'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import Image from 'next/image'
import { useAudioAnalytics } from '@/hooks/use-audio-analytics'

interface Track {
  id: string
  name: string
  artist: string
  album?: string
  albumArt?: string
  previewUrl: string
  durationMs?: number
}

interface AudioPlayerWithAnalyticsProps {
  track: Track
  source?: 'spotify' | 'muso_ai' | 'creative_vault' | 'other'
  onNext?: () => void
  onPrevious?: () => void
  autoPlay?: boolean
}

export function AudioPlayerWithAnalytics({
  track,
  source = 'other',
  onNext,
  onPrevious,
  autoPlay = false
}: AudioPlayerWithAnalyticsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  // Initialize audio analytics
  const { sessionId } = useAudioAnalytics({
    trackInfo: {
      trackId: track.id,
      trackName: track.name,
      artistName: track.artist,
      albumName: track.album,
      durationMs: track.durationMs || duration * 1000,
      source
    },
    audioElement: audioRef.current,
    enabled: true,
    progressIntervalMs: 30000 // Track progress every 30 seconds
  })

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(track.previewUrl)
      audioRef.current.volume = volume
    }

    const audio = audioRef.current

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (onNext) {
        onNext()
      }
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true)).catch(console.error)
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
    }
  }, [track.previewUrl])

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

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Album Art */}
          {track.albumArt && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={track.albumArt}
                alt={track.album || 'Album art'}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Track Info & Controls */}
          <div className="flex-1 min-w-0">
            {/* Track Info */}
            <div className="mb-3">
              <h4 className="font-semibold truncate">{track.name}</h4>
              <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => handleSeek([parseFloat(e.target.value)])}
                  className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
                <span className="text-xs text-muted-foreground w-10">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {onPrevious && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onPrevious}
                      className="h-8 w-8 p-0"
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={togglePlay}
                    className="h-10 w-10 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>

                  {onNext && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onNext}
                      className="h-8 w-8 p-0"
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="h-8 w-8 p-0"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange([parseFloat(e.target.value)])}
                    className="w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
                </div>
              </div>
            </div>

            {/* Analytics Session ID (for debugging) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-xs text-muted-foreground">
                Session: {sessionId.slice(0, 8)}...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
