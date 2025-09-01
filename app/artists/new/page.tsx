'use client'

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/dashboard-layout"

interface SocialAccount {
  platform: string
  username: string
  followers: string   // <- se mantiene en UI, pero NO se envía al DB
  url: string
}

interface DistributionAccount {
  platform: string    // <- en DB se guarda como service
  monthlyListeners: string // <- se mantiene en UI, pero NO se envía al DB
}

export default function NewArtistPage() {
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

  // Social accounts
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { platform: "", username: "", followers: "", url: "" },
  ])

  // Distribution accounts
  const [distributionAccounts, setDistributionAccounts] = useState<DistributionAccount[]>([
    { platform: "", monthlyListeners: "" },
  ])

  const addSocialAccount = () => {
    setSocialAccounts([...socialAccounts, { platform: "", username: "", followers: "", url: "" }])
  }

  const removeSocialAccount = (index: number) => {
    setSocialAccounts(socialAccounts.filter((_, i) => i !== index))
  }

  const updateSocialAccount = (index: number, field: keyof SocialAccount, value: string) => {
    const updated = [...socialAccounts]
    updated[index][field] = value
    setSocialAccounts(updated)
  }

  const addDistributionAccount = () => {
    setDistributionAccounts([...distributionAccounts, { platform: "", monthlyListeners: "" }])
  }

  const removeDistributionAccount = (index: number) => {
    setDistributionAccounts(distributionAccounts.filter((_, i) => i !== index))
  }

  const updateDistributionAccount = (index: number, field: keyof DistributionAccount, value: string) => {
    const updated = [...distributionAccounts]
    updated[index][field] = value
    setDistributionAccounts(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to create an artist.", variant: "destructive" });
      setIsLoading(false);
      router.push("/auth/login");
      return;
    }

    try {
      let imageUrl: string | null = null
      if (profileImage) {
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

      // 1) Insert artist
      const { data: artistData, error: artistError } = await supabase
        .from("artists")
        .insert({
          user_id: user.id,
          name,
          genre,
          country: location,
          bio,
          profile_image: imageUrl,
          total_streams: 0,
          monthly_listeners: 0,
        })
        .select()
        .single()

      if (artistError) throw artistError
      const artistId = artistData.id

      // 2) Insert social_accounts (schema: artist_id, platform, handle, username, url, ...)
      const validSocialAccounts = socialAccounts.filter((acc) => acc.platform && acc.username)
      if (validSocialAccounts.length > 0) {
        const socialAccountsData = validSocialAccounts.map((acc) => ({
          artist_id: artistId,
          platform: acc.platform,
          handle: acc.username || acc.url || acc.platform, // <- handle OBLIGATORIO
          username: acc.username || null,
          url: acc.url || null,
          // followers NO existe en tabla; si lo quieres persistir, agrega la columna vía SQL
        }))

        const { error: socialError } = await supabase
          .from("social_accounts")
          .insert(socialAccountsData)
          .select("id") // solo columnas existentes

        if (socialError) {
          console.error("Error inserting social accounts:", socialError)
        }
      }

      // 3) Insert distribution_accounts (schema: artist_id, service, account_id?, email?)
      const validDistributionAccounts = distributionAccounts.filter((acc) => acc.platform)
      if (validDistributionAccounts.length > 0) {
        const distributionAccountsData = validDistributionAccounts.map((acc) => ({
          artist_id: artistId,
          service: acc.platform, // <- en DB es service, no platform
          // monthly_listeners NO existe; si lo quieres, agrega la columna vía SQL
        }))

        const { error: distributionError } = await supabase
          .from("distribution_accounts")
          .insert(distributionAccountsData)
          .select("id") // solo columnas existentes

        if (distributionError) {
          console.error("Error inserting distribution accounts:", distributionError.message)
          toast({
            title: "Error",
            description: `Failed to add distribution account: ${distributionError.message}`,
            variant: "destructive",
          });
        }
      }

      toast({ title: "Success!", description: "Artist created successfully." })
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating artist:", error)
      if (error instanceof Error) {
        console.error("Error name:", error.name)
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }
      toast({
        title: "Error",
        description: "Failed to create artist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add New Artist</h1>
            <p className="text-muted-foreground">Create a new artist profile</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
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
                    placeholder="Enter artist name"
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
                  placeholder="Tell us about the artist..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Social Media Accounts</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSocialAccount}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialAccounts.map((account, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Social Account {index + 1}</h4>
                    {socialAccounts.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSocialAccount(index)}
                        className="flex items-center gap-1 bg-transparent"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`social-platform-${index}`}>Platform</Label>
                      <Select
                        value={account.platform}
                        onValueChange={(value) => updateSocialAccount(index, "platform", value)}
                      >
                        <SelectTrigger id={`social-platform-${index}`}>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
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
                      <Input
                        value={account.username}
                        onChange={(e) => updateSocialAccount(index, "username", e.target.value)}
                        placeholder="@username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Followers (UI only)</Label>
                      <Input
                        value={account.followers}
                        onChange={(e) => updateSocialAccount(index, "followers", e.target.value)}
                        placeholder="125K"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Profile URL</Label>
                      <Input
                        value={account.url}
                        onChange={(e) => updateSocialAccount(index, "url", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Password Management</Label>
                    <div className="p-3 bg-muted rounded-md mt-2">
                      <p className="text-xs text-muted-foreground">
                        Password management will be available after the artist has been created. Please save this artist
                        first, then edit their profile to add credentials.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Distribution Accounts</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDistributionAccount}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {distributionAccounts.map((account, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Distribution Account {index + 1}</h4>
                    {distributionAccounts.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDistributionAccount(index)}
                        className="flex items-center gap-1 bg-transparent"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`distribution-platform-${index}`}>Platform</Label>
                      <Select
                        value={account.platform}
                        onValueChange={(value) => updateDistributionAccount(index, "platform", value)}
                      >
                        <SelectTrigger id={`distribution-platform-${index}`}>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
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
                      <Label>Monthly Listeners (UI only)</Label>
                      <Input
                        value={account.monthlyListeners}
                        onChange={(e) => updateDistributionAccount(index, "monthlyListeners", e.target.value)}
                        placeholder="250K"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Artist..." : "Create Artist"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}