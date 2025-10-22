"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, ChevronLeft, Upload, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProfileStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ProfileStep({ onNext, onBack }: ProfileStepProps) {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    full_name: "",
    role: "",
    company: "",
    bio: "",
    avatar_url: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserData({
            full_name: profile.full_name || "",
            role: profile.role || "",
            company: profile.company || "",
            bio: profile.bio || "",
            avatar_url: profile.avatar_url || "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...userData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido guardada exitosamente.",
      });

      onNext();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar tu perfil. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!userData.full_name) return "U";
    return userData.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Configura tu Perfil</h2>
        <p className="text-muted-foreground">
          Cuéntanos un poco sobre ti para personalizar tu experiencia
        </p>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={userData.avatar_url} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Subir Foto
        </Button>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nombre Completo *</Label>
          <Input
            id="full_name"
            placeholder="Tu nombre completo"
            value={userData.full_name}
            onChange={(e) =>
              setUserData({ ...userData, full_name: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
            <Select
              value={userData.role}
              onValueChange={(value) =>
                setUserData({ ...userData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="artist">Artista</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="producer">Productor</SelectItem>
                <SelectItem value="label">Sello Discográfico</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Compañía/Sello (Opcional)</Label>
            <Input
              id="company"
              placeholder="Nombre de tu compañía"
              value={userData.company}
              onChange={(e) =>
                setUserData({ ...userData, company: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio (Opcional)</Label>
          <Textarea
            id="bio"
            placeholder="Cuéntanos sobre ti y tu experiencia en la industria musical..."
            rows={4}
            value={userData.bio}
            onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button
          onClick={handleSave}
          disabled={!userData.full_name || !userData.role || loading}
          className="gap-2"
        >
          {loading ? "Guardando..." : "Continuar"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
