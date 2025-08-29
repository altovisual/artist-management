'use client'

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface SocialAccount {
  id: string | null;
  platform: string;
  username: string;
  handle: string;
  url: string;
  followers: string;
}

interface DistributionAccount {
  id: string | null;
  distributor: string;
  service: string;
  monthly_listeners: string;
  username: string;
  email: string;
  notes: string;
  url: string;
  account_id: string;
}

interface Project {
  id: string | null;
  title: string;
  release_date: string;
  type: string;
  status: string;
  music_file_url: string | null;
  assets?: Asset[]; // Add assets to Project interface
}

interface Asset {
  id: string | null;
  project_id: string | null;
  category: string;
  file_url: string | null;
  file_name: string;
}

export default function MyProfilePage() {
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
  const [deletedSocialAccountIds, setDeletedSocialAccountIds] = useState<string[]>([])
  const [distributionAccounts, setDistributionAccounts] = useState<DistributionAccount[]>([])
  const [deletedDistributionAccountIds, setDeletedDistributionAccountIds] = useState<string[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [deletedProjectIds, setDeletedProjectIds] = useState<string[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [deletedAssetIds, setDeletedAssetIds] = useState<string[]>([])

  // Fetch artist data based on authenticated user ID
  useEffect(() => {
    const fetchArtistData = async () => {
      setIsLoadingData(true)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login"); // Redirect if not logged in
        return;
      }
      setCurrentUserId(user.id);

      try {
        // Fetch artist profile linked to the current user ID
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select(`*,
            social_accounts (*),
            distribution_accounts (*),
            projects (*,
              assets (*)
            )
          `)
          .eq("user_id", user.id) // Use user.id instead of params.id
          .single()

        if (artistError || !artistData) {
          // If no artist profile found for this user, redirect to onboarding
          if (artistError?.code === 'PGRST116') { // No rows found
            toast({ title: "Info", description: "Please create your artist profile first.", variant: "default" });
            router.push("/artists/onboarding");
          } else {
            console.error("Error fetching artist data:", JSON.stringify(artistError, null, 2));
            toast({ title: "Error", description: "Failed to load artist data.", variant: "destructive" });
            router.push("/dashboard"); // Fallback to dashboard
          }
          return;
        }

        setArtist(artistData)
        setName(artistData.name || "")
        setGenre(artistData.genre || "")
        setLocation(artistData.country || "")
        setBio(artistData.bio || "")
        setSocialAccounts(artistData.social_accounts || [])
        setDistributionAccounts(artistData.distribution_accounts || [])
        setProjects(artistData.projects || [])

        // Extract assets from projects and flatten them into a single array
        const allAssets: Asset[] = [];
        artistData.projects.forEach((project: Project) => {
          if (project.assets) {
            allAssets.push(...project.assets);
          }
        });
        setAssets(allAssets);

      } catch (error) {
        console.error("Error loading artist data:", error);
        toast({ title: "Error", description: "Failed to load artist data.", variant: "destructive" });
        router.push("/dashboard");
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchArtistData()
  }, [router, supabase, toast])

  const addSocialAccount = () => {
    setSocialAccounts([...socialAccounts, { id: null, platform: "", username: "", handle: "", url: "", followers: "" }]);
  };

  const removeSocialAccount = (indexToRemove: number) => {
    const accountToRemove = socialAccounts[indexToRemove];
    if (accountToRemove.id) {
      setDeletedSocialAccountIds((prev) => [...prev, accountToRemove.id as string]);
    }
    setSocialAccounts(socialAccounts.filter((_, index) => index !== indexToRemove));
  };

  const addDistributionAccount = () => {
    setDistributionAccounts([...distributionAccounts, { id: null, distributor: "", service: "", monthly_listeners: "", username: "", email: "", notes: "", url: "", account_id: "" }]);
  };

  const removeDistributionAccount = (indexToRemove: number) => {
    const accountToRemove = distributionAccounts[indexToRemove];
    if (accountToRemove.id) {
      setDeletedDistributionAccountIds((prev) => [...prev, accountToRemove.id as string]);
    }
    setDistributionAccounts(distributionAccounts.filter((_, index) => index !== indexToRemove));
  };

  const addProject = () => {
    setProjects([...projects, { id: null, title: "", release_date: "", type: "", status: "", music_file_url: null }]);
  };

  const removeProject = (indexToRemove: number) => {
    const projectToRemove = projects[indexToRemove];
    if (projectToRemove.id) {
      setDeletedProjectIds((prev) => [...prev, projectToRemove.id as string]);
    }
    setProjects(projects.filter((_, index) => index !== indexToRemove));
  };

  const addAsset = () => {
    setAssets([...assets, { id: null, project_id: null, category: "", file_url: null, file_name: "" }]);
  };

  const removeAsset = (indexToRemove: number) => {
    const assetToRemove = assets[indexToRemove];
    if (assetToRemove.id) {
      setDeletedAssetIds((prev) => [...prev, assetToRemove.id as string]);
    }
    setAssets(assets.filter((_, index) => index !== indexToRemove));
  };

  const updateSocialAccount = (index: number, field: keyof SocialAccount, value: string) => {
    const updatedAccounts = [...socialAccounts];
    (updatedAccounts[index] as any)[field] = value;
    setSocialAccounts(updatedAccounts);
  };

  const updateDistributionAccount = (index: number, field: keyof DistributionAccount, value: string) => {
    const updatedAccounts = [...distributionAccounts];
    (updatedAccounts[index] as any)[field] = value;
    setDistributionAccounts(updatedAccounts);
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updatedProjects = [...projects];
    (updatedProjects[index] as any)[field] = value;
    setProjects(updatedProjects);
  };

  const updateAsset = (index: number, field: keyof Asset, value: string) => {
    const updatedAssets = [...assets];
    (updatedAssets[index] as any)[field] = value;
    setAssets(updatedAssets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!artist?.id) {
      toast({ title: "Error", description: "Artist ID not found.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
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

      const { error: artistError } = await supabase.from("artists").update(updateData).eq("id", artist.id) // Use artist.id
      if (artistError) throw artistError

      // Delete removed Social Accounts
      if (deletedSocialAccountIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("social_accounts")
          .delete()
          .in("id", deletedSocialAccountIds);
        if (deleteError) throw deleteError;
      }

      // Update Social Accounts
      const socialAccountsToUpsert = socialAccounts
          .filter(a => a.platform) // Only upsert if platform is provided
          .map(a => ({
            id: a.id,
            artist_id: artist.id,
            platform: a.platform,
            username: a.username || null,
            handle: a.handle || null,
            url: a.url || null,
            followers: Number.parseInt(a.followers || '0'),
          }));

      if (socialAccountsToUpsert.length > 0) {
        const { error } = await supabase.from("social_accounts").upsert(socialAccountsToUpsert)
        if(error) throw error
      }

      // Delete removed Distribution Accounts
      if (deletedDistributionAccountIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("distribution_accounts")
          .delete()
          .in("id", deletedDistributionAccountIds);
        if (deleteError) throw deleteError;
      }

      // Update Distribution Accounts
      const distroAccountsToUpsert = distributionAccounts
          .filter(a => a.distributor && a.service) // Only upsert if distributor and service are provided
          .map(a => ({
            id: a.id,
            artist_id: artist.id,
            distributor: a.distributor,
            service: a.service,
            monthly_listeners: Number.parseInt(a.monthly_listeners || '0'),
            username: a.username || null,
            email: a.email || null,
            notes: a.notes || null,
            url: a.url || null,
            account_id: a.account_id || null,
          }));

      if (distroAccountsToUpsert.length > 0) {
        const { error } = await supabase.from("distribution_accounts").upsert(distroAccountsToUpsert)
        if(error) throw error
      }

      // Delete removed Projects
      if (deletedProjectIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("projects")
          .delete()
          .in("id", deletedProjectIds);
        if (deleteError) throw deleteError;
      }

      // Update Projects
      const projectsToUpsert = projects
          .filter(p => p.title && p.release_date && p.type && p.status) // Only upsert if required fields are provided
          .map(p => ({
            id: p.id,
            artist_id: artist.id,
            title: p.title,
            release_date: p.release_date,
            type: p.type,
            status: p.status,
            music_file_url: p.music_file_url,
          }));

      if (projectsToUpsert.length > 0) {
        const { error } = await supabase.from("projects").upsert(projectsToUpsert)
        if(error) throw error
      }

      // Delete removed Assets
      if (deletedAssetIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("assets")
          .delete()
          .in("id", deletedAssetIds);
        if (deleteError) throw deleteError;
      }

      // Update Assets
      // Assets are linked to projects, so we need to ensure project_id is set
      const assetsToUpsert = assets
          .filter(a => a.project_id && a.category && a.file_name) // Only upsert if required fields are provided
          .map(a => ({
            id: a.id,
            project_id: a.project_id,
            category: a.category,
            file_url: a.file_url,
            file_name: a.file_name,
          }));

      if (assetsToUpsert.length > 0) {
        const { error } = await supabase.from("assets").upsert(assetsToUpsert)
        if(error) throw error
      }

      toast({ title: "Success!", description: "Profile updated successfully." })
      router.push(`/dashboard`)
    } catch (error: any) {
      console.error("Error updating profile:", JSON.stringify(error, null, 2))
      toast({ title: "Error updating profile", description: error.message || "An unknown error occurred", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading profile...</p></div>
  }

  if (!artist) {
    return <div className="min-h-screen flex items-center justify-center"><p>No artist profile found for this user. Please create one.</p></div>
  }

  return (
    <>
      <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">My Artist Profile</h1>
              <p className="text-muted-foreground">Manage your artist information</p>
            </div>
          </div>
        </div>
      </header>

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
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about your artist journey..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Profile Image</Label>
                {artist?.profile_image && <Image src={artist.profile_image} alt={artist.name} width={96} height={96} className="rounded-full object-cover"/>}
                <Input id="profile-image" type="file" accept="image/*" onChange={(e) => setNewProfileImage(e.target.files ? e.target.files[0] : null)} />
                <p className="text-sm text-muted-foreground">Upload a new image to replace the current one.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Social Media Accounts</CardTitle>
                <Button type="button" onClick={addSocialAccount} size="sm">
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <>
                {socialAccounts.length === 0 && (
                  <p className="text-muted-foreground text-sm">No social accounts linked. Click &quot;Add Account&quot; to add one.</p>
                )}
                {socialAccounts.map((account, index) => (
                  <div key={account.id || `new-${index}`} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{account.platform || `New Account ${index + 1}`}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSocialAccount(index)}
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <Select value={account.platform} onValueChange={(value) => updateSocialAccount(index, "platform", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Spotify">Spotify</SelectItem>
                            <SelectItem value="Apple Music">Apple Music</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="TikTok">TikTok</SelectItem>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                            <SelectItem value="Twitter">Twitter</SelectItem>
                            <SelectItem value="SoundCloud">SoundCloud</SelectItem>
                            <SelectItem value="Bandcamp">Bandcamp</SelectItem>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input value={account.username || ''} onChange={(e) => updateSocialAccount(index, "username", e.target.value)} placeholder="@username" />
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
                  </div>
                ))}
              </>
            </CardContent>
          </Card>


          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Distribution Accounts</CardTitle>
                <Button type="button" onClick={addDistributionAccount} size="sm">
                  Add Account
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <>
                {distributionAccounts.length === 0 && (
                  <p className="text-muted-foreground text-sm">No distribution accounts linked. Click &quot;Add Account&quot; to add one.</p>
                )}
                {distributionAccounts.map((account, index) => (
                  <div key={account.id || `new-${index}`} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{account.distributor || `New Account ${index + 1}`}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeDistributionAccount(index)}
                      >
                        Delete
                      </Button>
                    </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Distributor</Label>
                          <Input value={account.distributor || ''} onChange={(e) => updateDistributionAccount(index, "distributor", e.target.value)} placeholder="Distributor Name" />
                        </div>
                        <div className="space-y-2">
                          <Label>Service</Label>
                          <Input value={account.service || ''} onChange={(e) => updateDistributionAccount(index, "service", e.target.value)} placeholder="Service Name" />
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
                    </div>
                  ))}
              </>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Projects</CardTitle>
                <Button type="button" onClick={addProject} size="sm">
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length === 0 && (
                <p className="text-muted-foreground text-sm">No projects linked. Click &quot;Add Project&quot; to add one.</p>
              )}
              {projects.map((project, index) => (
                <div key={project.id || `new-${index}`} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{project.title || `New Project ${index + 1}`}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeProject(index)}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input value={project.title} onChange={(e) => updateProject(index, "title", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Release Date *</Label>
                      <Input type="date" value={project.release_date} onChange={(e) => updateProject(index, "release_date", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Select value={project.type} onValueChange={(value) => updateProject(index, "type", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="EP">EP</SelectItem>
                          <SelectItem value="Album">Album</SelectItem>
                          <SelectItem value="Mixtape">Mixtape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status *</Label>
                      <Select value={project.status} onValueChange={(value) => updateProject(index, "status", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Upcoming">Upcoming</SelectItem>
                          <SelectItem value="Released">Released</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Music File URL</Label>
                      <Input value={project.music_file_url || ''} onChange={(e) => updateProject(index, "music_file_url", e.target.value)} placeholder="https://example.com/music.mp3" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assets</CardTitle>
                <Button type="button" onClick={addAsset} size="sm">
                  Add Asset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {assets.length === 0 && (
                <p className="text-muted-foreground text-sm">No assets linked. Click &quot;Add Asset&quot; to add one.</p>
              )}
              {assets.map((asset, index) => (
                <div key={asset.id || `new-${index}`} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{asset.file_name || `New Asset ${index + 1}`}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAsset(index)}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project *</Label>
                      <Select value={asset.project_id || ''} onValueChange={(value) => updateAsset(index, "project_id", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id || ''}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={asset.category} onValueChange={(value) => updateAsset(index, "category", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cover Art">Cover Art</SelectItem>
                          <SelectItem value="Press Photo">Press Photo</SelectItem>
                          <SelectItem value="Lyric Video">Lyric Video</SelectItem>
                          <SelectItem value="Social Media Graphic">Social Media Graphic</SelectItem>
                          <SelectItem value="Promotional Video">Promotional Video</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>File Name *</Label>
                      <Input value={asset.file_name} onChange={(e) => updateAsset(index, "file_name", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>File URL</Label>
                      <Input value={asset.file_url || ''} onChange={(e) => updateAsset(index, "file_url", e.target.value)} placeholder="https://example.com/asset.png" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button type="submit" disabled={isLoading}>{isLoading ? "Updating..." : "Update Profile"}</Button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}