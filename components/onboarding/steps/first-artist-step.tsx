"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, ChevronLeft, Music, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface FirstArtistStepProps {
  onNext: () => void;
  onBack: () => void;
}

const GENRES = [
  "Pop",
  "Rock",
  "Hip Hop",
  "R&B",
  "Electronic",
  "Latin",
  "Reggaeton",
  "Country",
  "Jazz",
  "Classical",
  "Indie",
  "Alternative",
  "Metal",
  "Punk",
  "Folk",
  "Blues",
  "Soul",
  "Funk",
  "Disco",
  "House",
  "Techno",
  "Trap",
  "Reggae",
  "Salsa",
  "Bachata",
  "Cumbia",
  "Otro",
];

const COUNTRIES = [
  "Argentina",
  "Bolivia",
  "Brasil",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Cuba",
  "Ecuador",
  "El Salvador",
  "España",
  "Estados Unidos",
  "Guatemala",
  "Honduras",
  "México",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Perú",
  "Puerto Rico",
  "República Dominicana",
  "Uruguay",
  "Venezuela",
  "Otro",
];

export function FirstArtistStep({ onNext, onBack }: FirstArtistStepProps) {
  const [loading, setLoading] = useState(false);
  const [skipArtist, setSkipArtist] = useState(false);
  const [artistData, setArtistData] = useState({
    name: "",
    genre: "",
    country: "",
  });
  const { toast } = useToast();
  const router = useRouter();

  const handleCreateArtist = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("artists").insert({
        name: artistData.name,
        genre: artistData.genre,
        country: artistData.country,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "¡Artista creado!",
        description: `${artistData.name} ha sido agregado exitosamente.`,
      });

      onNext();
    } catch (error) {
      console.error("Error creating artist:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el artista. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setSkipArtist(true);
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4">
          <Music className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Agrega tu Primer Artista</h2>
        <p className="text-muted-foreground">
          Comienza agregando un artista que gestionas o puedes hacerlo más tarde
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="artist_name">Nombre del Artista *</Label>
          <Input
            id="artist_name"
            placeholder="Ej: Bad Bunny"
            value={artistData.name}
            onChange={(e) =>
              setArtistData({ ...artistData, name: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="genre">Género Musical *</Label>
          <Select
            value={artistData.genre}
            onValueChange={(value) =>
              setArtistData({ ...artistData, genre: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un género" />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">País *</Label>
          <Select
            value={artistData.country}
            onValueChange={(value) =>
              setArtistData({ ...artistData, country: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un país" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Podrás agregar más información como biografía,
            redes sociales, y conectar con Spotify después.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            Saltar
          </Button>
          <Button
            onClick={handleCreateArtist}
            disabled={
              !artistData.name || !artistData.genre || !artistData.country || loading
            }
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {loading ? "Creando..." : "Crear Artista"}
          </Button>
        </div>
      </div>
    </div>
  );
}
