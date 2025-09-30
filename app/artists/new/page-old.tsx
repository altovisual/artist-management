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
import { ArrowLeft, Plus, Trash2, User, Users, Music, Settings, CreditCard, Phone, MapPin, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/dashboard-layout"
import { AnimatedTitle } from "@/components/animated-title"
import { DatePickerField } from "@/components/ui/datepicker"

// Modern form components
import { FormLayout } from "@/components/forms/form-layout"
import { FormSection } from "@/components/forms/form-section"
import { FormField } from "@/components/forms/form-field"
import { FormHeader } from "@/components/forms/form-header"
import { ImageUpload } from "@/components/forms/image-upload"

interface SocialAccount {
  platform: string
  username: string
  followers: string   // <- se mantiene en UI, pero NO se envía al DB
  url: string
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
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>()
  const [profileImage, setProfileImage] = useState<File | null>(null)

  // New participant-related fields
  const [idNumber, setIdNumber] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [bankInfo, setBankInfo] = useState("") // Will be JSON string
  const [managementEntity, setManagementEntity] = useState("")
  const [ipi, setIpi] = useState("")

  // Social accounts
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { platform: "", username: "", followers: "", url: "" },
  ])

  // Distribution accounts
  const [distributionAccounts, setDistributionAccounts] = useState<DistributionAccount[]>([
    { id: null, distributor: "", service: "", monthly_listeners: "", username: "", email: "", notes: "", url: "", account_id: "" },
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
    setDistributionAccounts([...distributionAccounts, { id: null, distributor: "", service: "", monthly_listeners: "", username: "", email: "", notes: "", url: "", account_id: "" }]);
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
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          // New participant-related fields
          id_number: idNumber || null,
          address: address || null,
          phone: phone || null,
          bank_info: parsedBankInfo,
          management_entity: managementEntity || null,
          ipi: ipi || null,
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
      const validDistributionAccounts = distributionAccounts.filter((acc) => acc.distributor && acc.service) // Filter by distributor and service
      if (validDistributionAccounts.length > 0) {
        const distributionAccountsData = validDistributionAccounts.map((acc) => ({
          ...(acc.id && { id: acc.id }), // Conditionally add id only if it exists
          artist_id: artistId,
          distributor: acc.distributor,
          service: acc.service,
          monthly_listeners: Number.parseInt(acc.monthly_listeners || '0'),
          username: acc.username || null,
          email: acc.email || null,
          notes: acc.notes || null,
          url: acc.url || null,
          account_id: acc.account_id || null,
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
      <FormHeader 
        title="Add New Artist"
        description="Create a comprehensive artist profile with all essential information"
        backHref="/dashboard"
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
                <FormField label="Profile Image" hint="Upload a professional artist photo">
                  <ImageUpload 
                    value={profileImage}
                    onChange={setProfileImage}
                  />
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
                  <div key={index} className="p-4 sm:p-6 border rounded-xl bg-muted/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm sm:text-base">Social Account {index + 1}</h4>
                      {socialAccounts.length > 1 && (
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
                      )}
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
                          value={account.username}
                          onChange={(e) => updateSocialAccount(index, "username", e.target.value)}
                          placeholder="@username"
                        />
                      </FormField>
                      
                      <FormField label="Followers" hint="Display only - not saved to database">
                        <Input
                          value={account.followers}
                          onChange={(e) => updateSocialAccount(index, "followers", e.target.value)}
                          placeholder="125K"
                        />
                      </FormField>
                      
                      <FormField label="Profile URL">
                        <Input
                          value={account.url}
                          onChange={(e) => updateSocialAccount(index, "url", e.target.value)}
                          placeholder="https://..."
                          type="url"
                        />
                      </FormField>
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
                  <div key={index} className="p-4 sm:p-6 border rounded-xl bg-muted/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm sm:text-base">Distribution Account {index + 1}</h4>
                      {distributionAccounts.length > 1 && (
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
                      )}
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
                  </div>
                ))}
              </div>
            </FormSection>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-6">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Artist...
                  </>
                ) : (
                  "Create Artist"
                )}
              </Button>
            </div>
          </FormLayout>
        </form>
      </div>
    </DashboardLayout>
  )
}
