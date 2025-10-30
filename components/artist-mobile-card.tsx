// components/artist-mobile-card.tsx
"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { Eye, Edit, ImageIcon, Users, Music, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

type Artist = {
  id: string | number
  name: string
  genre?: string
  country?: string
  profile_image?: string | null
  social_accounts?: any[]
  distribution_accounts?: any[]
  assetCount?: number
  created_at?: string
}

type ArtistMobileCardProps = {
  artist: Artist
  onDelete?: (artistId: string | number) => void
}

export function ArtistMobileCard({ artist, onDelete }: ArtistMobileCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const initials =
    (artist.name || "")
      .split(" ")
      .map((n) => n[0])
      .join("") || "AR"

  const socialAccountsCount = artist.social_accounts?.length ?? 0
  const distributionAccountsCount = artist.distribution_accounts?.length ?? 0

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/artists/${artist.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete artist');
      }

      toast.success('Artista eliminado', {
        description: `${artist.name} ha sido eliminado correctamente.`
      });

      // Llamar al callback si existe
      if (onDelete) {
        onDelete(artist.id);
      }
    } catch (error: any) {
      console.error('Error deleting artist:', error);
      toast.error('Error al eliminar', {
        description: error.message || 'No se pudo eliminar el artista.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={artist.profile_image || "/placeholder.svg"} alt={artist.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{artist.name}</div>
            <div className="text-sm text-muted-foreground">
              {artist.genre || "—"} · {artist.country || "—"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm text-center">
          <div className="flex flex-col items-center">
            <dt className="text-sm font-medium text-muted-foreground">Social</dt>
            <dd className="flex items-center gap-1 font-semibold mt-1">
              <Users className="h-4 w-4 text-primary" />
              {socialAccountsCount}
            </dd>
          </div>
          <div className="flex flex-col items-center">
            <dt className="text-sm font-medium text-muted-foreground">Distrib.</dt>
            <dd className="flex items-center gap-1 font-semibold mt-1">
              <Music className="h-4 w-4 text-primary" />
              {distributionAccountsCount}
            </dd>
          </div>
          <div className="flex flex-col items-center">
            <dt className="text-sm font-medium text-muted-foreground">Assets</dt>
            <dd className="flex items-center gap-1 font-semibold mt-1">
              <ImageIcon className="h-4 w-4 text-primary" />
              {artist.assetCount ?? 0}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/artists/${artist.id}`} className="flex-1">
            <Button variant="outline" className="w-full flex items-center gap-1">
              <Eye className="h-4 w-4" /> View
            </Button>
          </Link>
          <Link href={`/artists/${artist.id}/edit`} className="flex-1">
            <Button variant="outline" className="w-full flex items-center gap-1">
              <Edit className="h-4 w-4" /> Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader className="space-y-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-destructive/10">
                  <Trash2 className="h-6 w-6 text-destructive" />
                </div>
                <AlertDialogTitle className="text-center text-xl">
                  ¿Eliminar artista?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  <div className="space-y-2">
                    <p>Esta acción no se puede deshacer.</p>
                    <p className="font-medium text-foreground">
                      Se eliminará permanentemente el perfil de <span className="font-bold">{artist.name}</span> y todos sus datos asociados.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <AlertDialogCancel className="w-full sm:w-auto">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
