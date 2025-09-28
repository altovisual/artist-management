'use client'

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, User, Users, Music, Settings, Phone } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { CredentialManager } from "@/components/credential-manager"
import { Separator } from "@/components/ui/separator"
import { encrypt } from "@/lib/crypto"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AnimatedTitle } from "@/components/animated-title"
import { DatePickerField } from "@/components/ui/datepicker"
import { EditArtistSkeleton } from "./edit-artist-skeleton"

// Modern form components
import { FormLayout } from "@/components/forms/form-layout"
import { FormSection } from "@/components/forms/form-section"
import { FormField } from "@/components/forms/form-field"
import { FormHeader } from "@/components/forms/form-header"
import { ImageUpload } from "@/components/forms/image-upload"

// Helper function to extract Spotify ID from URL
const extractSpotifyId = (urlOrId: string): string | null => {
  const trimmedUrl = urlOrId.trim()
  if (!trimmedUrl) return null
  try {
    if (trimmedUrl.includes('spotify.com')) {
      const url = new URL(trimmedUrl)
      const pathParts = url.pathname.split('/')
      const artistId = pathParts.find(part => part.length === 22) // Spotify IDs are 22 chars
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

interface SocialAccount {
  id: string | null
  platform: string
  username: string
  handle: string
  url: string
  followers: string
  email?: string
  password?: string
  newPassword?: string
}

interface DistributionAccount {
  id: string | null
  distributor: string
  service: string
  monthly_listeners: string
  username: string
  email: string
  notes: string
  url: string
  account_id: string
  password?: string
  newPassword?: string
}

export default function EditArtistPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const supabase = createClient()

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Artist data state
  const [artist, setArtist] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

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
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [distributionAccounts, setDistributionAccounts] = useState<DistributionAccount[]>([])

  // New participant-related fields
  const [idNumber, setIdNumber] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [bankInfo, setBankInfo] = useState("") // Will be JSON string
  const [managementEntity, setManagementEntity] = useState("")
  const [ipi, setIpi] = useState("")

  // State to track original IDs for deletion
  const [initialSocialAccountIds, setInitialSocialAccountIds] = useState<string[]>([]);
  const [initialDistributionAccountIds, setInitialDistributionAccountIds] = useState<string[]>([]);

  const addSocialAccount = () => {
    setSocialAccounts([...socialAccounts, { id: null, platform: "", username: "", handle: "", url: "", followers: "", email: "" }]);
  };

  const removeSocialAccount = (indexToRemove: number) => {
    setSocialAccounts(socialAccounts.filter((_, index) => index !== indexToRemove));
  };

  const updateSocialAccount = (index: number, field: keyof SocialAccount, value: string) => {
    const updatedAccounts = [...socialAccounts];
    (updatedAccounts[index] as any)[field] = value;
    setSocialAccounts(updatedAccounts);
  };

  const addDistributionAccount = () => {
    setDistributionAccounts([...distributionAccounts, { id: null, distributor: "", service: "", monthly_listeners: "", username: "", email: "", notes: "", url: "", account_id: "" }]);
  };

  const removeDistributionAccount = (indexToRemove: number) => {
    setDistributionAccounts(distributionAccounts.filter((_, index) => index !== indexToRemove));
  };

  const updateDistributionAccount = (index: number, field: keyof DistributionAccount, value: string) => {
    const updatedAccounts = [...distributionAccounts];
    (updatedAccounts[index] as any)[field] = value;
    setDistributionAccounts(updatedAccounts);
  };

  useEffect(() => {
    const fetchArtistData = async () => {
      const artistId = params.id as string
      if (!artistId) {
        setIsLoadingData(false)
        return
      }

      setIsLoadingData(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setCurrentUserId(user.id)
        }

        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select(`*, social_accounts (*), distribution_accounts (*)`)
          .eq("id", artistId)
          .single()

        if (artistError || !artistData) {
          toast({ title: "Error", description: "Failed to load artist data.", variant: "destructive" })
          router.push("/dashboard")
          return
        }

        setArtist(artistData)
        setName(artistData.name || "")
        setGenre(artistData.genre || "")
        setLocation(artistData.country || "")
        setBio(artistData.bio || "")
        setFirstName(artistData.first_name || "")
        setLastName(artistData.last_name || "")
        if (artistData.date_of_birth) {
          setDateOfBirth(new Date(artistData.date_of_birth))
        }
        setSpotifyInput(artistData.spotify_artist_id || "")

        // Set new participant fields
        setIdNumber(artistData.id_number || "");
        setAddress(artistData.address || "");
        setPhone(artistData.phone || "");
        setBankInfo(artistData.bank_info ? JSON.stringify(artistData.bank_info, null, 2) : "");
        setManagementEntity(artistData.management_entity || "");
        setIpi(artistData.ipi || "");

        const loadedSocialAccounts = artistData.social_accounts || [];
        setSocialAccounts(loadedSocialAccounts);
        setInitialSocialAccountIds(loadedSocialAccounts.map((a: any) => a.id).filter(Boolean));

        const loadedDistributionAccounts = artistData.distribution_accounts || [];
        setDistributionAccounts(loadedDistributionAccounts);
        setInitialDistributionAccountIds(loadedDistributionAccounts.map((a: any) => a.id).filter(Boolean));

      } catch (error) {
        toast({ title: "Error", description: "Failed to load artist data.", variant: "destructive" })
        router.push("/dashboard")
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchArtistData()
  }, [params.id, router, supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const finalSpotifyId = extractSpotifyId(spotifyInput)
    const artistId = params.id as string

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
      let imageUrl: string | undefined = artist.profile_image

      if (newProfileImage) {
        const fileName = `${Date.now()}_${newProfileImage.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage.from("artist-profiles").upload(fileName, newProfileImage)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from("artist-profiles").getPublicUrl(uploadData.path)
        imageUrl = urlData.publicUrl
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
      }

      const { error: artistError } = await supabase.from("artists").update(updateData).eq("id", artistId)
      if (artistError) throw new Error(`Error updating artist details: ${artistError.message}`)

      // Handle social account deletions
      const finalSocialAccountIds = socialAccounts.map(a => a.id).filter(Boolean)
      const socialAccountIdsToDelete = initialSocialAccountIds.filter(id => !finalSocialAccountIds.includes(id))
      if (socialAccountIdsToDelete.length > 0) {
        const { error: deleteError } = await supabase.from('social_accounts').delete().in('id', socialAccountIdsToDelete)
        if (deleteError) throw new Error(`Error deleting social accounts: ${deleteError.message}`)
      }

      // Handle social account inserts and updates
      const socialToInsert = [];
      const socialToUpdate = [];

      for (const a of socialAccounts) {
        if (!a.platform) continue;

        let password = a.password;
        if (a.newPassword) {
          const { encrypted, iv } = await encrypt(a.newPassword);
          password = JSON.stringify({ encrypted, iv });
        }

        const cleanedFollowers = String(a.followers || '').replace(/\D/g, '');
        const followersCount = cleanedFollowers ? parseInt(cleanedFollowers, 10) : 0;

        const accountData = {
          artist_id: artistId,
          platform: a.platform,
          username: a.username || null,
          handle: a.handle || null,
          url: a.url || null,
          followers: followersCount,
          email: a.email || null,
          password: password
        };

        if (a.id) {
          socialToUpdate.push({ id: a.id, ...accountData });
        } else {
          socialToInsert.push(accountData);
        }
      }

      if (socialToInsert.length > 0) {
        const { error } = await supabase.from('social_accounts').insert(socialToInsert);
        if (error) throw new Error(`Error inserting social accounts: ${error.message}`);
      }

      for (const acc of socialToUpdate) {
        const { id, ...data } = acc;
        const { error } = await supabase.from('social_accounts').update(data).eq('id', id);
        if (error) throw new Error(`Error updating social account ${id}: ${error.message}`);
      }

      // Handle distribution account deletions
      const finalDistributionAccountIds = distributionAccounts.map(a => a.id).filter(Boolean);
      const distributionAccountIdsToDelete = initialDistributionAccountIds.filter(id => !finalDistributionAccountIds.includes(id));
      if (distributionAccountIdsToDelete.length > 0) {
        const { error: deleteError } = await supabase.from('distribution_accounts').delete().in('id', distributionAccountIdsToDelete);
        if (deleteError) throw new Error(`Error deleting distribution accounts: ${deleteError.message}`);
      }

      // Handle distribution account inserts and updates
      const distroToInsert = [];
      const distroToUpdate = [];

      for (const a of distributionAccounts) {
        if (!a.distributor || !a.service) continue;

        let password = a.password;
        if (a.newPassword) {
          const { encrypted, iv } = await encrypt(a.newPassword);
          password = JSON.stringify({ encrypted, iv });
        }

        const cleanedListeners = String(a.monthly_listeners || '').replace(/\D/g, '');
        const listenersCount = cleanedListeners ? parseInt(cleanedListeners, 10) : 0;

        const accountData = {
          artist_id: artistId,
          distributor: a.distributor,
          service: a.service,
          monthly_listeners: listenersCount,
          username: a.username || null,
          email: a.email || null,
          notes: a.notes || null,
          url: a.url || null,
          account_id: a.account_id || null,
          password: password
        };

        if (a.id) {
          distroToUpdate.push({ id: a.id, ...accountData });
        } else {
          distroToInsert.push(accountData);
        }
      }

      if (distroToInsert.length > 0) {
        const { error } = await supabase.from('distribution_accounts').insert(distroToInsert);
        if (error) throw new Error(`Error inserting distribution accounts: ${error.message}`);
      }

      for (const acc of distroToUpdate) {
        const { id, ...data } = acc;
        const { error } = await supabase.from('distribution_accounts').update(data).eq('id', id);
        if (error) throw new Error(`Error updating distribution account ${id}: ${error.message}`);
      }

      toast({ title: "Success!", description: "Artist updated successfully." })
      router.push(`/artists/${artistId}`)
    } catch (error: any) {
      console.error("Error updating artist:", error)
      if (error.code === '23505') {
        toast({ title: "Error", description: "Spotify Artist ID is already in use by another artist.", variant: "destructive" });
      } else {
        toast({ title: "Error updating artist", description: error.message || "An unknown error occurred", variant: "destructive" });
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      {isLoadingData ? (
        <EditArtistSkeleton />
      ) : !artist ? (
        <div className="flex h-full items-center justify-center"><p>Artist not found.</p></div>
      ) : (
        <>
          <FormHeader 
            title="Edit Artist"
            description={`Update ${artist.name}'s profile and information`}
            backHref={`/artists/${artist.id}`}
          />

          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit}>
              <FormLayout>
                {/* Basic Information */}
                <FormSection 
                  title="Basic Information" 
                  description="Essential artist details and profile setup"
                  icon={User}
                >
                  <div className="space-y-6">
                    {/* Profile Image */}
                    <FormField label="Profile Image" hint="Upload a new image to replace the current one">
                      <div className="flex items-center gap-4">
                        {artist?.profile_image && (
                          <Image 
                            src={artist.profile_image} 
                            alt={artist.name} 
                            width={80} 
                            height={80} 
                            className="rounded-full object-cover border-2 border-muted" 
                          />
                        )}
                        <div>
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setNewProfileImage(e.target.files ? e.target.files[0] : null)} 
                            className="w-full"
                          />
                        </div>
                      </div>
                    </FormField>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <FormField label="Artist Name" required>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter stage/artist name"
                          required
                        />
                      </FormField>
                      <FormField label="Genre" required>
                        <Select value={genre} onValueChange={setGenre} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select music genre" />
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
                            <SelectItem value="Reggaeton">Reggaeton</SelectItem>
                            <SelectItem value="Folk">Folk</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <FormField label="First Name">
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Legal first name"
                        />
                      </FormField>
                      <FormField label="Last Name">
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Legal last name"
                        />
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <FormField label="Date of Birth">
                        <DatePickerField date={dateOfBirth} onDateChange={setDateOfBirth} />
                      </FormField>
                      <FormField label="Location">
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="City, Country"
                        />
                      </FormField>
                    </div>

                    <FormField label="Spotify Artist URL or ID" hint="You can paste the full URL from the share button on your Spotify artist profile">
                      <Input
                        value={spotifyInput}
                        onChange={(e) => setSpotifyInput(e.target.value)}
                        placeholder="Paste Spotify URL, URI, or ID"
                      />
                    </FormField>

                    <FormField label="Biography" hint="Tell us about the artist's background, style, and achievements">
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write a compelling artist biography..."
                        rows={4}
                      />
                    </FormField>
                  </div>
                </FormSection>

                {/* Contact Information */}
                <FormSection 
                  title="Contact Information" 
                  description="Contact details and identification"
                  icon={Phone}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField label="Phone Number">
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        type="tel"
                      />
                    </FormField>
                    <FormField label="ID Number" hint="Government identification number">
                      <Input
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="Identification number"
                      />
                    </FormField>
                  </div>

                  <FormField label="Address">
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Full address including city and postal code"
                    />
                  </FormField>
                </FormSection>

                {/* Professional Information */}
                <FormSection 
                  title="Professional Information" 
                  description="Management and industry details"
                  icon={Settings}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField label="Management Entity" hint="PRO, publisher, or management company">
                      <Input
                        value={managementEntity}
                        onChange={(e) => setManagementEntity(e.target.value)}
                        placeholder="e.g., ASCAP, BMI, management company"
                      />
                    </FormField>
                    <FormField label="IPI Number" hint="International Performer Identifier">
                      <Input
                        value={ipi}
                        onChange={(e) => setIpi(e.target.value)}
                        placeholder="IPI number (if applicable)"
                      />
                    </FormField>
                  </div>

                  <FormField label="Bank Information" hint="Enter bank details as JSON format">
                    <Textarea
                      value={bankInfo}
                      onChange={(e) => setBankInfo(e.target.value)}
                      placeholder='{"bank": "Bank Name", "account": "123456789", "routing": "987654321"}'
                      rows={3}
                    />
                  </FormField>
                </FormSection>

                {/* Social Media Accounts */}
                <FormSection 
                  title="Social Media Accounts" 
                  description="Connect artist's social media presence"
                  icon={Users}
                  headerAction={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSocialAccount}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Account
                    </Button>
                  }
                >
                  <div className="space-y-4">
                    {socialAccounts.map((account, index) => (
                      <div key={account.id || index} className="p-4 sm:p-6 border rounded-xl bg-muted/20 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm sm:text-base">Social Account {index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSocialAccount(index)}
                            className="flex items-center gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField label="Platform">
                            <Select
                              value={account.platform}
                              onValueChange={(value) => updateSocialAccount(index, "platform", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Instagram">📷 Instagram</SelectItem>
                                <SelectItem value="Twitter">🐦 Twitter</SelectItem>
                                <SelectItem value="YouTube">📺 YouTube</SelectItem>
                                <SelectItem value="TikTok">🎵 TikTok</SelectItem>
                                <SelectItem value="Facebook">👥 Facebook</SelectItem>
                                <SelectItem value="Spotify">🎧 Spotify</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>
                          
                          <FormField label="Username">
                            <Input
                              value={account.username || ''}
                              onChange={(e) => updateSocialAccount(index, "username", e.target.value)}
                              placeholder="@username"
                            />
                          </FormField>
                          
                          <FormField label="Email">
                            <Input
                              type="email"
                              value={account.email || ''}
                              onChange={(e) => updateSocialAccount(index, "email", e.target.value)}
                              placeholder="contact@example.com"
                            />
                          </FormField>
                          
                          <FormField label="Handle">
                            <Input
                              value={account.handle || ''}
                              onChange={(e) => updateSocialAccount(index, "handle", e.target.value)}
                              placeholder="@handle"
                            />
                          </FormField>
                          
                          <FormField label="Followers">
                            <Input
                              value={account.followers || ''}
                              onChange={(e) => updateSocialAccount(index, "followers", e.target.value)}
                              placeholder="125K"
                            />
                          </FormField>
                          
                          <FormField label="Profile URL">
                            <Input
                              value={account.url || ''}
                              onChange={(e) => updateSocialAccount(index, "url", e.target.value)}
                              placeholder="https://..."
                              type="url"
                            />
                          </FormField>
                        </div>

                        <Separator className="my-4" />
                        <div>
                          <Label className="text-sm font-medium">Password Management</Label>
                          <p className="text-xs text-muted-foreground mb-2">Save or view the password for this account.</p>
                          {account.id && currentUserId ? (
                            <CredentialManager
                              accountId={account.id}
                              tableName="social_accounts"
                            />
                          ) : (
                            <div className="space-y-2">
                              <Label>New Password</Label>
                              <Input type="password" onChange={(e) => updateSocialAccount(index, "newPassword", e.target.value)} placeholder="Enter new password" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </FormSection>

                {/* Distribution Accounts */}
                <FormSection 
                  title="Distribution Accounts" 
                  description="Music distribution and streaming platforms"
                  icon={Music}
                  headerAction={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDistributionAccount}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Account
                    </Button>
                  }
                >
                  <div className="space-y-4">
                    {distributionAccounts.map((account, index) => (
                      <div key={account.id || index} className="p-4 sm:p-6 border rounded-xl bg-muted/20 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm sm:text-base">Distribution Account {index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDistributionAccount(index)}
                            className="flex items-center gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField label="Distributor">
                            <Input
                              value={account.distributor || ''}
                              onChange={(e) => updateDistributionAccount(index, "distributor", e.target.value)}
                              placeholder="e.g., DistroKid, CD Baby"
                            />
                          </FormField>
                          
                          <FormField label="Service">
                            <Select
                              value={account.service || ''}
                              onValueChange={(value) => updateDistributionAccount(index, "service", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select service" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Spotify">🎧 Spotify</SelectItem>
                                <SelectItem value="Apple Music">🍎 Apple Music</SelectItem>
                                <SelectItem value="YouTube Music">📺 YouTube Music</SelectItem>
                                <SelectItem value="Amazon Music">📦 Amazon Music</SelectItem>
                                <SelectItem value="Bandcamp">🎵 Bandcamp</SelectItem>
                                <SelectItem value="SoundCloud">☁️ SoundCloud</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>
                          
                          <FormField label="Username">
                            <Input
                              value={account.username || ''}
                              onChange={(e) => updateDistributionAccount(index, "username", e.target.value)}
                              placeholder="artist_username"
                            />
                          </FormField>
                          
                          <FormField label="Email">
                            <Input
                              type="email"
                              value={account.email || ''}
                              onChange={(e) => updateDistributionAccount(index, "email", e.target.value)}
                              placeholder="contact@distro.com"
                            />
                          </FormField>
                          
                          <FormField label="Profile URL">
                            <Input
                              value={account.url || ''}
                              onChange={(e) => updateDistributionAccount(index, "url", e.target.value)}
                              placeholder="https://..."
                              type="url"
                            />
                          </FormField>
                          
                          <FormField label="Monthly Listeners">
                            <Input
                              value={account.monthly_listeners || ''}
                              onChange={(e) => updateDistributionAccount(index, "monthly_listeners", e.target.value)}
                              placeholder="250,000"
                            />
                          </FormField>
                        </div>
                        
                        <FormField label="Notes" hint="Additional information about this distribution account">
                          <Textarea
                            value={account.notes || ''}
                            onChange={(e) => updateDistributionAccount(index, "notes", e.target.value)}
                            placeholder="Add any relevant notes about this account..."
                            rows={2}
                          />
                        </FormField>

                        <Separator className="my-4" />
                        <div>
                          <Label className="text-sm font-medium">Password Management</Label>
                          <p className="text-xs text-muted-foreground mb-2">Save or view the password for this account.</p>
                          {account.id && currentUserId ? (
                            <CredentialManager
                              accountId={account.id}
                              tableName="distribution_accounts"
                            />
                          ) : (
                            <div className="space-y-2">
                              <Label>New Password</Label>
                              <Input type="password" onChange={(e) => updateDistributionAccount(index, "newPassword", e.target.value)} placeholder="Enter new password" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </FormSection>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating Artist...
                      </>
                    ) : (
                      "Update Artist"
                    )}
                  </Button>
                </div>
              </FormLayout>
            </form>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
