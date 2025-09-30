'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/ui/design-system/page-header'
import { useShareableTracks } from '@/hooks/use-shareable-tracks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Music, Share2, Copy, ExternalLink, BarChart3, 
  Plus, Eye, EyeOff, Trash2, Calendar, Headphones,
  TrendingUp, Users, Clock, Upload, Loader2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ShareTracksPage() {
  const { tracks, isLoading, createTrack, deleteTrack, toggleActive } = useShareableTracks()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const supabase = createClient()
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [formData, setFormData] = useState({
    track_name: '',
    artist_name: '',
    album_name: '',
    audio_file_url: '',
    cover_image_url: '',
    description: '',
    genre: '',
    duration_ms: 0
  })

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return publicUrl
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.addEventListener('loadedmetadata', () => {
        resolve(Math.floor(audio.duration * 1000))
      })
      audio.src = URL.createObjectURL(file)
    })
  }

  const handleCreateTrack = async () => {
    if (!audioFile) {
      alert('Please select an audio file')
      return
    }

    setIsCreating(true)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Upload audio file
      setUploadProgress(30)
      const audioUrl = await uploadFile(audioFile, 'audio-tracks', 'tracks')
      
      // Get audio duration
      const duration = await getAudioDuration(audioFile)
      
      // Upload cover image if provided
      let coverUrl = formData.cover_image_url
      if (coverFile) {
        setUploadProgress(60)
        coverUrl = await uploadFile(coverFile, 'audio-tracks', 'covers')
      }

      setUploadProgress(90)

      // Create track
      await createTrack({
        ...formData,
        audio_file_url: audioUrl,
        cover_image_url: coverUrl,
        duration_ms: duration
      })

      setUploadProgress(100)
      setIsCreateDialogOpen(false)
      
      // Reset form
      setFormData({
        track_name: '',
        artist_name: '',
        album_name: '',
        audio_file_url: '',
        cover_image_url: '',
        description: '',
        genre: '',
        duration_ms: 0
      })
      setAudioFile(null)
      setCoverFile(null)
    } catch (error: any) {
      console.error('Error creating track:', error)
      alert(error.message || 'Error uploading track. Please try again.')
    } finally {
      setIsCreating(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const copyShareLink = (shareUrl: string) => {
    navigator.clipboard.writeText(shareUrl)
    alert('Link copied to clipboard!')
  }

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const totalPlays = tracks.reduce((sum, track) => sum + track.total_plays, 0)
  const totalListeners = tracks.reduce((sum, track) => sum + track.unique_listeners, 0)
  const avgCompletion = tracks.length > 0
    ? tracks.reduce((sum, track) => sum + track.avg_completion_rate, 0) / tracks.length
    : 0

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Share Tracks"
          description="Upload tracks, generate shareable links, and track analytics"
          avatar={{ fallback: 'ST' }}
          badge={{
            text: `${tracks.length} ${tracks.length === 1 ? 'Track' : 'Tracks'}`,
            variant: 'secondary'
          }}
          actions={[
            {
              label: 'Create Share Link',
              onClick: () => setIsCreateDialogOpen(true),
              variant: 'default',
              icon: Plus
            }
          ]}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Total Tracks</p>
                <Music className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{tracks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Shareable links created</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Total Plays</p>
                <Headphones className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{totalPlays.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all tracks</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Unique Listeners</p>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{totalListeners.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total unique listeners</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-bold">{Math.round(avgCompletion)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Average listen rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Tracks List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Shared Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading tracks...</p>
              </div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first shareable track link
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Share Link
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tracks.map((track) => (
                  <Card key={track.id} className="border-0 bg-gradient-to-r from-background to-muted/20">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Cover Image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {track.cover_image_url ? (
                            <Image
                              src={track.cover_image_url}
                              alt={track.track_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-lg truncate">{track.track_name}</h4>
                              <p className="text-sm text-muted-foreground truncate">{track.artist_name}</p>
                            </div>
                            <Badge variant={track.is_active ? 'default' : 'secondary'}>
                              {track.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>

                          {/* Stats */}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Headphones className="w-4 h-4" />
                              <span>{track.total_plays} plays</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{track.unique_listeners} listeners</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{Math.round(track.avg_completion_rate)}% completion</span>
                            </div>
                            {track.duration_ms && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDuration(track.duration_ms)}</span>
                              </div>
                            )}
                          </div>

                          {/* Share Link */}
                          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                            <code className="flex-1 text-xs truncate">
                              {track.share_url || `${window.location.origin}/listen/${track.share_code}`}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyShareLink(track.share_url || `${window.location.origin}/listen/${track.share_code}`)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                            >
                              <Link href={`/listen/${track.share_code}`} target="_blank">
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <Link href={`/share-tracks/${track.id}/analytics`}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                View Analytics
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleActive(track.id, !track.is_active)}
                            >
                              {track.is_active ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this track?')) {
                                  deleteTrack(track.id)
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Track Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Shareable Track Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="track_name">Track Name *</Label>
                  <Input
                    id="track_name"
                    value={formData.track_name}
                    onChange={(e) => setFormData({ ...formData, track_name: e.target.value })}
                    placeholder="Impaciente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist_name">Artist Name *</Label>
                  <Input
                    id="artist_name"
                    value={formData.artist_name}
                    onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                    placeholder="Borngud"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="album_name">Album Name</Label>
                  <Input
                    id="album_name"
                    value={formData.album_name}
                    onChange={(e) => setFormData({ ...formData, album_name: e.target.value })}
                    placeholder="Singles Collection"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="Hip Hop"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio_file">Audio File *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="audio_file"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  {audioFile && (
                    <Badge variant="secondary" className="flex-shrink-0">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: MP3, WAV, M4A, OGG (Max 50MB)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_image">Cover Image (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cover_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  {coverFile && (
                    <Badge variant="secondary" className="flex-shrink-0">
                      {(coverFile.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell listeners about this track..."
                  rows={3}
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTrack}
                  disabled={!formData.track_name || !formData.artist_name || !audioFile || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isUploading ? 'Uploading...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Create Share Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
