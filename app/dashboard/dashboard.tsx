import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ImageIcon, Calendar } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { ArtistViewSwitcher } from "@/components/artist-view-switcher"
import { DashboardTour } from "@/components/dashboard-tour"
import { DbSizeCard } from "@/components/db-size-card"

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: artists, error: artistsError } = await supabase
    .from("artists")
    .select("*, social_accounts(*), distribution_accounts(*), projects(id, assets(id))")

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold">Artist Management</h1>
                <p className="text-muted-foreground text-sm">Welcome back, {user.email}</p>
              </div>
              <div className="w-full sm:w-auto">
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="flex overflow-x-auto pb-4 space-x-4 md:grid md:grid-cols-6 md:gap-4 animate-in fade-in duration-500 stats-cards-container">
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
              <DbSizeCard />
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
                <ArtistViewSwitcher artists={artistsWithCounts} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  )
}