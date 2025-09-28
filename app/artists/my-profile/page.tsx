'use client'

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProfileSkeleton } from "./profile-skeleton"
import { DatePickerField } from "@/components/ui/datepicker"

const extractSpotifyId = (urlOrId: string): string | null => {
  const trimmedUrl = urlOrId.trim()
  if (!trimmedUrl) return null
  try {
    if (trimmedUrl.includes('spotify.com')) {
      const url = new URL(trimmedUrl)
      const pathParts = url.pathname.split('/')
      const artistId = pathParts.find(part => part.length === 22)
      return artistId || null
    }
    if (trimmedUrl.startsWith('spotify:artist:')) {
      return trimmedUrl.split(':')[2]
    }
    return trimmedUrl
  } catch (error) {
    console.error("Invalid Spotify URL, returning original value", error)
    return urlOrId
  }
}

const extractMusoAiId = (url: string): string | null => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return null;
  try {
    if (trimmedUrl.includes('muso.ai')) {
      const urlParts = trimmedUrl.split('/');
      const profileIndex = urlParts.indexOf('profile');
      if (profileIndex !== -1 && urlParts.length > profileIndex + 1) {
        return urlParts[profileIndex + 1];
      }
    }
    if (trimmedUrl.length === 36) return trimmedUrl;
    return null;
  } catch (error) {
    console.error("Invalid Muso.AI URL", error);
    return null;
  }
};

export default function MyProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [artist, setArtist] = useState<any>(null)
  const supabase = createClient()

  // Form state
  const [name, setName] = useState("")
  const [genre, setGenre] = useState("")
  const [location, setLocation] = useState("")
  const [bio, setBio] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>()
  const [spotifyInput, setSpotifyInput] = useState("")
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null)
  const [idNumber, setIdNumber] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [bankInfo, setBankInfo] = useState("")
  const [managementEntity, setManagementEntity] = useState("")
  const [ipi, setIpi] = useState("")

  // Muso.AI state
  const [musoAiInput, setMusoAiInput] = useState("");
  const [isLinkingMuso, setIsLinkingMuso] = useState(false);

  const fetchArtistData = useCallback(async () => {
    setIsLoadingData(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      const { data: artistData, error: artistError } = await supabase
        .from("artists")
        .select(`*`)
        .eq("user_id", user.id)
        .single();

      if (artistError || !artistData) {
        router.push("/artists/onboarding");
        return;
      }

      setArtist(artistData);
      setName(artistData.name || "");
      setGenre(artistData.genre || "");
      setLocation(artistData.country || "");
      setBio(artistData.bio || "");
      setFirstName(artistData.first_name || "");
      setLastName(artistData.last_name || "");
      if (artistData.date_of_birth) {
        setDateOfBirth(new Date(artistData.date_of_birth));
      }
      setSpotifyInput(artistData.spotify_artist_id || "");
      setIdNumber(artistData.id_number || "");
      setAddress(artistData.address || "");
      setPhone(artistData.phone || "");
      setBankInfo(artistData.bank_info ? JSON.stringify(artistData.bank_info, null, 2) : "");
      setManagementEntity(artistData.management_entity || "");
      setIpi(artistData.ipi || "");

      const { data: musoProfile } = await supabase
        .from('muso_ai_profiles')
        .select('muso_ai_profile_id')
        .eq('artist_id', artistData.id)
        .single();

      if (musoProfile) {
        setMusoAiInput(`https://credits.muso.ai/profile/${musoProfile.muso_ai_profile_id}`);
      }

    } catch (error) {
      console.error("Error loading artist data:", error);
      toast({ title: "Error", description: "Failed to load artist data.", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  }, [router, supabase, toast]);

  useEffect(() => {
    fetchArtistData();
  }, [fetchArtistData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!artist?.id) {
      toast({ title: "Error", description: "Artist ID not found.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const finalSpotifyId = extractSpotifyId(spotifyInput);

    let parsedBankInfo = null;
    if (bankInfo) {
      try {
        parsedBankInfo = JSON.parse(bankInfo);
      } catch (jsonError) {
        toast({ title: "Error", description: "Bank Info must be valid JSON.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }

    try {
      let imageUrl: string | undefined = artist.profile_image;

      if (newProfileImage) {
        const fileName = `${Date.now()}_${newProfileImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("artist-profiles").upload(fileName, newProfileImage);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("artist-profiles").getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      }

      const updateData: any = {
        name,
        genre,
        country: location,
        bio,
        profile_image: imageUrl,
        spotify_artist_id: finalSpotifyId,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth ? dateOfBirth.toISOString() : null,
        id_number: idNumber || null,
        address: address || null,
        phone: phone || null,
        bank_info: parsedBankInfo,
        management_entity: managementEntity || null,
        ipi: ipi || null,
      };

      const { error: artistError } = await supabase.from("artists").update(updateData).eq("id", artist.id);
      if (artistError) throw artistError;

      toast({ title: "Success!", description: "Profile updated successfully.", });
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Error updating profile:", JSON.stringify(error, null, 2));
      if (error.code === '23505') {
        toast({ title: "Error", description: "Spotify Artist ID is already in use by another artist.", variant: "destructive" });
      } else {
        toast({ title: "Error updating profile", description: error.message || "An unknown error occurred", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkMusoProfile = async () => {
    if (!artist?.id) {
      toast({ title: "Error", description: "Artist data not loaded yet.", variant: "destructive" });
      return;
    }

    const musoAiProfileId = extractMusoAiId(musoAiInput);

    if (!musoAiProfileId) {
      toast({ title: "Invalid URL", description: "Please enter a valid Muso.AI profile URL.", variant: "destructive" });
      return;
    }

    setIsLinkingMuso(true);
    try {
      const response = await fetch('/api/muso-ai/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          artistId: artist.id, 
          musoAiProfileId, 
          popularity: 0
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link profile.');
      }

      toast({ title: "Success!", description: "Muso.AI profile linked successfully." });
      await fetchArtistData();

    } catch (error: any) {
      toast({ title: "Error Linking Profile", description: error.message, variant: "destructive" });
    } finally {
      setIsLinkingMuso(false);
    }
  };

  const PageContent = () => {
    if (isLoadingData) {
      return <ProfileSkeleton />;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Artist Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Your last name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                  <DatePickerField date={dateOfBirth} onDateChange={setDateOfBirth} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre *</Label>
                  <Select value={genre} onValueChange={setGenre} required>
                    <SelectTrigger id="genre"><SelectValue placeholder="Select genre" /></SelectTrigger>
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
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spotify-id">Spotify Artist URL or ID</Label>
                  <Input id="spotify-id" value={spotifyInput} onChange={(e) => setSpotifyInput(e.target.value)} placeholder="Paste Spotify URL, URI, or ID" />
                  <p className="text-sm text-muted-foreground">
                    You can paste the full URL from the share button on your Spotify artist profile.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Identification number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managementEntity">Management Entity</Label>
                  <Input id="managementEntity" value={managementEntity} onChange={(e) => setManagementEntity(e.target.value)} placeholder="e.g., PRO, publisher" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ipi">IPI Number</Label>
                  <Input id="ipi" value={ipi} onChange={(e) => setIpi(e.target.value)} placeholder="IPI number (if applicable)" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about your artist journey..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankInfo">Bank Info (JSON)</Label>
                <Textarea id="bankInfo" value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} placeholder={`{
  "bank_name": "Global Bank",
  "account_holder": "Your Name",
  "account_number": "1234567890"
}`} rows={6} />
              </div>
              <div className="space-y-2">
                  <Label>Profile Image</Label>
                  {artist?.profile_image && <Image src={artist.profile_image} alt={name} width={96} height={96} className="rounded-full object-cover"/>}
                  <Input id="profile-image" type="file" accept="image/*" onChange={(e) => setNewProfileImage(e.target.files ? e.target.files[0] : null)} />
                  <p className="text-sm text-muted-foreground">Upload a new image to replace the current one.</p>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Integrations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="muso-ai-url">Muso.AI Profile URL</Label>
                <Input id="muso-ai-url" value={musoAiInput} onChange={(e) => setMusoAiInput(e.target.value)} placeholder="Paste your Muso.AI profile URL" />
                 <p className="text-sm text-muted-foreground">
                    Example: https://credits.muso.ai/profile/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                  </p>
              </div>
              <Button type="button" onClick={handleLinkMusoProfile} disabled={isLinkingMuso}>
                {isLinkingMuso ? 'Linking...' : 'Link Muso.AI Profile'}
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button type="submit" disabled={isLoading}>{isLoading ? "Updating..." : "Update Profile"}</Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <PageContent />
    </DashboardLayout>
  );
}
