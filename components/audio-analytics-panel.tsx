'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, Pause, SkipForward, Clock, TrendingUp, 
  Headphones, Music, Users, Activity, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface AnalyticsSummary {
  total_plays: number
  total_listens: number
  total_listen_time_ms: number
  avg_listen_time_ms: number
  completion_rate: number
  unique_tracks: number
  total_seeks: number
  total_pauses: number
}

interface TopTrack {
  track_id: string
  track_name: string
  artist_name: string
  play_count: number
  total_listen_time_ms: number
  avg_completion_percentage: number
  unique_listeners: number
}

interface RecentEvent {
  id: string
  track_name: string
  artist_name: string
  event_type: string
  event_timestamp: string
  current_position_ms: number
  completion_percentage: number
  source: string
}

interface AudioAnalyticsPanelProps {
  userId?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export function AudioAnalyticsPanel({ userId, dateRange }: AudioAnalyticsPanelProps) {
  const supabase = createClient()
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [topTracks, setTopTracks] = useState<TopTrack[]>([])
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const targetUserId = userId || user?.id

      if (!targetUserId) {
        console.log('No user ID available')
        setIsLoading(false)
        return
      }

      // Fetch summary
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_audio_analytics_summary', {
          p_user_id: targetUserId,
          p_start_date: dateRange?.start?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          p_end_date: dateRange?.end?.toISOString() || new Date().toISOString()
        })

      if (summaryError) {
        console.error('Error fetching summary:', summaryError)
      } else if (summaryData && summaryData.length > 0) {
        setSummary(summaryData[0])
      }

      // Fetch top tracks
      const { data: topTracksData, error: topTracksError } = await supabase
        .rpc('get_top_audio_tracks', {
          p_user_id: targetUserId,
          p_limit: 10,
          p_start_date: dateRange?.start?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        })

      if (topTracksError) {
        console.error('Error fetching top tracks:', topTracksError)
      } else {
        setTopTracks(topTracksData || [])
      }

      // Fetch recent events
      const { data: eventsData, error: eventsError } = await supabase
        .from('audio_events')
        .select('*')
        .eq('user_id', targetUserId)
        .order('event_timestamp', { ascending: false })
        .limit(20)

      if (eventsError) {
        console.error('Error fetching events:', eventsError)
      } else {
        setRecentEvents(eventsData || [])
      }

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [userId, dateRange])

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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num))
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'play': return <Play className="w-4 h-4 text-green-500" />
      case 'pause': return <Pause className="w-4 h-4 text-yellow-500" />
      case 'complete': return <Activity className="w-4 h-4 text-blue-500" />
      case 'seek': return <SkipForward className="w-4 h-4 text-purple-500" />
      case 'progress': return <Clock className="w-4 h-4 text-gray-500" />
      default: return <Music className="w-4 h-4" />
    }
  }

  const getEventBadgeVariant = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (eventType) {
      case 'play': return 'default'
      case 'pause': return 'secondary'
      case 'complete': return 'default'
      case 'seek': return 'outline'
      default: return 'secondary'
    }
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />
    if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2" />
                <div className="h-3 bg-muted rounded w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audio Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Detailed insights into audio playback behavior
          </p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Plays
              </CardTitle>
              <Play className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary?.total_plays || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(summary?.total_listens || 0)} unique sessions
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Listen Time
              </CardTitle>
              <Clock className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(summary?.total_listen_time_ms || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatDuration(summary?.avg_listen_time_ms || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(summary?.completion_rate || 0)}%
            </div>
            <Progress 
              value={summary?.completion_rate || 0} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unique Tracks
              </CardTitle>
              <Music className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary?.unique_tracks || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(summary?.total_seeks || 0)} seeks, {formatNumber(summary?.total_pauses || 0)} pauses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="top-tracks">Top Tracks</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listening Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Play Events</span>
                    <Badge variant="default">{formatNumber(summary?.total_plays || 0)}</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Pause Events</span>
                    <Badge variant="secondary">{formatNumber(summary?.total_pauses || 0)}</Badge>
                  </div>
                  <Progress 
                    value={summary?.total_plays ? (summary.total_pauses / summary.total_plays) * 100 : 0} 
                    className="h-2" 
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Seek Events</span>
                    <Badge variant="outline">{formatNumber(summary?.total_seeks || 0)}</Badge>
                  </div>
                  <Progress 
                    value={summary?.total_plays ? (summary.total_seeks / summary.total_plays) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Key Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {summary?.total_listens || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Sessions</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {summary?.unique_tracks || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Tracks</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(summary?.completion_rate || 0)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {formatDuration(summary?.avg_listen_time_ms || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Avg Time</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Tracks Tab */}
        <TabsContent value="top-tracks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Played Tracks</CardTitle>
            </CardHeader>
            <CardContent>
              {topTracks.length > 0 ? (
                <div className="space-y-3">
                  {topTracks.map((track, index) => (
                    <div 
                      key={track.track_id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{track.track_name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {track.artist_name}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{formatNumber(track.play_count)}</div>
                          <div className="text-xs text-muted-foreground">plays</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{formatDuration(track.total_listen_time_ms)}</div>
                          <div className="text-xs text-muted-foreground">time</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{Math.round(track.avg_completion_percentage)}%</div>
                          <div className="text-xs text-muted-foreground">completed</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No tracks played yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              {recentEvents.length > 0 ? (
                <div className="space-y-2">
                  {recentEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {getEventIcon(event.event_type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{event.track_name}</span>
                          <Badge variant={getEventBadgeVariant(event.event_type)} className="text-xs">
                            {event.event_type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {event.artist_name} • {event.source}
                        </div>
                      </div>

                      <div className="text-right text-sm">
                        <div className="font-medium">
                          {formatDuration(event.current_position_ms)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(event.completion_percentage)}%
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {new Date(event.event_timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
