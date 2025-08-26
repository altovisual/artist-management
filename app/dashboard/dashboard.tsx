import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Eye, Edit, ImageIcon } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: artists, error: artistsError } = await supabase.from("artists").select(`
      *,
      social_accounts(*),
      distribution_accounts(*),
      assets(*)
    `)

  if (artistsError) {
    console.error("Error fetching artists:", artistsError)
    return <div>Error loading artists.</div>
  }

  const artistsWithCounts =
    artists?.map((artist) => ({
      ...artist,
      socialAccountsCount: artist.social_accounts?.length || 0,
      distributionAccountsCount: artist.distribution_accounts?.length || 0,
      assetCount: artist.assets?.length || 0,
    })) || []

  return (
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Artists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{artistsWithCounts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Artists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{artistsWithCounts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Social Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {artistsWithCounts.reduce((sum, a) => sum + a.socialAccountsCount, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Distribution Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {artistsWithCounts.reduce((sum, a) => sum + a.distributionAccountsCount, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{artistsWithCounts.reduce((sum, a) => sum + a.assetCount, 0)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Artists Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Artists</CardTitle>
                <Link href="/artists/new">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Artist
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
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
                  {artistsWithCounts.map((artist) => (
                    <TableRow key={artist.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={artist.profile_image || "/placeholder.svg"} alt={artist.name} />
                            <AvatarFallback>
                              {artist.name
                                .split(" ")
                                .map((n) => n[0])
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
                          <ImageIcon className="h-3 w-3 text-muted-foreground" />
                          {artist.assetCount}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(artist.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/artists/${artist.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                          </Link>
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
