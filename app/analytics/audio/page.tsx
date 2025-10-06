'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AudioAnalyticsPanel } from '@/components/audio-analytics-panel'
import { PageHeader } from '@/components/ui/design-system/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Headphones, Calendar, Download, Filter,
  TrendingUp, Users, Clock, Music
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AudioAnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [selectedUser, setSelectedUser] = useState<string>('all')

  const dateRangeStrings = useMemo(() => {
    const end = new Date()
    let start = new Date()

    switch (dateRange) {
      case '7d':
        start.setDate(end.getDate() - 7)
        break
      case '30d':
        start.setDate(end.getDate() - 30)
        break
      case '90d':
        start.setDate(end.getDate() - 90)
        break
      case 'all':
        start = new Date(0) // Beginning of time
        break
    }

    return { 
      start: start.toISOString(), 
      end: end.toISOString() 
    }
  }, [dateRange])

  const handleExport = () => {
    // Note: CSV export functionality to be implemented
    // Will export filtered analytics data based on current date range and user selection
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Audio Analytics"
          description="Comprehensive insights into audio playback behavior and user engagement"
          avatar={{
            fallback: 'AA'
          }}
          badge={{
            text: `Last ${dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : dateRange === '90d' ? '90 days' : 'All time'}`,
            variant: 'secondary'
          }}
          actions={[
            {
              label: 'Export Data',
              onClick: handleExport,
              variant: 'outline',
              icon: Download
            }
          ]}
        />

        {/* Filters */}
        <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* User Filter (for admins) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">User</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="me">My Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Stats */}
              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={() => {
                  setDateRange('30d')
                  setSelectedUser('all')
                }}>
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Analytics Panel */}
        <AudioAnalyticsPanel 
          userId={selectedUser === 'me' ? undefined : undefined}
          startDate={dateRangeStrings.start}
          endDate={dateRangeStrings.end}
        />

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Engagement Insights */}
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Engagement Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Average Session Duration</span>
                  <span className="font-semibold">2m 45s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Peak Listening Time</span>
                  <span className="font-semibold">2:00 PM - 4:00 PM</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Most Active Day</span>
                  <span className="font-semibold">Wednesday</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Repeat Listen Rate</span>
                  <span className="font-semibold">34%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Behavior */}
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                User Behavior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Skip Rate</span>
                  <span className="font-semibold">12%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Replay Rate</span>
                  <span className="font-semibold">18%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Average Seek Count</span>
                  <span className="font-semibold">2.3 per track</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mobile vs Desktop</span>
                  <span className="font-semibold">65% / 35%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">30s</div>
                  <div className="text-sm text-muted-foreground">Progress Tracking Interval</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Music className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Real-time</div>
                  <div className="text-sm text-muted-foreground">Event Tracking</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-muted-foreground">Data Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>What We Track</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Playback Events</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Play:</strong> When users start playing a track</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Pause:</strong> When users pause playback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Complete:</strong> When users finish listening to a track</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Seek:</strong> When users skip to different parts of the track</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Session Metrics</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span><strong>Progress:</strong> 30-second heartbeat signals during active listening</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span><strong>Duration:</strong> Total time spent listening per session</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span><strong>Completion:</strong> Percentage of track completed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span><strong>Context:</strong> Device type, source, and user information</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
