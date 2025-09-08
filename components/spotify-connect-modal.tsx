'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SproutIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function SpotifyConnectModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [artistUrl, setArtistUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const urlParts = artistUrl.split('/');
      const artistIndex = urlParts.indexOf('artist');
      if (artistIndex === -1 || artistIndex + 1 >= urlParts.length) {
        throw new Error('Invalid Spotify Artist URL. Please use the format: https://open.spotify.com/artist/...');
      }
      const artistId = urlParts[artistIndex + 1].split('?')[0];

      if (!artistId) {
        throw new Error('Could not extract Artist ID from the URL.');
      }

      console.log('Frontend: Extracted artistId:', artistId); // Debug log

      const { data, error: invokeError } = await supabase.functions.invoke('spotify-auth', {
        body: { artistId },
      });

      if (invokeError) {
        throw new Error(`Function error: ${invokeError.message}`);
      }

      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error('Could not retrieve authorization URL.');
      }

    } catch (err: any) {
      setError(err.message)
      setIsLoading(false) // Stop loading only if there is an error
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { 
      setIsOpen(open); 
      setError(null); 
      setArtistUrl('');
      setIsLoading(false);
    }}>
      <DialogTrigger asChild>
        <Button>Connect to Spotify</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SproutIcon className="h-5 w-5 text-green-500"/>
            Connect your Spotify Account
          </DialogTitle>
          <DialogDescription>
            Paste your Spotify Artist profile URL below to begin syncing your analytics data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="artist-url" className="text-right">
              Artist URL
            </Label>
            <Input
              id="artist-url"
              value={artistUrl}
              onChange={(e) => setArtistUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://open.spotify.com/artist/..."
              disabled={isLoading}
            />
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
