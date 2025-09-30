'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/ui/design-system/page-header'
import { BackButton } from '@/components/ui/design-system/back-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Music, Headphones, Users, TrendingUp, Clock,
  Globe, Smartphone, Monitor, Tablet, ExternalLink, Calendar,
  BarChart3, Activity, MapPin
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

interface TrackAnalytics {
  total_plays: number
  unique_listeners: number
  total_listen_time_ms: number
  avg_listen_time_ms: number
  completion_rate: number
  total_completes: number
  total_seeks: number
  total_pauses: number
  avg_seeks_per_play: number
  avg_pauses_per_play: number
  first_play_at: string
  last_play_at: string
  peak_hour: number
  peak_day_of_week: number
  top_browsers: Array<{ browser: string; plays: number }>
  top_os: Array<{ os: string; plays: number }>
  top_countries: Array<{ country: string; plays: number }>
  top_devices: Array<{ device_type: string; plays: number }>
  top_referrers: Array<{ referrer_url: string; plays: number }>
  plays_by_day: Array<{ date: string; plays: number }>
  plays_by_hour: Array<{ hour: number; plays: number }>
}

export default function TrackAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const trackId = params.id as string
  const supabase = createClient()

  const [track, setTrack] = useState<any>(null)
  const [analytics, setAnalytics] = useState<TrackAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrackAndAnalytics()
  }, [trackId])

  const fetchTrackAndAnalytics = async () => {
    setIsLoading(true)
    try {
      // Fetch track info
      const { data: trackData, error: trackError } = await supabase
        .from('shareable_tracks')
        .select('*')
        .eq('id', trackId)
        .single()

      if (trackError) throw trackError
      setTrack(trackData)

      // Fetch analytics - try enhanced version first, fallback to basic
      let analyticsData, analyticsError
      
      console.log('🔍 Fetching analytics for track:', trackId)
      
      // Try enhanced analytics first
      const enhanced = await supabase
        .rpc('get_shareable_track_analytics_enhanced', {
          p_track_id: trackId,
          p_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          p_end_date: new Date().toISOString()
        })
      
      console.log('📊 Enhanced analytics response:', { data: enhanced.data, error: enhanced.error })
      
      if (enhanced.error) {
        console.log('⚠️ Enhanced failed, trying basic...')
        // Fallback to basic analytics
        const basic = await supabase
          .rpc('get_shareable_track_analytics', {
            p_track_id: trackId,
            p_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            p_end_date: new Date().toISOString()
          })
        console.log('📊 Basic analytics response:', { data: basic.data, error: basic.error })
        analyticsData = basic.data
        analyticsError = basic.error
      } else {
        analyticsData = enhanced.data
        analyticsError = enhanced.error
      }

      if (analyticsError) {
        console.error('❌ Analytics error:', analyticsError)
        throw analyticsError
      }
      
      console.log('✅ Final analytics data:', analyticsData)
      
      if (analyticsData && analyticsData.length > 0) {
        console.log('✅ Setting analytics:', analyticsData[0])
        setAnalytics(analyticsData[0])
      } else {
        console.log('⚠️ No analytics data returned')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      case 'desktop': return <Monitor className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Music className="w-12 h-12 text-muted-foreground animate-pulse" />
        </div>
      </DashboardLayout>
    )
  }

  if (!track) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Music className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Track Not Found</h2>
          <BackButton label="Back to Tracks" href="/share-tracks" variant="default" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <BackButton label="Back to Tracks" href="/share-tracks" />

        {/* Page Header */}
        <PageHeader
          title={track.track_name}
          description={`Analytics for ${track.artist_name}`}
          avatar={{
            src: track.cover_image_url,
            fallback: track.track_name.charAt(0)
          }}
          badge={{
            text: track.is_active ? 'Active' : 'Inactive',
            variant: track.is_active ? 'default' : 'secondary'
          }}
          actions={[
            {
              label: 'View Public Page',
              href: `/listen/${track.share_code}`,
              variant: 'outline',
              icon: ExternalLink
            }
          ]}
        />

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Total Plays</p>
                <Headphones className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{analytics?.total_plays || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics?.total_completes || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Unique Listeners</p>
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{analytics?.unique_listeners || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Different people</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">
                {Math.round(analytics?.completion_rate || 0)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average listen rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Total Listen Time</p>
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-bold">
                {formatDuration(analytics?.total_listen_time_ms || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {formatDuration(analytics?.avg_listen_time_ms || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Time Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Detailed Time Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Seconds Played</p>
                <p className="text-3xl font-bold">
                  {Math.floor((analytics?.total_listen_time_ms || 0) / 1000).toLocaleString()}s
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.floor((analytics?.total_listen_time_ms || 0) / 60000)} minutes total
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg Seconds per Play</p>
                <p className="text-3xl font-bold">
                  {Math.floor((analytics?.avg_listen_time_ms || 0) / 1000)}s
                </p>
                <p className="text-xs text-muted-foreground">
                  {track.duration_ms 
                    ? `${Math.round(((analytics?.avg_listen_time_ms || 0) / track.duration_ms) * 100)}% of track`
                    : 'N/A'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold">{Math.round(analytics?.completion_rate || 0)}%</p>
                <p className="text-xs text-muted-foreground">
                  {analytics?.total_completes || 0} of {analytics?.total_plays || 0} plays
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Behavior Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              User Behavior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Seeks</p>
                <p className="text-3xl font-bold">{analytics?.total_seeks || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Avg: {(analytics?.avg_seeks_per_play || 0).toFixed(1)} per play
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Pauses</p>
                <p className="text-3xl font-bold">{analytics?.total_pauses || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Avg: {(analytics?.avg_pauses_per_play || 0).toFixed(1)} per play
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">First Play</p>
                <p className="text-lg font-bold">
                  {analytics?.first_play_at 
                    ? new Date(analytics.first_play_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {analytics?.first_play_at 
                    ? new Date(analytics.first_play_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Last Play</p>
                <p className="text-lg font-bold">
                  {analytics?.last_play_at 
                    ? new Date(analytics.last_play_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {analytics?.last_play_at 
                    ? new Date(analytics.last_play_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Listening Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Peak Hour</p>
                <p className="text-3xl font-bold">
                  {analytics?.peak_hour !== undefined 
                    ? `${analytics.peak_hour}:00`
                    : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Most plays at this hour
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Peak Day</p>
                <p className="text-3xl font-bold">
                  {analytics?.peak_day_of_week !== undefined
                    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][analytics.peak_day_of_week]
                    : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Most active day of week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Countries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.top_countries && analytics.top_countries.length > 0 ? (
                <div className="space-y-3">
                  {analytics.top_countries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{country.country || 'Unknown'}</span>
                      </div>
                      <Badge variant="secondary">{country.plays} plays</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No country data yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Devices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Top Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.top_devices && analytics.top_devices.length > 0 ? (
                <div className="space-y-3">
                  {analytics.top_devices.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.device_type)}
                        <span className="font-medium capitalize">
                          {device.device_type || 'Unknown'}
                        </span>
                      </div>
                      <Badge variant="secondary">{device.plays} plays</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No device data yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Browsers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Top Browsers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.top_browsers && analytics.top_browsers.length > 0 ? (
                <div className="space-y-3">
                  {analytics.top_browsers.map((browser, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{browser.browser || 'Unknown'}</span>
                      <Badge variant="secondary">{browser.plays} plays</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No browser data yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top OS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Operating Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.top_os && analytics.top_os.length > 0 ? (
                <div className="space-y-3">
                  {analytics.top_os.map((os, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{os.os || 'Unknown'}</span>
                      <Badge variant="secondary">{os.plays} plays</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No OS data yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Referrers */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Top Referrers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.top_referrers && analytics.top_referrers.length > 0 ? (
                <div className="space-y-3">
                  {analytics.top_referrers.map((referrer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <code className="text-xs truncate block">
                          {referrer.referrer_url || 'Direct'}
                        </code>
                      </div>
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">
                        {referrer.plays} plays
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No referrer data yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Plays by Day */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Plays by Day (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.plays_by_day && analytics.plays_by_day.length > 0 ? (
                <div className="space-y-2">
                  {analytics.plays_by_day.slice(0, 10).map((day, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-24">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <div className="flex-1">
                        <div className="h-8 bg-muted rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{
                              width: `${(day.plays / Math.max(...analytics.plays_by_day.map(d => d.plays))) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {day.plays}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No play history yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Track Info */}
        <Card>
          <CardHeader>
            <CardTitle>Track Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-3">Details</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Track Name:</dt>
                    <dd className="font-medium">{track.track_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Artist:</dt>
                    <dd className="font-medium">{track.artist_name}</dd>
                  </div>
                  {track.album_name && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Album:</dt>
                      <dd className="font-medium">{track.album_name}</dd>
                    </div>
                  )}
                  {track.genre && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Genre:</dt>
                      <dd className="font-medium">{track.genre}</dd>
                    </div>
                  )}
                  {track.duration_ms && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Duration:</dt>
                      <dd className="font-medium">{formatDuration(track.duration_ms)}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Share Link</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-xs break-all">
                      {track.share_url || `${window.location.origin}/listen/${track.share_code}`}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          track.share_url || `${window.location.origin}/listen/${track.share_code}`
                        )
                        alert('Link copied!')
                      }}
                    >
                      Copy Link
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/listen/${track.share_code}`} target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
