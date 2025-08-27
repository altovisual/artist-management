'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Edit,
  Instagram,
  Twitter,
  Youtube,
  Music,
  SproutIcon as Spotify,
  Apple,
  ImageIcon,
  Plus,
  Eye,
  Download,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ViewCredentialManager } from "@/components/view-credential-manager"

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "instagram":
      return <Instagram className="h-4 w-4" />
    case "twitter":
      return <Twitter className="h-4 w-4" />
    case "youtube":
      return <Youtube className="h-4 w-4" />
    case "spotify":
      return <Spotify className="h-4 w-4" />
    case "apple music":
      return <Apple className="h-4 w-4" />
    default:
      return <Music className="h-4 w-4" />
  }
}

const getAssetTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "cover art":
    case "press photo":
    case "concert poster":
      return <ImageIcon className="h-4 w-4" />
    case "spotify canvas":
    case "lyric video":
      return <Youtube className="h-4 w-4" />
    case "story template":
    case "post template":
    case "youtube thumbnail":
      return <ImageIcon className="h-4 w-4" />
    default:
      return <ImageIcon className="h-4 w-4" />
  }
}

export default function ArtistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [artist, setArtist] = useState<any>(null)
  const [socialAccounts, setSocialAccounts] = useState<any[]>([])
  const [distributionAccounts, setDistributionAccounts] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([]) // Nuevo estado para proyectos
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArtistData = async () => {
      const supabase = createClient()
      const artistId = params.id as string

      if (artistId === "new") {
        router.push("/artists/new")
        return
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(artistId)) {
        console.error("[v0] Invalid UUID format:", artistId)
        router.push("/dashboard")
        return
      }

      console.log("[v0] Fetching artist data for ID:", artistId)

      try {
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select("*, social_accounts(*), distribution_accounts(*)")
          .eq("id", artistId)
          .single()

        if (artistError) {
          console.error("[v0] Error fetching artist:", artistError.message)
          router.push("/dashboard")
          return
        }

        console.log("[v0] Artist data:", artistData)
        setArtist(artistData)
        setSocialAccounts(artistData.social_accounts || [])
        setDistributionAccounts(artistData.distribution_accounts || [])

        // Fetch projects for the artist
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*") // Ahora seleccionamos todos los campos del proyecto
          .eq("artist_id", artistId)

        if (projectsError) {
          console.error("[v0] Error fetching projects:", projectsError)
          setProjects([]) // Asegurarse de que projects esté vacío en caso de error
          setAssets([])
        } else {
          console.log("[v0] Projects data:", projectsData)
          setProjects(projectsData || []) // Guardar los proyectos en el nuevo estado
          const projectIds = projectsData.map((p) => p.id)
          if (projectIds.length > 0) {
            const { data: assetsData, error: assetsError } = await supabase
              .from("assets")
              .select("*")
              .in("project_id", projectIds)

            if (assetsError) {
              console.error("[v0] Error fetching assets:", assetsError)
              setAssets([])
            } else {
              console.log("[v0] Assets:", assetsData)
              setAssets(assetsData || [])
            }
          } else {
            setAssets([])
          }
        }
      } catch (error) {
        console.error("[v0] Unexpected error:", error)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchArtistData()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Artist not found</div>
      </div>
    )
  }

  const handleDelete = async () => {
    const supabase = createClient()
    try {
      const { error } = await supabase.from("artists").delete().eq("id", artist.id)
      if (error) {
        throw error
      }
      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting artist:", error)
    }
  }

  const assetsByCategory = {
    musicalReleases: assets.filter((asset) => asset.category === "musical_releases"),
    socialMedia: assets.filter((asset) => asset.category === "social_media"),
    pressPromotion: assets.filter((asset) => asset.category === "press_promotion"),
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={artist.profile_image || "/placeholder.svg"} alt={artist.name} />
                  <AvatarFallback>
                    {artist.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{artist.name}</h1>
                  <p className="text-muted-foreground">{artist.genre} Artist</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/artists/${artist.id}/assets`}>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <ImageIcon className="h-4 w-4" />
                  Manage Assets
                </Button>
              </Link>
              <Link href={`/artists/${artist.id}/edit`}>
                <Button className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Artist
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Artist
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the artist and all their associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="releases">Releases</TabsTrigger>
            <TabsTrigger value="assets">Asset Kit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Artist Information */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Artist Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Genre</label>
                        <p className="mt-1">{artist.genre}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Country</label>
                        <p className="mt-1">{artist.country}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Total Streams</label>
                        <p className="mt-1">{artist.total_streams?.toLocaleString() || "0"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Monthly Listeners</label>
                        <p className="mt-1">{artist.monthly_listeners?.toLocaleString() || "0"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Created</label>
                        <p className="mt-1">{new Date(artist.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Biography</label>
                      <p className="mt-2 text-sm leading-relaxed">{artist.bio || "No biography available."}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Social Accounts</span>
                      <span className="font-medium">{socialAccounts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distribution Platforms</span>
                      <span className="font-medium">{distributionAccounts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Assets</span>
                      <span className="font-medium">{assets.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Streams</span>
                      <span className="font-medium">{artist.total_streams?.toLocaleString() || "0"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="releases" className="space-y-6">
            <h2 className="text-2xl font-bold">Artist Releases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length > 0 ? (
                projects.map((project: any) => (
                  <Card key={project.id}>
                    <CardHeader className="p-0">
                      <img
                        src={project.cover_art_url || "/placeholder-logo.png"}
                        alt={project.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {project.type} • {new Date(project.release_date).toLocaleDateString()}
                      </p>
                      <Badge variant="secondary">{project.status}</Badge>
                      {project.music_file_url && (
                        <div className="mt-2">
                          <audio controls src={project.music_file_url} className="w-full" />
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Link href={`/dashboard/releases?id=${project.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </Button>
                        </Link>
                        {project.music_file_url && (
                          <Button asChild variant="outline" size="sm">
                            <a href={project.music_file_url} download>
                              <Download className="h-4 w-4 mr-2" /> Download Music
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-8">No releases found for this artist.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                {socialAccounts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialAccounts.map((account: any) => (
                      <div key={account.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(account.platform)}
                          <div>
                            <p className="font-medium">{account.platform}</p>
                            <p className="text-sm text-muted-foreground">{account.handle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{account.username}</p>
                          <p className="text-sm text-muted-foreground">username</p>
                        </div>
                        {account.password && <ViewCredentialManager accountId={account.id} tableName="social_accounts" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No social media accounts added yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {distributionAccounts.length > 0 ? (
                  distributionAccounts.map((account: any) => (
                    <div key={account.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        {getPlatformIcon(account.service)}
                        <div className="flex-1">
                          <p className="font-medium">{account.service}</p>
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Username:</strong> {account.username}</p>
                        <p><strong>Email:</strong> {account.email}</p>
                        <p><strong>Monthly Listeners:</strong> {account.monthly_listeners?.toLocaleString() || "0"}</p>
                        <p><strong>Notes:</strong> {account.notes}</p>
                      </div>
                      {account.password && <ViewCredentialManager accountId={account.id} tableName="distribution_accounts" />}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No distribution accounts added yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Asset Kit</h2>
              <Link href={`/artists/${artist.id}/assets/new`}>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Asset
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Musical Releases */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Musical Releases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assetsByCategory.musicalReleases.length > 0 ? (
                    assetsByCategory.musicalReleases.map((asset: any) => (
                      <div key={asset.id} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <img
                            src={asset.file_url || "/placeholder.svg"}
                            alt={asset.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">{asset.asset_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {asset.file_format} • {asset.file_size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4 text-sm">No musical release assets yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Instagram className="h-5 w-5" />
                    Social Media
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assetsByCategory.socialMedia.length > 0 ? (
                    assetsByCategory.socialMedia.map((asset: any) => (
                      <div key={asset.id} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <img
                            src={asset.file_url || "/placeholder.svg"}
                            alt={asset.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">{asset.asset_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {asset.file_format} • {asset.file_size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4 text-sm">No social media assets yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Press & Promotion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Press & Promotion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assetsByCategory.pressPromotion.length > 0 ? (
                    assetsByCategory.pressPromotion.map((asset: any) => (
                      <div key={asset.id} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <img
                            src={asset.file_url || "/placeholder.svg"}
                            alt={asset.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">{asset.asset_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {asset.file_format} • {asset.file_size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4 text-sm">No press & promotion assets yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}