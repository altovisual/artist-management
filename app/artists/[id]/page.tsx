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
  MoreHorizontal,
  Users,
  FolderKanban,
  LayoutGrid,
  BarChart,
  Copy,
  ExternalLink,
  Star,
  Heart,
  Headphones,
  User,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ViewCredentialManager } from "@/components/view-credential-manager"
import { AssetKitTab } from "@/components/asset-kit-tab"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useIsMobile } from "@/components/ui/use-mobile"
import { toast } from "sonner"
import ArtistDetailPageSkeleton from "./artist-detail-skeleton"
import { AnimatedTitle } from "@/components/animated-title"
import { ArtistAnalyticsDashboard } from '@/components/artist-analytics-dashboard'
import { decrypt } from "@/lib/crypto"
import { 
  PageHeader, 
  StatsGrid, 
  ContentSection, 
  PageLayout 
} from "@/components/ui/design-system"

// --- Helper Functions ---
const getExt = (url?: string) => {
  if (!url) return ""
  try {
    const clean = url.split("?")[0]
    const dot = clean.lastIndexOf(".")
    if (dot === -1) return ""
    return clean.substring(dot + 1).toLowerCase()
  } catch {
    return ""
  }
}

const guessFormatFromExt = (ext: string) => {
  if (!ext) return "application/octet-stream"
  if (["jpg","jpeg","png","webp","gif","avif"].includes(ext)) return `image/${ext === "jpg" ? "jpeg" : ext}`
  if (ext === "svg") return "image/svg+xml"
  if (["mp4","webm","mov","m4v","ogv"].includes(ext)) return `video/${ext === "mov" ? "quicktime" : ext}`
  if (["ogg"].includes(ext)) return "audio/ogg"
  if (["mp3","wav","m4a","aac","flac"].includes(ext)) {
    if (ext === "mp3") return "audio/mpeg"
    return `audio/${ext}`
  }
  if (ext === "pdf") return "application/pdf"
  return "application/octet-stream"
}

const normalizeAsset = (a: any) => {
  const file_url = a?.file_url ?? a?.url ?? ""
  const format = a?.format ?? guessFormatFromExt(getExt(file_url))
  return { ...a, file_url, format }
}

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

export default function ArtistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const isMobile = useIsMobile()
  const supabase = createClient()
  const [artist, setArtist] = useState<any>(null)
  const [socialAccounts, setSocialAccounts] = useState<any[]>([])
  const [distributionAccounts, setDistributionAccounts] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCopyingPassword, setIsCopyingPassword] = useState<string | null>(null);

  const copyToClipboard = (text: string | null, successMessage: string) => {
    if (!text) {
      toast.info("No hay datos para copiar.");
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      toast.success("¡Copiado!", { description: successMessage });
    }).catch(() => {
      toast.error("Error al copiar", { description: "No se pudo copiar al portapapeles." });
    });
  };

  const handleCopyPassword = async (account: any) => {
    if (!account.password) {
      toast.info("No hay contraseña guardada para esta cuenta.");
      return;
    }
    setIsCopyingPassword(account.id);
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('password')
        .eq('id', account.id)
        .single();

      if (error || !data || !data.password) {
        throw new Error('No credential found for this account.');
      }

      const { encrypted, iv } = JSON.parse(data.password);
      const decrypted = await decrypt(encrypted, iv);
      
      copyToClipboard(decrypted, "La contraseña ha sido copiada al portapapeles.");

    } catch (error: any) {
      toast.error("Error al copiar la contraseña", { description: error.message });
    } finally {
      setIsCopyingPassword(null);
    }
  };

  useEffect(() => {
    const fetchArtistData = async () => {
      setLoading(true)
      const artistId = params.id as string

      if (artistId === "new") {
        router.push("/artists/new")
        return
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(artistId)) {
        router.push("/dashboard")
        return
      }

      try {
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select("*, spotify_artist_id, social_accounts(*), distribution_accounts(*)")
          .eq("id", artistId)
          .single()

        if (artistError) {
          router.push("/dashboard")
          return
        }

        setArtist(artistData)
        setSocialAccounts(artistData.social_accounts || [])
        setDistributionAccounts(artistData.distribution_accounts || [])

        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("artist_id", artistId)

        if (projectsError) {
          setProjects([])
          setAssets([])
        } else {
          setProjects(projectsData || [])
          const projectIds = projectsData.map((p) => p.id)
          if (projectIds.length > 0) {
            const { data: assetsData, error: assetsError } = await supabase
              .from("assets")
              .select("*")
              .in("project_id", projectIds)

            if (assetsError) {
              setAssets([])
            } else {
              const normalizedAssets = (assetsData || []).map(normalizeAsset);
              setAssets(normalizedAssets)
            }
          } else {
            setAssets([])
          }
        }
      } catch (error) {
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchArtistData()
  }, [params.id, router, supabase])

  const handleDeleteArtist = async () => {
    try {
      await supabase.from("artists").delete().eq("id", artist.id)
      toast.success("Artista eliminado", { description: "El artista ha sido eliminado correctamente." });
      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting artist:", error)
      toast.error("Error al eliminar", { description: "No se pudo eliminar el artista." });
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    const assetToDelete = assets.find(a => a.id === assetId);
    if (!assetToDelete) return;

    try {
      // 1. Delete file from storage
      const url = assetToDelete.file_url || assetToDelete.url;
      const filePath = url.split('/storage/v1/object/public/assets/').pop();
      if (filePath) {
        const { error: storageError } = await supabase.storage.from('assets').remove([filePath]);
        if (storageError) throw storageError;
      }

      // 2. Delete from database
      const { error: dbError } = await supabase.from('assets').delete().eq('id', assetId);
      if (dbError) throw dbError;

      // 3. Update state
      setAssets(assets.filter(a => a.id !== assetId));
      toast.success("Activo eliminado", { description: `El activo "${assetToDelete.name}" ha sido eliminado.` });

    } catch (error: any) {
      console.error("Error deleting asset:", error);
      toast.error("Error al eliminar el activo", { description: error.message || "No se pudo eliminar el activo." });
    }
  };

  if (loading) {
    return <ArtistDetailPageSkeleton />;
  }

  const renderTabContent = (tab: string) => {
    switch (tab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Artist Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="text-sm font-medium text-muted-foreground">First Name</label><p className="mt-1">{artist.first_name || "N/A"}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Last Name</label><p className="mt-1">{artist.last_name || "N/A"}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Date of Birth</label><p className="mt-1">{artist.date_of_birth ? new Date(artist.date_of_birth).toLocaleDateString() : "N/A"}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Genre</label><p className="mt-1">{artist.genre || "N/A"}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Country</label><p className="mt-1">{artist.country || "N/A"}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">ID Number</label><p className="mt-1">{artist.id_number || "N/A"}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Phone</label><p className="mt-1">{artist.phone || "N/A"}</p></div>
                    <div className="md:col-span-2"><label className="text-sm font-medium text-muted-foreground">Address</label><p className="mt-1">{artist.address || "N/A"}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Management Entity</label><p className="mt-1">{artist.management_entity || "N/A"}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">IPI Number</label><p className="mt-1">{artist.ipi || "N/A"}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Created</label><p className="mt-1">{new Date(artist.created_at).toLocaleDateString()}</p></div>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Biography</label>
                    <p className="mt-2 text-sm leading-relaxed">{artist.bio || "No biography available."}</p>
                  </div>
                  {artist.bank_info && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Bank Information</label>
                        <pre className="mt-2 text-sm leading-relaxed bg-muted p-3 rounded-md whitespace-pre-wrap">
                          {JSON.stringify(artist.bank_info, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between"><span className="text-muted-foreground">Social Accounts</span><span className="font-medium">{socialAccounts.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Distribution Platforms</span><span className="font-medium">{distributionAccounts.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Assets</span><span className="font-medium">{assets.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Streams</span><span className="font-medium">{artist.total_streams?.toLocaleString() || "0"}</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'releases':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Artist Releases</h2>
              <Link href={`/dashboard/releases?artistId=${artist.id}`}>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Lanzamiento
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length > 0 ? (
                projects.map((project: any) => (
                  <Card key={project.id}>
                    <CardHeader className="p-0">
                      <Image
                        src={project.cover_art_url || "/placeholder-logo.png"}
                        alt={project.name}
                        width={500}
                        height={192}
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
          </div>
        );
        case 'social':
          return (
            <Card>
              <CardHeader><CardTitle>Social Media Accounts</CardTitle></CardHeader>
              <CardContent>
                {socialAccounts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialAccounts.map((account: any) => (
                      <div key={account.id} className="p-4 border rounded-lg flex items-center justify-between gap-4">
                        <div className="flex-grow">
                          <a href={account.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 group">
                            {getPlatformIcon(account.platform)}
                            <div>
                              <p className="font-semibold group-hover:underline">{account.platform}</p>
                              <p className="text-sm text-muted-foreground">{account.username || 'No username'}</p>
                            </div>
                          </a>
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-2 w-28">
                          <Button variant="outline" size="sm" className="w-full" onClick={() => copyToClipboard(account.username, 'El nombre de usuario ha sido copiado.')}>
                            Copy User
                          </Button>
                          {account.password && (
                            <Button variant="secondary" size="sm" className="w-full" onClick={() => handleCopyPassword(account)} disabled={isCopyingPassword === account.id}>
                              {isCopyingPassword === account.id ? 'Copying...' : 'Copy Pass'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No social media accounts added yet.</p>
                )}
              </CardContent>
            </Card>
          );
      case 'distribution':
        return (
          <Card>
            <CardHeader><CardTitle>Distribution Accounts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {distributionAccounts.length > 0 ? (
                distributionAccounts.map((account: any) => (
                  <div key={account.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      {getPlatformIcon(account.service)}
                      <div className="flex-1">
                        <p className="font-medium">{account.service}</p>
                        <Badge variant="default" className="text-xs">Active</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-2">
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
        );
      case 'assets':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Asset Kit</h2>
              <Link href={`/artists/${artist.id}/assets`}>
                <Button>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Manage All Assets
                </Button>
              </Link>
            </div>
            <AssetKitTab assets={assets} onDelete={handleDeleteAsset} />
          </div>
        );
      case 'analytics': // New case for analytics tab
        return <ArtistAnalyticsDashboard artist={artist} />;
      default:
        return null;
    }
  }

  const renderMobileView = () => (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h2 className="font-semibold text-lg truncate">{artist.name}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild><Link href={`/artists/${artist.id}/edit`}><Edit className="h-4 w-4 mr-2" />Edit Artist</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href={`/artists/${artist.id}/assets`}><ImageIcon className="h-4 w-4 mr-2" />Manage Assets</Link></DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Delete Artist</DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. This will permanently delete the artist and all their associated data.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteArtist}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2">
            <AvatarImage src={artist.profile_image || "/placeholder.svg"} alt={artist.name} />
            <AvatarFallback>{artist.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div className="flex-1 grid grid-cols-3 gap-2 text-center">
            <div><p className="font-bold text-lg">{projects.length}</p><p className="text-xs text-muted-foreground">Releases</p></div>
            <div><p className="font-bold text-lg">{socialAccounts.length}</p><p className="text-xs text-muted-foreground">Social</p></div>
            <div><p className="font-bold text-lg">{assets.length}</p><p className="text-xs text-muted-foreground">Assets</p></div>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">{artist.name}</h3>
          <p className="text-sm text-muted-foreground">{artist.genre} Artist</p>
          <p className="text-sm mt-2 whitespace-pre-wrap">{artist.bio || "No biography available."}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button asChild variant="secondary"><Link href={`/artists/${artist.id}/edit`}>Edit Profile</Link></Button>
          <Button asChild variant="secondary"><Link href={`/artists/${artist.id}/assets`}>Manage Assets</Link></Button>
          <Button asChild variant="secondary"><Link href={`/artists/${artist.id}/creative-vault`}>Creative Vault</Link></Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="social"><Users className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="distribution"><FolderKanban className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="releases"><Music className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="assets"><ImageIcon className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="analytics"><BarChart className="h-4 w-4" /></TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">{renderTabContent('overview')}</TabsContent>
        <TabsContent value="social" className="mt-4">{renderTabContent('social')}</TabsContent>
        <TabsContent value="distribution" className="mt-4">{renderTabContent('distribution')}</TabsContent>
        <TabsContent value="releases" className="mt-4">{renderTabContent('releases')}</TabsContent>
        <TabsContent value="assets" className="mt-4">{renderTabContent('assets')}</TabsContent>
        <TabsContent value="analytics" className="mt-4">{renderTabContent('analytics')}</TabsContent>
      </Tabs>
    </div>
  );

  const renderDesktopView = () => {
    // Prepare stats data
    const statsData = [
      {
        title: "Releases",
        value: projects.length,
        icon: Music,
        description: "Total projects"
      },
      {
        title: "Social Accounts", 
        value: socialAccounts.length,
        icon: Users,
        description: "Connected platforms"
      },
      {
        title: "Assets",
        value: assets.length,
        icon: ImageIcon,
        description: "Media files"
      },
      {
        title: "Total Streams",
        value: artist.total_streams?.toLocaleString() || "0",
        icon: Headphones,
        description: "All platforms"
      }
    ]

    return (
      <PageLayout spacing="normal">
        {/* Page Header */}
        <PageHeader
          title={artist.name}
          subtitle={`${artist.country || "Location not specified"}`}
          description={artist.bio}
          badge={{
            text: `${artist.genre} Artist`,
            variant: 'secondary'
          }}
          avatar={{
            src: artist.profile_image || "/placeholder.svg",
            fallback: artist.name.split(" ").map((n: string) => n[0]).join("")
          }}
          actions={[
            {
              label: "Edit Profile",
              href: `/artists/${artist.id}/edit`,
              variant: 'default',
              icon: Edit
            },
            {
              label: "Assets",
              href: `/artists/${artist.id}/assets`,
              variant: 'outline',
              icon: ImageIcon
            }
          ]}
        />

        {/* Stats Grid */}
        <StatsGrid stats={statsData} columns={4} />

        {/* Content Tabs */}
        <ContentSection
          title="Artist Details"
          description="Manage all aspects of the artist profile"
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="releases">Releases</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">{renderTabContent('overview')}</TabsContent>
            <TabsContent value="social">{renderTabContent('social')}</TabsContent>
            <TabsContent value="distribution">{renderTabContent('distribution')}</TabsContent>
            <TabsContent value="releases">{renderTabContent('releases')}</TabsContent>
            <TabsContent value="assets">{renderTabContent('assets')}</TabsContent>
            <TabsContent value="analytics">{renderTabContent('analytics')}</TabsContent>
          </Tabs>
        </ContentSection>
      </PageLayout>
    )
  };

  return (
    <DashboardLayout>
      {isMobile ? renderMobileView() : renderDesktopView()}
    </DashboardLayout>
  )
}