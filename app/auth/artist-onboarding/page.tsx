'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import IconoX from '@/public/icono-x.svg'

const AnimatedLogo = dynamic(() => import('@/components/animated-logo').then(mod => mod.AnimatedLogo), {
  ssr: false,
})
import { PRO_ORGANIZATIONS, ARTIST_ROLES } from '@/lib/management-companies'

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

export default function ArtistOnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [userId, setUserId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUserId(user.id)
    }
    checkUser()
  }, [router, supabase.auth])

  // Step 1: Basic Information
  const [name, setName] = useState('')
  const [genre, setGenre] = useState('')
  const [role, setRole] = useState('') // Nuevo: Rol del artista
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>()
  const [location, setLocation] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>('')

  // Step 2: Contact & Legal
  const [idNumber, setIdNumber] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [managementEntity, setManagementEntity] = useState('')
  const [managementEmail, setManagementEmail] = useState('') // Nuevo: Email de la compañía
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

    try {
      // Upload profile image if exists
      let profileImageUrl = null
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        // Try to upload, if bucket doesn't exist, handle gracefully
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('artist-images')
          .upload(fileName, profileImage)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          // Continue without image if bucket doesn't exist
          toast({
            title: 'Warning',
            description: 'Could not upload image. Artist will be created without profile picture.',
            variant: 'default'
          })
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('artist-images')
            .getPublicUrl(fileName)

          profileImageUrl = publicUrl
        }
      }

      // Verify userId is available
      if (!userId) {
        throw new Error('User ID not found. Please log in again.')
      }

      console.log('📝 Creating artist for user:', userId)

      // Create artist - only include fields that have values
      const artistPayload: any = {
        name,
        genre,
        country: location || 'us', // Default to 'us' if no country selected (required field)
        user_id: userId, // IMPORTANT: Link artist to user
      }

      // Add optional fields only if they have values
      if (bio) artistPayload.bio = bio
      if (role) artistPayload.role = role
      if (firstName) artistPayload.first_name = firstName
      if (lastName) artistPayload.last_name = lastName
      if (dateOfBirth) artistPayload.date_of_birth = dateOfBirth.toISOString()
      if (profileImageUrl) artistPayload.image_url = profileImageUrl
      if (idNumber) artistPayload.id_number = idNumber
      if (address) artistPayload.address = address
      if (phone) artistPayload.phone = phone
      if (managementEntity) artistPayload.management_entity = managementEntity
      if (managementEmail) artistPayload.management_email = managementEmail
      if (ipi) artistPayload.ipi = ipi

      console.log('Creating artist with payload:', artistPayload)

      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .insert(artistPayload)
        .select()
        .single()

      if (artistError) {
        console.log('❌ Artist creation error:')
        console.log('  Message:', artistError.message)
        console.log('  Code:', artistError.code)
        console.log('  Details:', artistError.details)
        console.log('  Hint:', artistError.hint)
        
        // Check if it's an RLS error
        if (artistError.message?.includes('row-level security') || artistError.code === '42501') {
          throw new Error('Permission denied. Please run ARREGLAR_RLS_ARTISTS.sql in Supabase to fix permissions.')
        }
        
        throw new Error(artistError.message || 'Failed to create artist')
      }

      if (!artistData) {
        throw new Error('No artist data returned')
      }

      // Insert social accounts
      const validSocialAccounts = socialAccounts.filter(acc => acc.platform && acc.username)
      if (validSocialAccounts.length > 0) {
        const socialData = validSocialAccounts.map(acc => ({
          artist_id: artistData.id,
          platform: acc.platform,
          username: acc.username,
          url: acc.url
        }))

        await supabase.from('social_accounts').insert(socialData)
      }

      // Insert distribution accounts
      const validDistAccounts = distributionAccounts.filter(acc => acc.distributor && acc.service)
      if (validDistAccounts.length > 0) {
        const distData = validDistAccounts.map(acc => ({
          artist_id: artistData.id,
          distributor: acc.distributor,
          service: acc.service,
          username: acc.username,
          email: acc.email,
          url: acc.url
        }))

        await supabase.from('distribution_accounts').insert(distData)
      }

      toast({
        title: 'Success!',
        description: 'Artist created successfully',
      })

      // Update user_profiles with artist_profile_id
      await supabase
        .from('user_profiles')
        .update({
          artist_profile_id: artistData.id,
          username: name,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      // Redirect to artist profile
      router.push(`/artists/${artistData.id}`)
    } catch (error: any) {
      console.error('Error creating artist:', error)
      const errorMessage = error?.message || error?.error_description || 'Failed to create artist. Please check all required fields.'
      toast({
        title: 'Error Creating Artist',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen">
      {/* Left Panel with Video Background */}
      <div className="relative flex-1 hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden">
        <video
          src="/video-home.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-80"></div>
        
        <div className="relative z-10">
          <AnimatedLogo variant="dark" width={150} height={40} />
        </div>
        <div className="relative z-10 text-2xl font-semibold">
          Create Your Artist Profile
        </div>
      </div>

      {/* Right Panel - Multi-Step Form */}
      <div className="flex-1 flex justify-center items-start bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-4xl py-8">
          <div className="flex justify-center items-center mb-6">
            <IconoX width={40} height={40} className="mr-3" />
            <h1 className="text-4xl font-bold text-zinc-800">Welcome, Artist!</h1>
          </div>
          
          <p className="text-zinc-600 mb-8 text-lg text-center">
            Let&apos;s create your artist profile. This will be your identity in the platform.
          </p>

          <MultiStepForm
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onComplete={handleComplete}
          canGoNext={canGoNext() && !isLoading}
          isLastStep={currentStep === steps.length - 1}
          mode="create"
          allowStepNavigation={false}
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
            <FormFieldItem label="Genre *">
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
            <FormFieldItem label="Role" isLast>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="border-0 bg-transparent focus:ring-0 px-0">
                  <SelectValue placeholder="Select artist role" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {ARTIST_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
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
            <FormFieldItem label="PRO / Performing Rights Organization">
              <Select value={managementEntity} onValueChange={setManagementEntity}>
                <SelectTrigger className="border-0 bg-transparent focus:ring-0 px-0">
                  <SelectValue placeholder="Select PRO (BMI, ASCAP, etc.)" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {PRO_ORGANIZATIONS.map((pro) => (
                    <SelectItem key={pro} value={pro}>
                      {pro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldItem>
            <FormFieldItem label="PRO Email">
              <Input
                value={managementEmail}
                onChange={(e) => setManagementEmail(e.target.value)}
                placeholder="artist@ascap.com"
                type="email"
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

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> As an artist, you can only have one profile. This profile will be directly linked to your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
