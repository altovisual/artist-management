// components/artist-mobile-card.tsx
"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, Edit, ImageIcon } from "lucide-react"

type Artist = {
  id: string | number
  name: string
  genre?: string
  country?: string
  profile_image?: string | null
  socialAccountsCount?: number
  distributionAccountsCount?: number
  assetCount?: number
  created_at?: string
}

export function ArtistMobileCard({ artist }: { artist: Artist }) {
  const initials =
    (artist.name || "")
      .split(" ")
      .map((n) => n[0])
      .join("") || "AR"

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={artist.profile_image || "/placeholder.svg"} alt={artist.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{artist.name}</div>
            <div className="text-sm text-muted-foreground">
              {artist.genre || "—"} · {artist.country || "—"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Social</div>
            <div className="font-medium">{artist.socialAccountsCount ?? 0}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Distrib.</div>
            <div className="font-medium">{artist.distributionAccountsCount ?? 0}</div>
          </div>
          <div className="flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            <div className="font-medium">{artist.assetCount ?? 0}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/artists/${artist.id}`} className="flex-1">
            <Button variant="outline" className="w-full flex items-center gap-1">
              <Eye className="h-4 w-4" /> View
            </Button>
          </Link>
          <Link href={`/artists/${artist.id}/edit`} className="flex-1">
            <Button variant="outline" className="w-full flex items-center gap-1">
              <Edit className="h-4 w-4" /> Edit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
