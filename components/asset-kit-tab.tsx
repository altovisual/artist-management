'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Music, Instagram, ImageIcon, Eye, Download, Video, FileText } from "lucide-react"
import Image from "next/image"

// --- Helper Function to determine asset type ---
const getAssetPreview = (asset: any) => {
  const url = asset?.file_url || asset?.url || "";
  const format = (asset?.format || "").toString().toLowerCase();
  const name = asset?.name || "";

  if (format.startsWith("image/")) {
    return <Image src={url} alt={name} width={48} height={48} className="rounded object-cover bg-muted" />;
  }
  if (format.startsWith("video/")) {
    return <div className="w-12 h-12 flex items-center justify-center bg-muted rounded"><Video className="h-6 w-6" /></div>;
  }
  if (format.startsWith("audio/")) {
    return <div className="w-12 h-12 flex items-center justify-center bg-muted rounded"><Music className="h-6 w-6" /></div>;
  }
  if (format === "application/pdf") {
    return <div className="w-12 h-12 flex items-center justify-center bg-muted rounded"><FileText className="h-6 w-6" /></div>;
  }
  return <div className="w-12 h-12 flex items-center justify-center bg-muted rounded"><ImageIcon className="h-6 w-6" /></div>;
};


// --- Main Component ---

export function AssetKitTab({ assets }: { assets: any[] }) {
  const { toast } = useToast();

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

  const assetsByCategory = {
    musicalReleases: assets.filter((asset) => asset.category === "Musical Releases"),
    socialMedia: assets.filter((asset) => asset.category === "Social Media"),
    pressPromotion: assets.filter((asset) => asset.category === "Press & Promotion"),
  }

  const renderAssetCard = (asset: any) => {
    const url = asset.file_url || asset.url || "";
    return (
      <div key={asset.id} className="p-4 border rounded-lg">
        <div className="flex items-start gap-3">
          {getAssetPreview(asset)}
          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-medium text-sm truncate" title={asset.name}>{asset.name}</p>
            <p className="text-xs text-muted-foreground">{asset.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3">
          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Eye className="h-3 w-3 mr-1" />
              View
            </a>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handleDownload(url, asset.name)}>
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
    )
  }

  return (
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
  )
}