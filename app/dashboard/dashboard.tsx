"use client"

import { useState, useEffect } from "react"
import { redirect, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ImageIcon, Calendar, Search } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { ArtistViewSwitcher } from "@/components/artist-view-switcher"
import { DashboardTour } from "@/components/dashboard-tour"
import { DbSizeCard } from "@/components/db-size-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import dayjs from "dayjs"

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")

  // Original async logic needs to be moved inside useEffect or a separate async function
  // and then state variables used to store the fetched data.
  // For now, I'll keep the async logic as is, but it will need adjustment.
  // This is a temporary step to add the search bar.

  // Placeholder for artists data, will be fetched in useEffect
  const [artistsData, setArtistsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Fetch data in useEffect
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUserEmail(user.email ?? null);

      const isAdmin = user.app_metadata?.role === 'admin';
      
      let artists: any[] | null = [];
      let artistsError: any = null;

      if (isAdmin) {
        // Admins fetch all artists via RPC to bypass RLS complexities on JOINs
        const { data, error } = await supabase.rpc('get_all_artists_for_admin');
        artists = data;
        artistsError = error;
      } else {
        // Non-admins fetch only their own profile, RLS will enforce this
        const { data, error } = await supabase
          .from("artists")
          .select("*, social_accounts(*), distribution_accounts(*), projects(name, release_date, assets(id))")
          .eq('user_id', user.id);
        artists = data;
        artistsError = error;
      }

      if (artistsError) {
        console.error("Error fetching artists:", artistsError)
        // Handle error, maybe set an error state
      } else {
        const artistsWithCounts =
          artists?.map((artist: any) => {
            const now = dayjs();
            const upcomingProjects = (artist.projects || [])
              .filter((project: any) => dayjs(project.release_date).isAfter(now) || dayjs(project.release_date).isSame(now, 'day'))
              .sort((a: any, b: any) => dayjs(a.release_date).diff(dayjs(b.release_date)));

            const nextRelease = upcomingProjects.length > 0 ? upcomingProjects[0] : null;

            return {
              ...artist,
              socialAccountsCount: artist.social_accounts?.length || 0,
              distributionAccountsCount: artist.distribution_accounts?.length || 0,
              assetCount: artist.projects?.reduce((sum: number, p: any) => sum + (p.assets?.length || 0), 0) || 0,
              nextRelease: nextRelease,
            };
          }) || [];
        setArtistsData(artistsWithCounts)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [router]) // Empty dependency array to run once on mount

  const filteredArtists = artistsData.filter((artist: any) =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                <p className="text-muted-foreground text-sm">Welcome back, {userEmail}</p>
              </div>
              <div className="w-full sm:w-auto">
                <div className="flex items-center gap-2">
                <ThemeToggle />
                <LogoutButton />
              </div>
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
                  <div className="text-2xl font-bold sm:text-xl">{artistsData.length}</div>
                </CardContent>
              </Card>

              <Card className="min-w-[160px]">
                <CardHeader className="pb-2 sm:pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground sm:text-xs">Active Artists</CardTitle>
                </CardHeader>
                <CardContent className="sm:py-2">
                  <div className="text-2xl font-bold sm:text-xl">{artistsData.length}</div>
                </CardContent>
              </Card>

              <Card className="min-w-[160px]">
                <CardHeader className="pb-2 sm:pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground sm:text-xs">Total Social Accounts</CardTitle>
                </CardHeader>
                <CardContent className="sm:py-2">
                  <div className="text-2xl font-bold">
                    {artistsData.reduce((sum: number, a: any) => sum + a.socialAccountsCount, 0)}
                  </div>
                </CardContent>
              </Card>

              <Card className="min-w-[160px]">
                <CardHeader className="pb-2 sm:pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground sm:text-xs">Distribution Accounts</CardTitle>
                </CardHeader>
                <CardContent className="sm:py-2">
                  <div className="text-2xl font-bold">
                    {artistsData.reduce((sum: number, a: any) => sum + a.distributionAccountsCount, 0)}
                  </div>
                </CardContent>
              </Card>

              <Card className="min-w-[160px]">
                <CardHeader className="pb-2 sm:pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground sm:text-xs">Total Assets</CardTitle>
                </CardHeader>
                <CardContent className="sm:py-2">
                  <div className="text-2xl font-bold">
                    {artistsData.reduce((sum: number, a: any) => sum + a.assetCount, 0)}
                  </div>
                </CardContent>
              </Card>
              <DbSizeCard />
            </div>

            {/* Artists Table */}
            <Card className="artists-table-container">
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <CardTitle>Artists</CardTitle>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search artists..."
                        className="pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link href="/dashboard/releases" className="flex-1">
                        <Button size="default" variant="outline">
                          <Calendar className="h-5 w-5" />
                          <span className="sr-only">Calendario de Lanzamientos</span>
                        </Button>
                      </Link>
                      <Link href="/artists/new" className="flex-1">
                        <Button className="flex items-center gap-2 w-full">
                          <Plus className="h-4 w-4" />
                          Add Artist
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <p>Loading artists...</p>
                ) : filteredArtists.length === 0 && searchTerm !== "" ? (
                  <p className="text-muted-foreground text-center">No artists found matching your search.</p>
                ) : filteredArtists.length === 0 && searchTerm === "" ? (
                  <p className="text-muted-foreground text-center">No artists found. Add a new artist to get started!</p>
                ) : (
                  <ArtistViewSwitcher artists={filteredArtists} />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  )
}