'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Music, Instagram, ImageIcon, Eye, Download, Video, FileText, Trash2 } from "lucide-react"
import Image from "next/image"
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

// --- Helper Function to determine asset type ---
const getAssetPreviewIcon = (asset: any) => {
  const format = (asset?.format || "").toString().toLowerCase();

  if (format.startsWith("video/")) {
    return <Video className="w-8 h-8 text-muted-foreground" />;
  }
  if (format.startsWith("audio/")) {
    return <Music className="w-8 h-8 text-muted-foreground" />;
  }
  if (format === "application/pdf") {
    return <FileText className="w-8 h-8 text-muted-foreground" />;
  }
  // Default icon for images and other types
  return <ImageIcon className="w-8 h-8 text-muted-foreground" />;
};


// --- Main Component ---

export function AssetKitTab({ assets, onDelete }: { assets: any[], onDelete: (assetId: string) => void }) {
  const { toast } = useToast();
  const [assetToDelete, setAssetToDelete] = useState<any>(null);

  const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation(); // Prevent card click event
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
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
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

  const handleDeleteClick = (e: React.MouseEvent, asset: any) => {
    e.stopPropagation(); // Prevent card click event
    setAssetToDelete(asset);
  }

  const confirmDelete = () => {
    if (assetToDelete) {
      onDelete(assetToDelete.id);
      setAssetToDelete(null);
    }
  }

  const assetsByCategory = {
    musicalReleases: assets.filter((asset) => asset.category === "Musical Releases"),
    socialMedia: assets.filter((asset) => asset.category === "Social Media"),
    pressPromotion: assets.filter((asset) => asset.category === "Press & Promotion"),
  }

  const renderAssetCard = (asset: any) => {
    const url = asset.file_url || asset.url || "";
    const format = (asset?.format || "").toString().toLowerCase();
    const isImage = format.startsWith("image/");

    return (
      <div key={asset.id} className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
        <a href={url} target="_blank" rel="noopener noreferrer" className="block cursor-pointer" aria-label={`View ${asset.name}`}>
          <div className="aspect-square bg-muted/30 flex items-center justify-center relative">
            {isImage ? (
              <Image src={url} alt={asset.name} layout="fill" className="object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              getAssetPreviewIcon(asset)
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Eye className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm truncate" title={asset.name}>{asset.name}</h3>
            <p className="text-xs text-muted-foreground">{asset.type}</p>
          </div>
        </a>
        <div className="p-3 pt-0 flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleDownload(e, url, asset.name)} aria-label={`Download ${asset.name}`}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => handleDeleteClick(e, asset)} aria-label={`Delete ${asset.name}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>
    )
  }

  const renderEmptyState = (categoryName: string) => (
    <div className="text-center p-6 border-2 border-dashed rounded-lg col-span-full">
        <div className="mx-auto w-12 h-12 flex items-center justify-center bg-muted rounded-full mb-3">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">No assets in {categoryName} yet.</p>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base font-semibold"><Music className="h-5 w-5" />Musical Releases</CardTitle></CardHeader>
            <CardContent>
              {assetsByCategory.musicalReleases.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {assetsByCategory.musicalReleases.map(renderAssetCard)}
                </div>
              ) : (
                renderEmptyState("Musical Releases")
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base font-semibold"><Instagram className="h-5 w-5" />Social Media</CardTitle></CardHeader>
            <CardContent>
              {assetsByCategory.socialMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {assetsByCategory.socialMedia.map(renderAssetCard)}
                </div>
              ) : (
                renderEmptyState("Social Media")
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base font-semibold"><ImageIcon className="h-5 w-5" />Press & Promotion</CardTitle></CardHeader>
            <CardContent>
              {assetsByCategory.pressPromotion.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {assetsByCategory.pressPromotion.map(renderAssetCard)}
                </div>
              ) : (
                renderEmptyState("Press & Promotion")
              )}
            </CardContent>
          </Card>

        <AlertDialog open={!!assetToDelete} onOpenChange={(isOpen) => !isOpen && setAssetToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the asset &quot;<span className="font-semibold">{assetToDelete?.name}</span>&quot;.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}