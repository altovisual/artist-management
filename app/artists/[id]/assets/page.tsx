"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Search, Upload, Eye, Download, Music, Instagram, ImageIcon, FileText, Video, Copy } from "lucide-react"
import Link from "next/link"
import { AssetsSkeleton } from "./assets-skeleton"
import { useToast } from "@/components/ui/use-toast"

/* ---------------- helpers de normalización/preview ---------------- */

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
  if (["ogg"].includes(ext)) return "audio/ogg" // puede ser video también, pero sirve como fallback
  if (["mp3","wav","m4a","aac","flac"].includes(ext)) {
    if (ext === "mp3") return "audio/mpeg"
    return `audio/${ext}`
  }
  if (ext === "pdf") return "application/pdf"
  return "application/octet-stream"
}

/** Devuelve un asset normalizado para que SIEMPRE tenga `file_url` y `format` */
const normalizeAsset = (a: any) => {
  const file_url = a?.file_url ?? a?.url ?? ""
  const format = a?.format ?? guessFormatFromExt(getExt(file_url))
  return { ...a, file_url, format }
}

/* ---------------- UI helpers ya con tu estructura ---------------- */

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
      <div className="relative w-full h-full bg-gray-200 animate-pulse">
        <img
          src={url}
          alt={asset.name}
          className={`w-full h-full object-cover ${imageLoaded ? "opacity-100" : "opacity-0"}`}
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

const LargeAssetPreview = ({ asset }: { asset: any }) => {
  const [mediaError, setMediaError] = useState(false)
  const fmt: string = asset?.format || ""
  const url: string = asset?.file_url || asset?.url || ""

  useEffect(() => {
    // reset al cambiar de asset
    setMediaError(false)
  }, [asset?.id, url])

  if (!asset) return null

  if (mediaError) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <h3 className="text-lg font-bold">Error al cargar el archivo</h3>
        <p className="text-muted-foreground">
          No se pudo cargar la vista previa de este archivo. Puede que la URL sea incorrecta o el archivo no esté disponible.
        </p>
        <Button asChild className="mt-4">
          <a href={url} download>
            Descargar Archivo
          </a>
        </Button>
      </div>
    )
  }

  if (fmt.startsWith("image/")) {
    return <img src={url} alt={asset.name} className="max-h-[80vh] w-auto rounded-lg" onError={() => setMediaError(true)} />
  }
  if (fmt.startsWith("video/")) {
    return (
      <video
        key={url}
        src={url}
        controls
        autoPlay
        className="max-h-[80vh] w-auto rounded-lg bg-black"
        onError={() => setMediaError(true)}
      />
    )
  }
  if (fmt.startsWith("audio/")) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
        <Music className="h-12 w-12 text-muted-foreground mb-4" />
        <audio controls src={url} className="w-full max-w-md" onError={() => setMediaError(true)} />
        <p className="text-sm text-muted-foreground mt-2">{asset.name}</p>
      </div>
    )
  }
  if (fmt === "application/pdf") {
    return <iframe src={url} className="w-full h-[80vh] border-0" onError={() => setMediaError(true)} />
  }

  return (
    <div className="text-center p-8 bg-muted rounded-lg">
      <h3 className="text-lg font-bold">Vista previa no disponible</h3>
      <p className="text-muted-foreground">No se puede mostrar una vista previa para este tipo de archivo.</p>
      <Button asChild className="mt-4">
        <a href={url} download>
          Descargar Archivo
        </a>
      </Button>
    </div>
  )
}

/* ------------------------- MAIN PAGE ------------------------- */

export default function ArtistAssetsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [artist, setArtist] = useState<any>(null)
  const [assets, setAssets] = useState<any[]>([])
  const [filteredAssets, setFilteredAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const categoryBorderColors: { [key: string]: string } = {
    "Musical Releases": "border-blue-500",
    "Social Media": "border-purple-500",
    "Press & Promotion": "border-green-500",
  }

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
            .or(`project_id.in.(${projectIds.join(",")}),project_id.is.null`)
            .order("created_at", { ascending: false })

          if (assetsError) {
            console.error("Error fetching assets", assetsError)
            setAssets([])
            setFilteredAssets([])
          } else {
            // 🔑 normalizar para asegurar file_url + format en todos
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

  const handlePreviewClick = (asset: any) => {
    // console.log("Preview clicked for asset:", asset)
    setSelectedAsset(asset)
    setIsModalOpen(true)
  }

  const handleCopyLink = (url: string) => {
    const u = url || ""
    navigator.clipboard
      .writeText(u)
      .then(() => {
        toast({ title: "Link Copied!", description: "Asset URL copied to clipboard." })
      })
      .catch(() => {
        toast({
          title: "Failed to Copy Link",
          description: "Could not copy asset URL to clipboard.",
          variant: "destructive",
        })
      })
  }

  const categories = ["Musical Releases", "Social Media", "Press & Promotion"]
  const types = [...new Set(assets.map((asset) => asset.type))].filter(Boolean)

  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href={`/artists/${params.id}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Artist
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Asset Management</h1>
                  <p className="text-muted-foreground">For {artist?.name || "..."}</p>
                </div>
              </div>
              <Link href={`/artists/${params.id}/assets/new`} className="w-full sm:w-auto">
                <Button className="flex items-center gap-2 w-full">
                  <Plus className="h-4 w-4" />
                  Upload Asset
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {isLoading ? (
            <AssetsSkeleton />
          ) : (
            <div className="space-y-6">
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
                    <div className="text-2xl font-bold">{assets.filter((a) => a.format?.startsWith("image/")).length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Videos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{assets.filter((a) => a.format?.startsWith("video/")).length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{assets.filter((a) => a.format === "application/pdf").length}</div>
                  </CardContent>
                </Card>
              </div>

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
                      <SelectTrigger className="w-full md:w-48">
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
                      <SelectTrigger className="w-full md:w-48">
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
                  const ext = getExt(url)
                  return (
                    <Card
                      key={asset.id}
                      className={`group overflow-hidden border-l-4 ${
                        categoryBorderColors[asset.category] || "border-gray-200"
                      } ${asset.is_featured ? "border-4 shadow-xl" : ""} hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                    >
                      <div className="aspect-square relative bg-muted cursor-pointer" onClick={() => handlePreviewClick(asset)}>
                        <AssetPreview asset={asset} />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                          <Eye className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            {asset.format || (ext ? `.${ext}` : "file")}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            {getCategoryIcon(asset.category)}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate">{asset.name}</h3>
                              <p className="text-xs text-muted-foreground">{asset.type}</p>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1 mt-2">
                            <p>Uploaded: {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : "—"}</p>
                          </div>
                          <div className="flex items-center gap-1 pt-2">
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handlePreviewClick(asset)}>
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                              <a href={url} download>
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
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
                        ? `It looks like ${artist.name} hasn\u2019t uploaded any assets yet. Time to get started!`
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
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-auto bg-transparent border-0 shadow-none">
          <DialogHeader>
            <DialogTitle>{selectedAsset?.name}</DialogTitle>
            <DialogDescription className="sr-only">{selectedAsset?.type} preview</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-center items-center">
            <LargeAssetPreview asset={selectedAsset} />
          </div>
          {selectedAsset && (
            <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4">
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                <a href={(selectedAsset.file_url || selectedAsset.url) ?? ""} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyLink((selectedAsset.file_url || selectedAsset.url) ?? "")}
                className="w-full sm:w-auto">
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
