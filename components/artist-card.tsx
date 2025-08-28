// components/artist-card.tsx
"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, ImageIcon, Users, Music, Globe } from "lucide-react"
import { format } from 'date-fns'

type Artist = {
  id: string | number
  name: string
  genre?: string
  country?: string
  profile_image?: string | null
  social_accounts?: any[]
  distribution_accounts?: any[]
  projects?: any[]
  assetCount?: number
  created_at?: string
}

export function ArtistCard({ artist }: { artist: Artist }) {
  const initials =
    (artist.name || "")
      .split(" ")
      .map((n) => n[0])
      .join("") || "AR"

  const socialAccountsCount = artist.social_accounts?.length ?? 0
  const distributionAccountsCount = artist.distribution_accounts?.length ?? 0

  return (
    <Card className="transition-all hover:shadow-md hover:shadow-primary/10">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Avatar */}
          <Link href={`/artists/${artist.id}`} className="block flex-shrink-0">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-2 border-transparent hover:border-primary transition-colors">
              <AvatarImage src={artist.profile_image || "/placeholder.svg"} alt={artist.name} className="object-cover" />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
          </Link>

          {/* Artist Info & Stats */}
          <div className="flex-grow w-full">
            {/* Name and Genre */}
            <div className="mb-2">
              <Link href={`/artists/${artist.id}`}>
                <h3 className="text-xl font-bold hover:text-primary transition-colors">{artist.name}</h3>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                {artist.genre && <Badge variant="secondary">{artist.genre}</Badge>}
                {artist.country && (
                  <>
                    <span className="text-xs">•</span>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{artist.country}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm border-t pt-3 my-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-semibold">{socialAccountsCount}</div>
                  <div className="text-xs text-muted-foreground">Social</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-semibold">{distributionAccountsCount}</div>
                  <div className="text-xs text-muted-foreground">Distrib.</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-semibold">{artist.assetCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Assets</div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-2">
              <Link href={`/artists/${artist.id}`}>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  View
                </Button>
              </Link>
              <Link href={`/artists/${artist.id}/edit`}>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
