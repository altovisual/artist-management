// components/artist-view-switcher.tsx
"use client"

import { useState } from "react"
import { ArtistCard } from "@/components/artist-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Eye, Edit, ImageIcon, LayoutGrid, List } from "lucide-react"
import Link from "next/link"
import { format } from 'date-fns'

type Artist = any // Using any for simplicity as it matches the dashboard data

export function ArtistViewSwitcher({ artists }: { artists: Artist[] }) {
  const [view, setView] = useState("grid")

  return (
    <div>
      <div className="flex justify-end mb-4">
        <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value)} aria-label="View mode">
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      ) : (
        // List View (Table)
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artist</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Social</TableHead>
                <TableHead>Distrib.</TableHead>
                <TableHead>Assets</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={artist.profile_image || "/placeholder.svg"} alt={artist.name} />
                        <AvatarFallback>
                          {(artist.name || "")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {artist.name}
                    </div>
                  </TableCell>
                  <TableCell>{artist.genre}</TableCell>
                  <TableCell>{artist.country}</TableCell>
                  <TableCell>{artist.socialAccountsCount}</TableCell>
                  <TableCell>{artist.distributionAccountsCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {artist.assetCount}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(artist.created_at), 'MM/dd/yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/artists/${artist.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/artists/${artist.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
