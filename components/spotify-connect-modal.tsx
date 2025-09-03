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
import { SproutIcon } from 'lucide-react'

export function SpotifyConnectModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [artistUrl, setArtistUrl] = useState('')

  const handleConnect = () => {
    // In a real application, this would initiate the OAuth flow with Spotify.
    // For now, we'll just log a message to the console.
    console.log(`Connecting to Spotify with artist URL: ${artistUrl}`)
    // You would typically redirect to your backend endpoint that starts the Spotify auth flow.
    // window.location.href = `/api/spotify-auth?artistUrl=${artistUrl}`;
    alert(`This is where the Spotify connection would be initiated with URL: ${artistUrl}`)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            To see your Spotify analytics, you need to connect your account. This will allow us to fetch your data and display it here.
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleConnect}>Connect</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}