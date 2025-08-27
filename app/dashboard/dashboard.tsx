import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Eye, Edit, ImageIcon, Calendar } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { ArtistMobileCard } from "@/components/artist-mobile-card"
import { DashboardTour } from "@/components/dashboard-tour"
import { format } from 'date-fns'

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Si no tienes relaciones en la tabla, este *select('*')* está bien para ahora
  // Si no tienes relaciones en la tabla, este *select('*')* está bien para ahora
  const { data: artists, error: artistsError } = await supabase
    .from("artists")
    .select("*, social_accounts(*), distribution_accounts(*), projects(id, assets(id))") // Modificado para incluir proyectos y assets

  if (artistsError) {
    console.error("Error fetching artists:", artistsError)
    return <div>Error loading artists.</div>
  }

  const artistsWithCounts =
    artists?.map((artist: any) => ({
      ...artist,
      socialAccountsCount: artist.social_accounts?.length || 0,
      distributionAccountsCount: artist.distribution_accounts?.length || 0,
      assetCount:
        artist.projects?.reduce((sum: number, p: any) => sum + (p.assets?.length || 0), 0) || 0,
    })) || []

  return (
    <>
      <DashboardTour />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Artist Management</h1>
                <p className="text-muted-foreground">Welcome back, {user.email}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="flex overflow-x-auto pb-4 space-x-4 md:grid md:grid-cols-5 md:gap-4 animate-in fade-in duration-500 stats-cards-container">
              <Card className="min-w-[160px]">
                <CardHeader className="pb-2 sm:pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground sm:text-xs">Total Artists</CardTitle>
                </CardHeader>
                <CardContent className="sm:py-2">
                  <div className="text-2xl font-bold sm:text-xl">{artistsWithCounts.length}</div>
                </CardContent>
              </Card>

              <Card className="min-w-[160px]">
                <CardHeader className="pb-2 sm:pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground sm:text-xs">Active Artists</CardTitle>
                </CardHeader>
                <CardContent className="sm:py-2">
                  <div className="text-2xl font-bold sm:text-xl">{artistsWithCounts.length}</div>
                </CardContent>
              </Card>

              <Card className="min-w-[160px]">
                <CardHeader className="pb-2 sm:pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground sm:text-xs">Total Social Accounts</CardTitle>
                </CardHeader>
                <CardContent className="sm:py-2">
                  <div className="text-2xl font-bold">
                    {artistsWithCounts.reduce((sum: number, a: any) => sum + a.socialAccountsCount, 0)}
                  </div>
                </CardContent>
              </Card>

              <Card className="min-w-[160px]">
                <CardHeader className="pb-2 sm:pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground sm:text-xs">Distribution Accounts</CardTitle>
                </CardHeader>
                <CardContent className="sm:py-2">
                  <div className="text-2xl font-bold">
                    {artistsWithCounts.reduce((sum: number, a: any) => sum + a.distributionAccountsCount, 0)}
                  </div>
                </CardContent>
              </Card>

              <Card className="min-w-[160px]">
                <CardHeader className="pb-2 sm:pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground sm:text-xs">Total Assets</CardTitle>
                </CardHeader>
                <CardContent className="sm:py-2">
                  <div className="text-2xl font-bold">
                    {artistsWithCounts.reduce((sum: number, a: any) => sum + a.assetCount, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Artists Table */}
            <Card className="artists-table-container">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Artists</CardTitle>
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard/releases">
                      <Button size="icon" variant="outline">
                        <Calendar className="h-4 w-4" />
                        <span className="sr-only">Calendario de Lanzamientos</span>
                      </Button>
                    </Link>
                    <Link href="/artists/new">
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Artist
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Artist</TableHead>
                        <TableHead>Genre</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Social Accounts</TableHead>
                        <TableHead>Distribution</TableHead>
                        <TableHead>Assets</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {artistsWithCounts.map((artist: any) => (
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
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Link href={`/artists/${artist.id}`}>
                                <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                                  <Eye className="h-3 w-3" />
                                  View
                                </Button>
                              </Link>
                              {artist.projects && artist.projects.length > 0 && (
                                <Link href={`/artists/${artist.id}/assets`}>
                                  <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                                    <ImageIcon className="h-3 w-3" />
                                    Assets
                                  </Button>
                                </Link>
                              )}
                              <Link href={`/artists/${artist.id}/edit`}>
                                <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                                  <Edit className="h-3 w-3" />
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden space-y-4">
                  {artistsWithCounts.map((artist: any) => (
                    <ArtistMobileCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  )
}