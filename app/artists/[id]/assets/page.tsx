"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Upload, Eye, Download, Edit, Trash2, Music, Instagram, ImageIcon, FileText, Video } from "lucide-react"
import Link from "next/link"
import { AssetsSkeleton } from "./assets-skeleton"

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
  if (asset.format?.startsWith("image/")) {
    return <img src={asset.file_url} alt={asset.name} className="w-full h-full object-cover" />
  }
  if (asset.format?.startsWith("video/")) {
    return <div className="w-full h-full bg-black flex items-center justify-center"><Video className="h-12 w-12 text-white" /></div>
  }
  if (asset.format === "application/pdf") {
    return <div className="w-full h-full bg-muted flex items-center justify-center"><FileText className="h-12 w-12 text-muted-foreground" /></div>
  }
  return <div className="w-full h-full bg-muted flex items-center justify-center"><ImageIcon className="h-12 w-12 text-muted-foreground" /></div>
}

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

      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("*")
        .eq("artist_id", artistId)
        .order("created_at", { ascending: false })

      if (assetsError) {
        console.error("Error fetching assets", assetsError)
      } else {
        setAssets(assetsData)
        setFilteredAssets(assetsData)
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
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.type.toLowerCase().includes(searchTerm.toLowerCase()),
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
  const types = [...new Set(assets.map((asset) => asset.type))]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
            <Link href={`/artists/${params.id}/assets/new`}>
              <Button className="flex items-center gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <div className="text-2xl font-bold">
                    {assets.filter((a) => a.format?.startsWith("image/")).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {assets.filter((a) => a.format?.startsWith("video/")).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {assets.filter((a) => a.format === "application/pdf").length}
                  </div>
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
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="overflow-hidden">
                  <div className="aspect-square relative bg-muted">
                    <AssetPreview asset={asset} />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {asset.format}
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
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          {(asset.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p>Uploaded: {new Date(asset.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1 pt-2">
                        <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                          <a href={asset.file_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                           <a href={asset.file_url} download>
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAssets.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No assets found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || categoryFilter !== "all" || typeFilter !== "all"
                      ? "Try adjusting your filters or search terms."
                      : "Start by uploading your first asset."}
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
  )
}