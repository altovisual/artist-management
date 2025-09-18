"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save } from "lucide-react" // Only Save icon needed
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { AnimatedTitle } from '@/components/animated-title';
import { DatePickerField } from "@/components/ui/datepicker"

// Helper function to extract Spotify Artist ID from URL
const extractSpotifyArtistId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const artistIndex = pathSegments.indexOf('artist');
    if (artistIndex > -1 && pathSegments.length > artistIndex + 1) {
      return pathSegments[artistIndex + 1];
    }
  } catch (error) {
    console.error("Invalid Spotify URL:", error);
  }
  return null;
};

export default function ArtistOnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Basic artist info
  const [name, setName] = useState("")
  const [genre, setGenre] = useState("")
  const [location, setLocation] = useState("")
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [spotifyUrl, setSpotifyUrl] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>()

  // State to hold the authenticated user's ID
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // If no user is logged in, redirect to login page
        router.push("/auth/login");
      }
    };
    getUserId();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!userId) {
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      let imageUrl: string | null = null
      if (profileImage) {
        // Ensure the bucket exists and is public.
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('artist-profiles');
        if (bucketError && bucketError.message.includes('not found')) {
            await supabase.storage.createBucket('artist-profiles', { public: true });
        } else if (bucketError) {
            throw bucketError;
        }

        const fileName = `${Date.now()}_${profileImage.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("artist-profiles")
          .upload(fileName, profileImage)

        if (uploadError) {
          throw uploadError
        }

        const { data: urlData } = supabase.storage.from("artist-profiles").getPublicUrl(uploadData.path)
        imageUrl = urlData.publicUrl
      }

      // Insert artist with user_id
      const spotifyArtistId = spotifyUrl ? extractSpotifyArtistId(spotifyUrl) : null;

      const { data: artistData, error: artistError } = await supabase
        .from("artists")
        .insert({
          user_id: userId, // Link to the authenticated user
          name,
          genre,
          country: location,
          bio,
          profile_image: imageUrl,
          total_streams: 0, // Default values
          monthly_listeners: 0, // Default values
          spotify_artist_id: spotifyArtistId, // Add Spotify Artist ID
          date_of_birth: dateOfBirth,
        })
        .select()
        .single()

      if (artistError) throw artistError

      // If Spotify URL is provided, save it to social_accounts
      if (spotifyUrl && artistData) {
        const { error: socialError } = await supabase
          .from("social_accounts")
          .insert({
            artist_id: artistData.id,
            platform: "spotify",
            url: spotifyUrl,
          });
        if (socialError) {
          console.error("Error saving Spotify social account:", socialError);
          // Decide whether to throw this error or just log it. For now, log.
        }
      }

      toast({ title: "Success!", description: "Artist profile created successfully." })
      router.push("/artists/my-profile") // Redirect to the new profile page
    } catch (error) {
      console.error("Error creating artist profile:", error)
      toast({
        title: "Error",
        description: "Failed to create artist profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div>
              <AnimatedTitle text="Create Your Artist Profile" level={1} className="text-2xl font-bold" />
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Artist Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your artist name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre *</Label>
                  <Select value={genre} onValueChange={setGenre} required>
                    <SelectTrigger id="genre">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pop">Pop</SelectItem>
                      <SelectItem value="Rock">Rock</SelectItem>
                      <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                      <SelectItem value="R&B">R&B</SelectItem>
                      <SelectItem value="Electronic">Electronic</SelectItem>
                      <SelectItem value="Country">Country</SelectItem>
                      <SelectItem value="Jazz">Jazz</SelectItem>
                      <SelectItem value="Classical">Classical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                  <DatePickerField date={dateOfBirth} onDateChange={setDateOfBirth} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spotify-url">Spotify Profile URL</Label>
                  <Input
                    id="spotify-url"
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    placeholder="e.g., https://open.spotify.com/artist/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-image">Profile Image</Label>
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileImage(e.target.files ? e.target.files[0] : null)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself as an artist..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Button type="submit" disabled={isLoading || !userId}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Creating Profile..." : "Create Profile"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}