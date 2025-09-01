'use client'

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Music, Instagram, ImageIcon, Eye, Download, Video, FileText, Trash2, PlusCircle, Search, Upload } from "lucide-react"
import Link from "next/link"
import { AssetsSkeleton } from "./assets-skeleton"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useToast } from "@/components/ui/use-toast"
import { useIsMobile } from "@/components/ui/use-mobile"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Musical Releases":
      return <Music className="h-4 w-4 text-muted-foreground" />
    case "Social Media":
      return <Instagram className="h-4 w-4 text-muted-foreground" />
    case "Press & Promotion":
      return <ImageIcon className="h-4 w-4 text-muted-foreground" />
    default:
      return <ImageIcon className="h-4 w-4 text-muted-foreground" />
  }
}

const AssetPreview = ({ asset }: { asset: any }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const fmt: string = asset.format || ""
  const url: string = asset.file_url || asset.url || ""

  if (fmt.startsWith("image/")) {
    return (
      <div className={`relative w-full h-full bg-gray-200 ${!imageLoaded ? 'animate-pulse' : ''}`}>
        <Image
          src={url}
          alt={asset.name}
          fill
          className={`object-cover ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          style={{ transition: "opacity 0.3s ease-in-out" }}
        />
      </div>
    )
  }
  if (fmt.startsWith("video/")) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <Video className="h-12 w-12 text-white" />
      </div>
    )
  }
  if (fmt.startsWith("audio/")) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <Music className="h-12 w-12 text-muted-foreground" />
      </div>
    )
  }
  if (fmt === "application/pdf") {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
    )
  }
  return (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <ImageIcon className="h-12 w-12 text-muted-foreground" />
    </div>
  )
}

// --- Main Component ---

export default function ArtistAssetsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const [artist, setArtist] = useState<any>(null)
  const [assets, setAssets] = useState<any[]>([])
  const [filteredAssets, setFilteredAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [assetToDelete, setAssetToDelete] = useState<any>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const categoryBorderColors: { [key: string]: string } = {
    "Musical Releases": "border-blue-500",
    "Social Media": "border-purple-500",
    "Press & Promotion": "border-green-500",
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename || 'download';
      a.click();
      
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the file. The link may be invalid or blocked.",
        variant: "destructive",
      })
    }
  };

  const handleDeleteAsset = async () => {
    if (!assetToDelete) return;

    try {
      const url = assetToDelete.file_url || assetToDelete.url;
      const filePath = url.split('/storage/v1/object/public/assets/').pop();
      if (filePath) {
        const { error: storageError } = await supabase.storage.from('assets').remove([filePath]);
        if (storageError) throw storageError;
      }

      const { error: dbError } = await supabase.from('assets').delete().eq('id', assetToDelete.id);
      if (dbError) throw dbError;

      const newAssets = assets.filter(a => a.id !== assetToDelete.id);
      setAssets(newAssets);
      setFilteredAssets(newAssets);

      toast({ title: "Success", description: `Asset "${assetToDelete.name}" deleted.` });

    } catch (error: any) {
      console.error("Error deleting asset:", error);
      toast({ title: "Error", description: error.message || "Failed to delete asset.", variant: "destructive" });
    } finally {
      setAssetToDelete(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const artistId = params.id as string

      const { data: artistData, error: artistError } = await supabase
        .from("artists")
        .select("name")
        .eq("id", artistId)
        .single()

      if (artistError || !artistData) {
        console.error("Error fetching artist name", artistError)
        router.push("/dashboard")
        return
      }
      setArtist(artistData)

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id")
        .eq("artist_id", artistId)

      if (projectsError) {
        console.error("Error fetching projects:", projectsError)
        setAssets([])
        setFilteredAssets([])
      } else {
        const projectIds = (projectsData || []).map((p) => p.id)
        if (projectIds.length > 0) {
          const { data: assetsData, error: assetsError } = await supabase
            .from("assets")
            .select("*")
            .in("project_id", projectIds)
            .order("created_at", { ascending: false })

          if (assetsError) {
            console.error("Error fetching assets", assetsError)
            setAssets([])
            setFilteredAssets([])
          }
          else {
            const normalized = (assetsData || []).map(normalizeAsset)
            setAssets(normalized)
            setFilteredAssets(normalized)
          }
        } else {
          setAssets([])
          setFilteredAssets([])
        }
      }
      setIsLoading(false)
    }

    fetchData()
  }, [params.id, router, supabase])

  useEffect(() => {
    let filtered = assets

    if (searchTerm) {
      filtered = filtered.filter(
        (asset) =>
          asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (asset.type && asset.type.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((asset) => asset.category === categoryFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((asset) => asset.type === typeFilter)
    }

    setFilteredAssets(filtered)
  }, [searchTerm, categoryFilter, typeFilter, assets])

  const categories = ["Musical Releases", "Social Media", "Press & Promotion"]
  const types = [...new Set(assets.map((asset) => asset.type))].filter(Boolean)

  const renderStats = () => {
    const imagesCount = assets.filter((a) => a.format?.startsWith("image/")).length;
    const videosCount = assets.filter((a) => a.format?.startsWith("video/")).length;
    const docsCount = assets.filter((a) => a.format === "application/pdf").length;

    if (isMobile) {
      return (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold">{assets.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{imagesCount}</p>
                <p className="text-xs text-muted-foreground">Images</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{videosCount}</p>
                <p className="text-xs text-muted-foreground">Videos</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{docsCount}</p>
                <p className="text-xs text-muted-foreground">Docs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{imagesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videosCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{docsCount}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <header className="border-b bg-card mb-6">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-grow text-center sm:text-left">
                  <h1 className="text-2xl font-bold tracking-tight">Asset Management</h1>
                  <p className="text-muted-foreground">For {artist?.name || "..."}</p>
              </div>
              <Link href={`/artists/${params.id}/assets/new`} className="w-full sm:w-auto">
                <Button className="flex items-center gap-2 w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Upload Asset
                </Button>
              </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-2">

        {isLoading ? (
          <AssetsSkeleton />
        ) : (
          <div className="space-y-6">
            {renderStats()}

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="filter-category" className="w-full md:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="filter-type" className="w-full md:w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAssets.map((asset) => {
                const url = asset.file_url || asset.url || ""
                return (
                  <Card
                    key={asset.id}
                    className={`group overflow-hidden border-l-4 ${
                      categoryBorderColors[asset.category] || "border-gray-200"
                    } flex flex-col`}
                  >
                    <div className="aspect-square relative bg-muted">
                      <AssetPreview asset={asset} />
                       <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {asset.format || (getExt(url) ? `.${getExt(url)}` : "file")}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          {getCategoryIcon(asset.category)}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate" title={asset.name}>{asset.name}</h3>
                            <p className="text-xs text-muted-foreground">{asset.type}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1 mt-2">
                          <p>Uploaded: {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : "—"}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:gap-1">
                        <Button asChild variant="outline" size="sm" className="w-full sm:flex-1 bg-transparent">
                           <a href={url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full sm:flex-1 bg-transparent" onClick={() => handleDownload(url, asset.name)}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button variant="destructive" size="sm" className="w-full sm:flex-1" onClick={() => setAssetToDelete(asset)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredAssets.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <ImageIcon className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No Assets Found</h3>
                  <p className="text-muted-foreground mb-4 text-center">
                    {searchTerm || categoryFilter !== "all" || typeFilter !== "all"
                      ? "Try adjusting your search or filters."
                      : artist?.name
                      ? `It looks like ${artist.name} hasn’t uploaded any assets yet. Time to get started!`
                      : "Get started by uploading your first asset."}
                  </p>
                  <Link href={`/artists/${params.id}/assets/new`}>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Asset
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <AlertDialog open={!!assetToDelete} onOpenChange={(isOpen) => !isOpen && setAssetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the asset &quot;{assetToDelete?.name}&quot;.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDeleteAsset}>Delete</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  )
}
