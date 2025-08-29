'use client'

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Music, ImageIcon, MoreVertical, Edit } from "lucide-react"

type Artist = {
  id: string | number
  name: string
  genre?: string
  profile_image?: string | null
  social_accounts?: any[]
  distribution_accounts?: any[]
  assetCount?: number
}

export function ArtistCard({ artist }: { artist: Artist }) {
  const initials = (artist.name || "").split(" ").map((n) => n[0]).join("") || "AR"
  const socialAccountsCount = artist.social_accounts?.length ?? 0
  const distributionAccountsCount = artist.distribution_accounts?.length ?? 0

  return (
    <Card className="relative group overflow-hidden rounded-lg transition-all hover:shadow-xl hover:scale-[1.02] duration-300 ease-in-out">
      {/* Action Menu */}
      <div className="absolute top-2 right-2 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/artists/${artist.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Artist</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Link */}
      <Link href={`/artists/${artist.id}`} className="block">
        {/* Banner Section */}
        <div className="relative h-28 bg-secondary/50">
          {artist.profile_image && (
            <Image
              src={artist.profile_image}
              alt={`${artist.name} banner`}
              fill
              className="object-cover filter blur-lg scale-110 opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent"></div>
        </div>

        {/* Avatar & Name Section */}
        <div className="relative px-6 pb-6">
          <div className="-mt-16 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
              <AvatarImage src={artist.profile_image || "/placeholder.svg"} alt={artist.name} className="object-cover" />
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold mt-4">{artist.name}</h3>
            {artist.genre && <Badge variant="outline" className="mt-1">{artist.genre}</Badge>}
          </div>

          {/* Stats Section */}
          <div className="mt-6 pt-6 border-t">
            <dl className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <dt className="text-sm font-medium text-muted-foreground">Social</dt>
                <dd className="flex items-center gap-1 text-lg font-semibold mt-1">
                  <Users className="h-4 w-4 text-primary" />
                  {socialAccountsCount}
                </dd>
              </div>
              <div className="flex flex-col items-center">
                <dt className="text-sm font-medium text-muted-foreground">Distrib.</dt>
                <dd className="flex items-center gap-1 text-lg font-semibold mt-1">
                  <Music className="h-4 w-4 text-primary" />
                  {distributionAccountsCount}
                </dd>
              </div>
              <div className="flex flex-col items-center">
                <dt className="text-sm font-medium text-muted-foreground">Assets</dt>
                <dd className="flex items-center gap-1 text-lg font-semibold mt-1">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  {artist.assetCount ?? 0}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Link>
    </Card>
  )
}