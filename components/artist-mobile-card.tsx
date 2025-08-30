// components/artist-mobile-card.tsx
"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, Edit, ImageIcon, Users, Music } from "lucide-react"

type Artist = {
  id: string | number
  name: string
  genre?: string
  country?: string
  profile_image?: string | null
  social_accounts?: any[]
  distribution_accounts?: any[]
  assetCount?: number
  created_at?: string
}

export function ArtistMobileCard({ artist }: { artist: Artist }) {
  const initials =
    (artist.name || "")
      .split(" ")
      .map((n) => n[0])
      .join("") || "AR"

  const socialAccountsCount = artist.social_accounts?.length ?? 0
  const distributionAccountsCount = artist.distribution_accounts?.length ?? 0

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

        <div className="grid grid-cols-3 gap-2 text-sm text-center">
          <div className="flex flex-col items-center">
            <dt className="text-sm font-medium text-muted-foreground">Social</dt>
            <dd className="flex items-center gap-1 font-semibold mt-1">
              <Users className="h-4 w-4 text-primary" />
              {socialAccountsCount}
            </dd>
          </div>
          <div className="flex flex-col items-center">
            <dt className="text-sm font-medium text-muted-foreground">Distrib.</dt>
            <dd className="flex items-center gap-1 font-semibold mt-1">
              <Music className="h-4 w-4 text-primary" />
              {distributionAccountsCount}
            </dd>
          </div>
          <div className="flex flex-col items-center">
            <dt className="text-sm font-medium text-muted-foreground">Assets</dt>
            <dd className="flex items-center gap-1 font-semibold mt-1">
              <ImageIcon className="h-4 w-4 text-primary" />
              {artist.assetCount ?? 0}
            </dd>
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
