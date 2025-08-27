"use client"

import React, { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Save, X } from "lucide-react"
import Link from "next/link"

const assetCategories = {
  "Musical Releases": [
    "Cover Art",
    "Spotify Canvas",
    "Apple Music Banner",
    "Lyric Video",
    "Music Video",
    "Visualizer",
    "Album Artwork",
  ],
  "Social Media": [
    "Instagram Post",
    "Instagram Story",
    "Instagram Reel Cover",
    "YouTube Thumbnail",
    "Twitter Banner",
    "Facebook Cover",
    "TikTok Cover",
    "Profile Avatar",
  ],
  "Press & Promotion": [
    "Press Photo",
    "Concert Poster",
    "Event Flyer",
    "EPK Design",
    "Press Kit",
    "Promotional Banner",
    "Merchandise Design",
  ],
}

export default function NewAssetPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    type: "",
    tags: "",
    file: null as File | null,
    externalUrl: "", // Nuevo campo para el link externo
  })
  const [uploadOption, setUploadOption] = useState<'file' | 'external'>('file'); // 'file' o 'external'
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [projectIdToUse, setProjectIdToUse] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectId = async () => {
      const artistId = params.id as string;
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id')
        .eq('artist_id', artistId)
        .limit(1);

      if (error) {
        console.error("Error fetching project ID:", error);
        // Handle error, maybe set an error state
        return;
      }

      if (projects && projects.length > 0) {
        setProjectIdToUse(projects[0].id);
      } else {
        // No projects found for this artist. Handle this case.
        // For now, we'll leave projectIdToUse as null, which will cause an insert error.
        console.warn("No projects found for this artist. Asset insertion might fail.");
      }
    };

    fetchProjectId();
  }, [params.id, supabase]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "category" && { type: "" }), // Reset type when category changes
    }))
  }

  const handleFileChange = (file: File) => {
    setFormData((prev) => ({ ...prev, file }))

    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones: requiere nombre, categoría, tipo, Y (archivo O enlace externo)
    if (!formData.name || !formData.category || !formData.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (uploadOption === 'file' && !formData.file) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    if (uploadOption === 'external' && !formData.externalUrl) {
      toast({
        title: "Error",
        description: "Please provide an external link.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true)

    try {
      let assetUrl = "";
      if (uploadOption === 'file' && formData.file) {
        const fileExt = formData.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `assets/${params.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("artist-assets")
          .upload(filePath, formData.file);

        if (uploadError) {
          console.log("Supabase upload error:", JSON.stringify(uploadError, null, 2));
          throw new Error(JSON.stringify(uploadError, null, 2));
        }

        const { data: { publicUrl } } = supabase.storage.from("artist-assets").getPublicUrl(filePath);
        assetUrl = publicUrl;
      } else if (uploadOption === 'external' && formData.externalUrl) {
        assetUrl = formData.externalUrl;
      }

      if (!projectIdToUse) {
        toast({
          title: "Error",
          description: "No project found for this artist. Please create a project first.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("assets").insert({
        artist_id: params.id,
        project_id: projectIdToUse,
        name: formData.name,
        category: formData.category,
        type: formData.type,
        url: assetUrl, // Usar assetUrl (puede ser publicUrl o externalUrl)
        external_url: uploadOption === 'external' ? formData.externalUrl : null, // Guardar external_url si aplica
      })

      if (insertError) {
        console.log("Supabase insert error:", JSON.stringify(insertError, null, 2));
        throw insertError;
      }

      toast({
        title: "Success!",
        description: "Asset uploaded successfully.",
      })

      router.push(`/artists/${params.id}/assets`)
    } catch (error) {
      console.error("Error uploading asset:", error)
      toast({
        title: "Error",
        description: "Failed to upload asset. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const availableTypes = formData.category ? assetCategories[formData.category as keyof typeof assetCategories] : []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/artists/${params.id}/assets`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Assets
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Upload New Asset</h1>
                <p className="text-muted-foreground">Add a new visual asset to the artist's kit</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex justify-center gap-4">
                  <Button
                    type="button"
                    variant={uploadOption === 'file' ? 'default' : 'outline'}
                    onClick={() => setUploadOption('file')}
                  >
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={uploadOption === 'external' ? 'default' : 'outline'}
                    onClick={() => setUploadOption('external')}
                  >
                    Use External Link
                  </Button>
                </div>

                {uploadOption === 'file' ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {preview ? (
                      <div className="space-y-4">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt="Preview"
                          className="max-w-full max-h-48 mx-auto rounded"
                        />
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-sm font-medium">{formData.file?.name}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, file: null }));
                              setPreview(null);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-lg font-medium">Drop your file here</p>
                          <p className="text-muted-foreground">or click to browse</p>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*,video/*,.pdf,audio/mpeg,audio/wav"
                          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="cursor-pointer bg-transparent"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="externalUrl">External Link</Label>
                    <Input
                      id="externalUrl"
                      type="url"
                      value={formData.externalUrl}
                      onChange={(e) => handleInputChange("externalUrl", e.target.value)}
                      placeholder="https://www.dropbox.com/s/your-asset.mp3"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Provide a direct link to your asset stored externally (e.g., Dropbox, Google Drive).
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: JPG, PNG, GIF, MP4, MOV, PDF, MP3, WAV. Max size: 50MB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(assetCategories).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Asset Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange("type", value)}
                      disabled={!formData.category}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Asset Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Corazón Libre - Single Cover"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description of the asset..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    placeholder="e.g., single, cover, artwork, 2024"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate tags with commas to help organize and search assets
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                className="flex items-center gap-2"
                disabled={!formData.file || !formData.name || !formData.category || !formData.type || isLoading}
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Uploading..." : "Save Asset"}
              </Button>
              <Link href={`/artists/${params.id}/assets`}>
                <Button type="button" variant="outline" className="bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}