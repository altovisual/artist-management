'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Music, Instagram, ImageIcon, Eye, Download, Copy, Video, FileText } from "lucide-react"
import Image from "next/image"

// --- Helper Functions for Asset Preview ---

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
  if (["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext)) return `image/${ext === "jpg" ? "jpeg" : ext}`
  if (ext === "svg") return "image/svg+xml"
  if (["mp4", "webm", "mov", "m4v", "ogv"].includes(ext)) return `video/${ext === "mov" ? "quicktime" : ext}`
  if (["ogg"].includes(ext)) return "audio/ogg"
  if (["mp3", "wav", "m4a", "aac", "flac"].includes(ext)) {
    if (ext === "mp3") return "audio/mpeg"
    return `audio/${ext}`
  }
  if (ext === "pdf") return "application/pdf"
  return "application/octet-stream"
}

const normalizeAsset = (a: any) => {
  const url = a?.url ?? ""
  const format = a?.format ?? guessFormatFromExt(getExt(url))
  return { ...a, url, format }
}

const LargeAssetPreview = ({ asset }: { asset: any }) => {
  const [mediaError, setMediaError] = useState(false)
  const fmt: string = asset?.format || ""
  const url: string = asset?.url || ""

  useEffect(() => {
    setMediaError(false)
  }, [asset?.id, url])

  if (!asset) return null

  if (mediaError) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <h3 className="text-lg font-bold">Error loading file</h3>
        <p className="text-muted-foreground">Could not load the preview for this file.</p>
        <Button asChild className="mt-4">
          <a href={url} download>
            Download File
          </a>
        </Button>
      </div>
    )
  }

  if (fmt.startsWith("image/")) {
    return <Image src={url} alt={asset.name} width={1000} height={1000} className="max-h-[80vh] w-auto rounded-lg" onError={() => setMediaError(true)} />
  }
  if (fmt.startsWith("video/")) {
    return <video key={url} src={url} controls autoPlay className="max-h-[80vh] w-auto rounded-lg bg-black" onError={() => setMediaError(true)} />
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
      <h3 className="text-lg font-bold">Preview not available</h3>
      <p className="text-muted-foreground">A preview cannot be shown for this file type.</p>
      <Button asChild className="mt-4">
        <a href={url} download>
          Download File
        </a>
      </Button>
    </div>
  )
}

// --- Main Component ---

export function AssetKitTab({ assets }: { assets: any[] }) {
  const { toast } = useToast()
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePreviewClick = (asset: any) => {
    const normalized = normalizeAsset(asset)
    setSelectedAsset(normalized)
    setIsModalOpen(true)
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link Copied!", description: "Asset URL copied to clipboard." })
    }).catch(() => {
      toast({ title: "Failed to Copy Link", variant: "destructive" })
    })
  }

  const assetsByCategory = {
    musicalReleases: assets.filter((asset) => asset.category === "Musical Releases"),
    socialMedia: assets.filter((asset) => asset.category === "Social Media"),
    pressPromotion: assets.filter((asset) => asset.category === "Press & Promotion"),
  }

  const renderAssetCard = (asset: any) => (
    <div key={asset.id} className="p-4 border rounded-lg">
      <div className="flex items-start gap-3">
        <Image src={asset.url || "/placeholder.svg"} alt={asset.name} width={48} height={48} className="rounded object-cover" />
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-medium text-sm truncate">{asset.name}</p>
          <p className="text-xs text-muted-foreground">{asset.type}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handlePreviewClick(asset)}>
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
          <a href={asset.url} download>
            <Download className="h-3 w-3 mr-1" />
            Download
          </a>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Music className="h-5 w-5" />Musical Releases</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {assetsByCategory.musicalReleases.length > 0 ? (
              assetsByCategory.musicalReleases.map(renderAssetCard)
            ) : (
              <p className="text-muted-foreground text-center py-4 text-sm">No musical release assets yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Instagram className="h-5 w-5" />Social Media</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {assetsByCategory.socialMedia.length > 0 ? (
              assetsByCategory.socialMedia.map(renderAssetCard)
            ) : (
              <p className="text-muted-foreground text-center py-4 text-sm">No social media assets yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />Press & Promotion</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {assetsByCategory.pressPromotion.length > 0 ? (
              assetsByCategory.pressPromotion.map(renderAssetCard)
            ) : (
              <p className="text-muted-foreground text-center py-4 text-sm">No press & promotion assets yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
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
                <a href={selectedAsset.url ?? ""} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleCopyLink(selectedAsset.url ?? "")} className="w-full sm:w-auto">
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
