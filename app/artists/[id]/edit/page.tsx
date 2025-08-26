"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { SocialCredentialManager } from "@/components/social-credential-manager"
import { Separator } from "@/components/ui/separator"

interface SocialAccount {
  id: string | null;
  platform: string;
  username: string;
  followers: string;
  url: string;
  email: string;
}

interface DistributionAccount {
  id: string | null;
  platform: string;
  monthlyListeners: string;
}

export default function EditArtistPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [artist, setArtist] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  // Form state
  const [name, setName] = useState("")
  const [genre, setGenre] = useState("")
  const [location, setLocation] = useState("")
  const [bio, setBio] = useState("")
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null)
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [distributionAccounts, setDistributionAccounts] = useState<DistributionAccount[]>([])

  const addSocialAccount = () => {
    setSocialAccounts([...socialAccounts, { id: null, platform: "", username: "", followers: "", url: "", email: "" }]);
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
    setDistributionAccounts([...distributionAccounts, { id: null, platform: "", monthlyListeners: "" }]);
  };

  const removeDistributionAccount = (indexToRemove: number) => {
    setDistributionAccounts(distributionAccounts.filter((_, index) => index !== indexToRemove));
  };

  const updateDistributionAccount = (index: number, field: keyof DistributionAccount, value: string) => {
    const updatedAccounts = [...distributionAccounts];
    (updatedAccounts[index] as any)[field] = value;
    setDistributionAccounts(updatedAccounts);
  };

  // ... (state declarations remain the same)

  useEffect(() => {
    const fetchArtistData = async () => {
      const artistId = params.id as string
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      try {
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select(`*,
            social_accounts (*),
            distribution_accounts (*)
          `)
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
        setSocialAccounts(artistData.social_accounts || [])
        setDistributionAccounts(artistData.distribution_accounts || [])

      } catch (error) {
        toast({ title: "Error", description: "Failed to load artist data.", variant: "destructive" })
        router.push("/dashboard")
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchArtistData()
  }, [params.id, router, supabase, toast])

  // ... (add/remove/update functions remain the same)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const artistId = params.id as string
      let imageUrl: string | undefined = undefined

      if (newProfileImage) {
        const fileName = `${Date.now()}_${newProfileImage.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage.from("artist-profiles").upload(fileName, newProfileImage)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from("artist-profiles").getPublicUrl(uploadData.path)
        imageUrl = urlData.publicUrl
      }

      const updateData: any = { name, genre, country: location, bio }
      if (imageUrl) updateData.profile_image = imageUrl

      const { error: artistError } = await supabase.from("artists").update(updateData).eq("id", artistId)
      if (artistError) throw artistError

      // Handle Social Accounts
      const originalSocialIds = artist.social_accounts.map((a: any) => a.id)
      const finalSocialIds = socialAccounts.map((a) => a.id).filter(Boolean)
      const socialIdsToDelete = originalSocialIds.filter((id: string) => !finalSocialIds.includes(id))
      if (socialIdsToDelete.length > 0) {
        await supabase.from("social_accounts").delete().in("id", socialIdsToDelete)
      }
      const socialToUpsert = socialAccounts.filter(a => a.platform && a.username).map(a => ({ id: a.id, artist_id: artistId, platform: a.platform, username: a.username, followers: Number.parseInt(a.followers || '0'), url: a.url, email: a.email }))
      if (socialToUpsert.length > 0) {
        await supabase.from("social_accounts").upsert(socialToUpsert)
      }

      // Handle Distribution Accounts
      const originalDistroIds = artist.distribution_accounts.map((a: any) => a.id)
      const finalDistroIds = distributionAccounts.map((a) => a.id).filter(Boolean)
      const distroIdsToDelete = originalDistroIds.filter((id: string) => !finalDistroIds.includes(id))
      if (distroIdsToDelete.length > 0) {
        await supabase.from("distribution_accounts").delete().in("id", distroIdsToDelete)
      }
      const distroToUpsert = distributionAccounts.filter(a => a.platform).map(a => ({ id: a.id, artist_id: artistId, platform: a.platform, monthly_listeners: Number.parseInt(a.monthlyListeners || '0') }))
      if (distroToUpsert.length > 0) {
        await supabase.from("distribution_accounts").upsert(distroToUpsert)
      }

      toast({ title: "Success!", description: "Artist updated successfully." })
      router.push(`/artists/${artistId}`)
    } catch (error: any) {
      toast({ title: "Error updating artist", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/artists/${artist.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Artist
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Edit {artist.name}</h1>
              <p className="text-muted-foreground">Update artist information</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                  <Label htmlFor="genre">Genre *</Label>
                  <Select value={genre} onValueChange={setGenre} required>
                    <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about the artist..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Profile Image</Label>
                {artist?.profile_image && <img src={artist.profile_image} alt={artist.name} className="h-24 w-24 rounded-full object-cover"/>}
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
                      <Label>Platform</Label>
                      <Select value={account.platform} onValueChange={(value) => updateSocialAccount(index, "platform", value)}>
                        <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
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
                      <Input value={account.username} onChange={(e) => updateSocialAccount(index, "username", e.target.value)} placeholder="@username" />
                    </div>
                    <div className="space-y-2">
                      <Label>Followers</Label>
                      <Input value={account.followers} onChange={(e) => updateSocialAccount(index, "followers", e.target.value)} placeholder="125K" />
                    </div>
                    <div className="space-y-2">
                      <Label>Profile URL</Label>
                      <Input value={account.url} onChange={(e) => updateSocialAccount(index, "url", e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={account.email} onChange={(e) => updateSocialAccount(index, "email", e.target.value)} placeholder="email@example.com" />
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <Label className="text-sm font-medium">Password Management</Label>
                    <p className="text-xs text-muted-foreground mb-2">Save or view the password for this account.</p>
                    {account.id && currentUserId ? (
                      <SocialCredentialManager socialAccountId={account.id} userId={currentUserId} />
                    ) : (
                      <p className="text-xs text-destructive">Save artist to enable password management.</p>
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
                      <Label>Platform</Label>
                      <Select value={account.platform} onValueChange={(value) => updateDistributionAccount(index, "platform", value)}>
                        <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
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
                      <Input value={account.monthlyListeners} onChange={(e) => updateDistributionAccount(index, "monthlyListeners", e.target.value)} placeholder="250K" />
                    </div>
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
      </main>
    </div>
  )
}