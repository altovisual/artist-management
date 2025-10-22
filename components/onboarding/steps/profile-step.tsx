"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, ChevronLeft, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProfileStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ProfileStep({ onNext, onBack }: ProfileStepProps) {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    avatar_url: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  // Save to localStorage whenever userData changes
  useEffect(() => {
    if (userData.username || userData.avatar_url) {
      localStorage.setItem("onboarding_profile_data", JSON.stringify(userData));
    }
  }, [userData]);

  const loadUserData = async () => {
    try {
      // First, try to load from localStorage
      const savedData = localStorage.getItem("onboarding_profile_data");
      if (savedData) {
        setUserData(JSON.parse(savedData));
      }

      // Then load from database
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          setUserData({
            username: profile.username || "",
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

      // Intentar guardar el perfil, pero continuar incluso si falla
      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: user.id,
          username: userData.username,
          avatar_url: userData.avatar_url,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.warn("Could not save profile (table may not exist yet):", error);
        // Continuar de todos modos
      } else {
        toast({
          title: "Perfil actualizado",
          description: "Tu información ha sido guardada exitosamente.",
        });
      }

      onNext();
    } catch (error) {
      console.error("Error saving profile:", error);
      // Continuar de todos modos para no bloquear el onboarding
      onNext();
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "La imagen debe ser menor a 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo inválido",
        description: "Solo se permiten imágenes (JPG, PNG, GIF, WEBP).",
        variant: "destructive",
      });
      return;
    }

    // Create preview URL immediately
    const previewUrl = URL.createObjectURL(file);
    setUserData({ ...userData, avatar_url: previewUrl });

    try {
      const supabase = createClient();
      
      let user;
      try {
        const { data } = await supabase.auth.getUser();
        user = data.user;
      } catch (authError) {
        console.warn("Auth error (possibly browser extension):", authError);
        // Try alternative method
        const { data: sessionData } = await supabase.auth.getSession();
        user = sessionData?.session?.user;
      }

      if (!user) {
        throw new Error("No se pudo obtener el usuario. Intenta recargar la página.");
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Revert to no avatar on error
        URL.revokeObjectURL(previewUrl);
        setUserData({ ...userData, avatar_url: "" });
        throw uploadError;
      }

      // Get public URL and replace preview
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Revoke the preview URL to free memory
      URL.revokeObjectURL(previewUrl);
      
      setUserData({ ...userData, avatar_url: publicUrl });

      toast({
        title: "Foto subida",
        description: "Tu foto de perfil ha sido actualizada.",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      
      // Specific error messages
      let errorMessage = "No se pudo subir la foto. Intenta nuevamente.";
      
      if (error?.message?.includes("Bucket not found")) {
        errorMessage = "El sistema de almacenamiento no está configurado. Contacta al administrador.";
      } else if (error?.message?.includes("not allowed")) {
        errorMessage = "No tienes permisos para subir archivos.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getInitials = () => {
    if (!userData.username) return "U";
    return userData.username.slice(0, 2).toUpperCase();
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
        <label htmlFor="avatar-upload">
          <Button variant="outline" size="sm" className="gap-2" type="button" asChild>
            <span className="cursor-pointer">
              <Upload className="w-4 h-4" />
              Subir Foto
            </span>
          </Button>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
      </div>

      {/* Form */}
      <div className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="username">Nombre de Usuario *</Label>
          <Input
            id="username"
            placeholder="Ej: juan_manager"
            value={userData.username}
            onChange={(e) =>
              setUserData({ ...userData, username: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Este será tu identificador en la plataforma
          </p>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Podrás completar más información de tu perfil
            desde la sección de Configuración después.
          </p>
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
          disabled={!userData.username || loading}
          className="gap-2"
        >
          {loading ? "Guardando..." : "Continuar"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
