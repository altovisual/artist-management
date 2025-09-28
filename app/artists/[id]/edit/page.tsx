'use client'

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
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
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <AnimatedTitle text="Edit Artist" level={1} className="text-xl font-semibold" />
              <p className="text-muted-foreground">{artist.name}</p>
            </div>
          </div>
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
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Artist's first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Artist's last name" />
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
                   {/* New participant-related fields */}
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Identification number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Artist's address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Artist's phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="managementEntity">Management Entity</Label>
                    <Input
                      id="managementEntity"
                      value={managementEntity}
                      onChange={(e) => setManagementEntity(e.target.value)}
                      placeholder="e.g., PRO, publisher"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ipi">IPI Number</Label>
                    <Input
                      id="ipi"
                      value={ipi}
                      onChange={(e) => setIpi(e.target.value)}
                      placeholder="IPI number (if applicable)"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about the artist..." rows={4} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bankInfo">Bank Info (JSON)</Label>
                    <Textarea
                      id="bankInfo"
                      value={bankInfo}
                      onChange={(e) => setBankInfo(e.target.value)}
                      placeholder={`{
  "bank_name": "Global Bank",
  "account_holder": "Artist Name",
  "account_number": "1234567890",
  "routing_number": "0987654321",
  "swift_code": "GLOBUS33"
}`}
                      rows={6}
                    />
                  </div>
                <div className="space-y-2">
                  <Label>Profile Image</Label>
                  {artist?.profile_image && <Image src={artist.profile_image} alt={artist.name} width={96} height={96} className="rounded-full object-cover" />}
                  <Input id="profile-image" type="file" accept="image/*" onChange={(e) => setNewProfileImage(e.target.files ? e.target.files[0] : null)} />
                  <p className="text-sm text-muted-foreground">Upload a new image to replace the current one.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Social Media Accounts</CardTitle>
                  <Button type="button" variant="outline" onClick={addSocialAccount}><Plus className="h-4 w-4 mr-2" />Add Account</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialAccounts.map((account, index) => (
                  <div key={account.id || index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Social Account {index + 1}</h4>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeSocialAccount(index)}><Trash2 className="h-3 w-3 mr-1" />Remove</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`social-platform-${index}`}>Platform</Label>
                        <Select value={account.platform} onValueChange={(value) => updateSocialAccount(index, "platform", value)}>
                          <SelectTrigger id={`social-platform-${index}`}><SelectValue placeholder="Select platform" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="Twitter">Twitter</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="TikTok">TikTok</SelectItem>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input value={account.username || ''} onChange={(e) => updateSocialAccount(index, "username", e.target.value)} placeholder="@username" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={account.email || ''} onChange={(e) => updateSocialAccount(index, "email", e.target.value)} placeholder="contact@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Handle</Label>
                        <Input value={account.handle || ''} onChange={(e) => updateSocialAccount(index, "handle", e.target.value)} placeholder="@handle" />
                      </div>
                      <div className="space-y-2">
                        <Label>Followers</Label>
                        <Input value={account.followers || ''} onChange={(e) => updateSocialAccount(index, "followers", e.target.value)} placeholder="125K" />
                      </div>
                      <div className="space-y-2">
                        <Label>Profile URL</Label>
                        <Input value={account.url || ''} onChange={(e) => updateSocialAccount(index, "url", e.target.value)} placeholder="https://..." />
                      </div>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Distribution Accounts</CardTitle>
                  <Button type="button" variant="outline" onClick={addDistributionAccount}><Plus className="h-4 w-4 mr-2" />Add Account</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {distributionAccounts.map((account, index) => (
                  <div key={account.id || index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Distribution Account {index + 1}</h4>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeDistributionAccount(index)}><Trash2 className="h-3 w-3 mr-1" />Remove</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Distributor</Label>
                        <Input value={account.distributor || ''} onChange={(e) => updateDistributionAccount(index, "distributor", e.target.value)} placeholder="Distributor Name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`distribution-service-${index}`}>Service</Label>
                        <Select value={account.service} onValueChange={(value) => updateDistributionAccount(index, "service", value)}>
                          <SelectTrigger id={`distribution-service-${index}`}><SelectValue placeholder="Select service" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Spotify">Spotify</SelectItem>
                            <SelectItem value="Apple Music">Apple Music</SelectItem>
                            <SelectItem value="YouTube Music">YouTube Music</SelectItem>
                            <SelectItem value="Amazon Music">Amazon Music</SelectItem>
                            <SelectItem value="Bandcamp">Bandcamp</SelectItem>
                            <SelectItem value="SoundCloud">SoundCloud</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Listeners</Label>
                        <Input value={account.monthly_listeners || ''} onChange={(e) => updateDistributionAccount(index, "monthly_listeners", e.target.value)} placeholder="250K" />
                      </div>
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input value={account.username || ''} onChange={(e) => updateDistributionAccount(index, "username", e.target.value)} placeholder="artist_username" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={account.email || ''} onChange={(e) => updateDistributionAccount(index, "email", e.target.value)} placeholder="contact@distro.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input value={account.url || ''} onChange={(e) => updateDistributionAccount(index, "url", e.target.value)} placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Account ID</Label>
                        <Input value={account.account_id || ''} onChange={(e) => updateDistributionAccount(index, "account_id", e.target.value)} placeholder="Account ID" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Notes</Label>
                        <Textarea value={account.notes || ''} onChange={(e) => updateDistributionAccount(index, "notes", e.target.value)} placeholder="Add any relevant notes..." />
                      </div>
                    </div>
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
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? "Updating..." : "Update Artist"}</Button>
            </div>
          </form>
        </>
      )}
    </DashboardLayout>
  )
}
