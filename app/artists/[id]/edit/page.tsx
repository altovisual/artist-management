'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MultiStepForm, FormFieldGroup, FormFieldItem } from '@/components/forms/multi-step-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { User, Music, Users, CreditCard, Plus, Trash2, Upload, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { DateInput } from '@/components/ui/date-input'
import { CountrySelect } from '@/components/ui/country-select'
import { Label } from '@/components/ui/label'
import { DashboardLayout } from '@/components/dashboard-layout'
import { LogoLoader } from '@/components/ui/logo-loader'
import Link from 'next/link'

interface SocialAccount {
  platform: string
  username: string
  url: string
}

interface DistributionAccount {
  distributor: string
  service: string
  username: string
  email: string
  url: string
}

export default function EditArtistPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Step 1: Basic Information
  const [name, setName] = useState('')
  const [genre, setGenre] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>()
  const [location, setLocation] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>('')
  const [existingImageUrl, setExistingImageUrl] = useState<string>('')

  // Step 2: Contact & Legal
  const [idNumber, setIdNumber] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [managementEntity, setManagementEntity] = useState('')
  const [ipi, setIpi] = useState('')

  // Step 3: Bio & Description
  const [bio, setBio] = useState('')

  // Step 4: Social Media
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { platform: '', username: '', url: '' }
  ])

  // Step 5: Distribution
  const [distributionAccounts, setDistributionAccounts] = useState<DistributionAccount[]>([
    { distributor: '', service: '', username: '', email: '', url: '' }
  ])

  // Load artist data
  useEffect(() => {
    async function loadArtist() {
      const artistId = params.id as string
      if (!artistId) {
        setIsLoadingData(false)
        return
      }

      try {
        const { data: artistData, error } = await supabase
          .from('artists')
          .select('*')
          .eq('id', artistId)
          .single()

        if (error) throw error

        if (artistData) {
          setName(artistData.name || '')
          setGenre(artistData.genre || '')
          setFirstName(artistData.first_name || '')
          setLastName(artistData.last_name || '')
          setLocation(artistData.country || '')
          setBio(artistData.bio || '')
          setIdNumber(artistData.id_number || '')
          setAddress(artistData.address || '')
          setPhone(artistData.phone || '')
          setManagementEntity(artistData.management_entity || '')
          setIpi(artistData.ipi || '')
          
          if (artistData.date_of_birth) {
            setDateOfBirth(new Date(artistData.date_of_birth))
          }
          
          if (artistData.image_url) {
            setExistingImageUrl(artistData.image_url)
            setProfileImagePreview(artistData.image_url)
          }
        }

        // Load social accounts
        const { data: socialData } = await supabase
          .from('social_accounts')
          .select('*')
          .eq('artist_id', artistId)

        if (socialData && socialData.length > 0) {
          setSocialAccounts(socialData.map(acc => ({
            platform: acc.platform || '',
            username: acc.username || '',
            url: acc.url || ''
          })))
        }

        // Load distribution accounts
        const { data: distData } = await supabase
          .from('distribution_accounts')
          .select('*')
          .eq('artist_id', artistId)

        if (distData && distData.length > 0) {
          setDistributionAccounts(distData.map(acc => ({
            distributor: acc.distributor || '',
            service: acc.service || '',
            username: acc.username || '',
            email: acc.email || '',
            url: acc.url || ''
          })))
        }
      } catch (error) {
        console.error('Error loading artist:', error)
        toast({
          title: 'Error',
          description: 'Failed to load artist data',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadArtist()
  }, [params.id, supabase, toast])

  const steps = [
    {
      id: 'basic',
      title: 'Basic Info',
      description: 'Essential artist details',
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'contact',
      title: 'Contact',
      description: 'Legal and contact information',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'bio',
      title: 'Biography',
      description: 'Tell us about the artist',
      icon: <Music className="w-5 h-5" />
    },
    {
      id: 'social',
      title: 'Social Media',
      description: 'Connect social accounts',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'distribution',
      title: 'Distribution',
      description: 'Streaming platforms',
      icon: <Music className="w-5 h-5" />
    }
  ]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addSocialAccount = () => {
    setSocialAccounts([...socialAccounts, { platform: '', username: '', url: '' }])
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
    setDistributionAccounts([...distributionAccounts, { distributor: '', service: '', username: '', email: '', url: '' }])
  }

  const removeDistributionAccount = (index: number) => {
    setDistributionAccounts(distributionAccounts.filter((_, i) => i !== index))
  }

  const updateDistributionAccount = (index: number, field: keyof DistributionAccount, value: string) => {
    const updated = [...distributionAccounts]
    updated[index][field] = value
    setDistributionAccounts(updated)
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return name.trim() !== '' && genre.trim() !== '' && location.trim() !== ''
      case 1: // Contact
        return true // Optional fields
      case 2: // Bio
        return true // Optional
      case 3: // Social
        return true // Optional
      case 4: // Distribution
        return true // Optional
      default:
        return true
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    const artistId = params.id as string

    try {
      // Handle profile image upload - only if a new image was selected
      let imageUrlToSave = existingImageUrl // Keep existing by default
      
      if (profileImage) {
        // User selected a new image, upload it
        const fileExt = profileImage.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('artist-images')
          .upload(fileName, profileImage)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          toast({
            title: 'Warning',
            description: 'Could not upload new image. Keeping existing image.',
            variant: 'default'
          })
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('artist-images')
            .getPublicUrl(fileName)

          imageUrlToSave = publicUrl
        }
      }

      // Build update payload - only include fields that have values
      const artistPayload: any = {
        name,
        genre,
        country: location || 'us',
      }

      // Add optional fields only if they have values (not empty strings)
      if (bio !== undefined && bio !== null) artistPayload.bio = bio || null
      if (firstName) artistPayload.first_name = firstName
      if (lastName) artistPayload.last_name = lastName
      if (dateOfBirth) artistPayload.date_of_birth = dateOfBirth.toISOString()
      if (imageUrlToSave) artistPayload.image_url = imageUrlToSave
      if (idNumber !== undefined && idNumber !== null) artistPayload.id_number = idNumber || null
      if (address !== undefined && address !== null) artistPayload.address = address || null
      if (phone !== undefined && phone !== null) artistPayload.phone = phone || null
      if (managementEntity !== undefined && managementEntity !== null) artistPayload.management_entity = managementEntity || null
      if (ipi !== undefined && ipi !== null) artistPayload.ipi = ipi || null

      console.log('Updating artist with payload:', artistPayload)

      const { error: artistError } = await supabase
        .from('artists')
        .update(artistPayload)
        .eq('id', artistId)

      if (artistError) {
        console.error('Artist update error:', artistError)
        throw new Error(artistError.message || 'Failed to update artist')
      }

      // Update social accounts - delete and recreate only if there are changes
      const validSocialAccounts = socialAccounts.filter(acc => acc.platform && acc.username)
      
      // Delete existing and insert new ones
      await supabase.from('social_accounts').delete().eq('artist_id', artistId)
      
      if (validSocialAccounts.length > 0) {
        const socialData = validSocialAccounts.map(acc => ({
          artist_id: artistId,
          platform: acc.platform,
          username: acc.username,
          url: acc.url || null
        }))

        await supabase.from('social_accounts').insert(socialData)
      }

      // Update distribution accounts - delete and recreate only if there are changes
      const validDistAccounts = distributionAccounts.filter(acc => acc.distributor && acc.service)
      
      // Delete existing and insert new ones
      await supabase.from('distribution_accounts').delete().eq('artist_id', artistId)
      
      if (validDistAccounts.length > 0) {
        const distData = validDistAccounts.map(acc => ({
          artist_id: artistId,
          distributor: acc.distributor,
          service: acc.service,
          username: acc.username || null,
          email: acc.email || null,
          url: acc.url || null
        }))

        await supabase.from('distribution_accounts').insert(distData)
      }

      toast({
        title: 'Success!',
        description: 'Artist updated successfully',
      })

      // Redirect back to artist profile
      router.push(`/artists/${artistId}`)
    } catch (error: any) {
      console.error('Error updating artist:', error)
      const errorMessage = error?.message || error?.error_description || 'Failed to update artist. Please check all required fields.'
      toast({
        title: 'Error Updating Artist',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <LogoLoader size="lg" text="Loading artist data..." />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
            className="mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Edit Artist</h1>
            <p className="text-muted-foreground mt-2">
              Update artist information - Click on any step to edit that section
            </p>
          </div>
        </div>

        <MultiStepForm
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onComplete={handleComplete}
          canGoNext={canGoNext() && !isLoading}
          isLastStep={currentStep === steps.length - 1}
          mode="edit"
          allowStepNavigation={true}
        >
      {/* Step 1: Basic Information */}
      {currentStep === 0 && (
        <div className="space-y-6">
          {/* Profile Image */}
          <FormFieldGroup>
            <FormFieldItem label="Profile Image" isLast>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </FormFieldItem>
          </FormFieldGroup>

          {/* Artist Name & Genre */}
          <FormFieldGroup>
            <FormFieldItem label="Artist Name *">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter stage/artist name"
                className="border-0 bg-transparent focus-visible:ring-0 px-0"
              />
            </FormFieldItem>
            <FormFieldItem label="Genre *" isLast>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="border-0 bg-transparent focus:ring-0 px-0">
                  <SelectValue placeholder="Select music genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pop">Pop</SelectItem>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="hip-hop">Hip Hop</SelectItem>
                  <SelectItem value="electronic">Electronic</SelectItem>
                  <SelectItem value="r&b">R&B</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="jazz">Jazz</SelectItem>
                  <SelectItem value="classical">Classical</SelectItem>
                  <SelectItem value="reggaeton">Reggaeton</SelectItem>
                  <SelectItem value="latin">Latin</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldItem>
          </FormFieldGroup>

          {/* Legal Name */}
          <FormFieldGroup>
            <FormFieldItem label="First Name">
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Legal first name"
                className="border-0 bg-transparent focus-visible:ring-0 px-0"
              />
            </FormFieldItem>
            <FormFieldItem label="Last Name" isLast>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Legal last name"
                className="border-0 bg-transparent focus-visible:ring-0 px-0"
              />
            </FormFieldItem>
          </FormFieldGroup>

          {/* Date & Location */}
          <FormFieldGroup>
            <FormFieldItem label="Date of Birth">
              <DateInput
                value={dateOfBirth}
                onChange={setDateOfBirth}
              />
            </FormFieldItem>
            <FormFieldItem label="Country *" isLast>
              <CountrySelect
                value={location}
                onChange={setLocation}
                placeholder="Select country (required)"
              />
            </FormFieldItem>
          </FormFieldGroup>
        </div>
      )}

      {/* Step 2: Contact & Legal */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <FormFieldGroup>
            <FormFieldItem label="ID Number">
              <Input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="National ID or passport"
                className="border-0 bg-transparent focus-visible:ring-0 px-0"
              />
            </FormFieldItem>
            <FormFieldItem label="Phone">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="border-0 bg-transparent focus-visible:ring-0 px-0"
              />
            </FormFieldItem>
            <FormFieldItem label="Address" isLast>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address"
                className="border-0 bg-transparent focus-visible:ring-0 px-0"
              />
            </FormFieldItem>
          </FormFieldGroup>

          <FormFieldGroup>
            <FormFieldItem label="Management Entity">
              <Input
                value={managementEntity}
                onChange={(e) => setManagementEntity(e.target.value)}
                placeholder="Management company name"
                className="border-0 bg-transparent focus-visible:ring-0 px-0"
              />
            </FormFieldItem>
            <FormFieldItem label="IPI Number" isLast>
              <Input
                value={ipi}
                onChange={(e) => setIpi(e.target.value)}
                placeholder="International IPI number"
                className="border-0 bg-transparent focus-visible:ring-0 px-0"
              />
            </FormFieldItem>
          </FormFieldGroup>
        </div>
      )}

      {/* Step 3: Biography */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <FormFieldGroup>
            <FormFieldItem label="Biography" isLast>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about the artist's background, style, and achievements..."
                className="border-0 bg-transparent focus-visible:ring-0 px-0 min-h-[200px] resize-none"
              />
            </FormFieldItem>
          </FormFieldGroup>
        </div>
      )}

      {/* Step 4: Social Media */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {socialAccounts.map((account, index) => (
            <FormFieldGroup key={index}>
              <FormFieldItem label="Platform">
                <Select
                  value={account.platform}
                  onValueChange={(value) => updateSocialAccount(index, 'platform', value)}
                >
                  <SelectTrigger className="border-0 bg-transparent focus:ring-0 px-0">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spotify">Spotify</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </FormFieldItem>
              <FormFieldItem label="Username">
                <Input
                  value={account.username}
                  onChange={(e) => updateSocialAccount(index, 'username', e.target.value)}
                  placeholder="@username"
                  className="border-0 bg-transparent focus-visible:ring-0 px-0"
                />
              </FormFieldItem>
              <FormFieldItem label="URL" isLast>
                <div className="flex items-center gap-2">
                  <Input
                    value={account.url}
                    onChange={(e) => updateSocialAccount(index, 'url', e.target.value)}
                    placeholder="https://..."
                    className="border-0 bg-transparent focus-visible:ring-0 px-0"
                  />
                  {socialAccounts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSocialAccount(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </FormFieldItem>
            </FormFieldGroup>
          ))}

          <Button
            variant="outline"
            onClick={addSocialAccount}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Social Account
          </Button>
        </div>
      )}

      {/* Step 5: Distribution */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {distributionAccounts.map((account, index) => (
            <FormFieldGroup key={index}>
              <FormFieldItem label="Distributor">
                <Select
                  value={account.distributor}
                  onValueChange={(value) => updateDistributionAccount(index, 'distributor', value)}
                >
                  <SelectTrigger className="border-0 bg-transparent focus:ring-0 px-0">
                    <SelectValue placeholder="Select distributor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distrokid">DistroKid</SelectItem>
                    <SelectItem value="tunecore">TuneCore</SelectItem>
                    <SelectItem value="cdbaby">CD Baby</SelectItem>
                    <SelectItem value="amuse">Amuse</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormFieldItem>
              <FormFieldItem label="Service">
                <Select
                  value={account.service}
                  onValueChange={(value) => updateDistributionAccount(index, 'service', value)}
                >
                  <SelectTrigger className="border-0 bg-transparent focus:ring-0 px-0">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spotify">Spotify</SelectItem>
                    <SelectItem value="apple-music">Apple Music</SelectItem>
                    <SelectItem value="youtube-music">YouTube Music</SelectItem>
                    <SelectItem value="amazon-music">Amazon Music</SelectItem>
                    <SelectItem value="all">All Platforms</SelectItem>
                  </SelectContent>
                </Select>
              </FormFieldItem>
              <FormFieldItem label="Username">
                <Input
                  value={account.username}
                  onChange={(e) => updateDistributionAccount(index, 'username', e.target.value)}
                  placeholder="Account username"
                  className="border-0 bg-transparent focus-visible:ring-0 px-0"
                />
              </FormFieldItem>
              <FormFieldItem label="Email">
                <Input
                  value={account.email}
                  onChange={(e) => updateDistributionAccount(index, 'email', e.target.value)}
                  placeholder="account@email.com"
                  type="email"
                  className="border-0 bg-transparent focus-visible:ring-0 px-0"
                />
              </FormFieldItem>
              <FormFieldItem label="URL" isLast>
                <div className="flex items-center gap-2">
                  <Input
                    value={account.url}
                    onChange={(e) => updateDistributionAccount(index, 'url', e.target.value)}
                    placeholder="https://..."
                    className="border-0 bg-transparent focus-visible:ring-0 px-0"
                  />
                  {distributionAccounts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDistributionAccount(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </FormFieldItem>
            </FormFieldGroup>
          ))}

          <Button
            variant="outline"
            onClick={addDistributionAccount}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Distribution Account
          </Button>
        </div>
      )}
        </MultiStepForm>
      </div>
    </DashboardLayout>
  )
}
