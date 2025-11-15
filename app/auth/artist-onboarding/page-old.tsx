'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { AnimatedTitle } from '@/components/animated-title'
import dynamic from 'next/dynamic'
import IconoX from '@/public/icono-x.svg'
import { Music, User, MapPin, Calendar } from 'lucide-react'

const AnimatedLogo = dynamic(() => import('@/components/animated-logo').then(mod => mod.AnimatedLogo), {
  ssr: false,
})

export default function ArtistOnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  // Artist profile fields
  const [artistName, setArtistName] = useState('')
  const [stageName, setStageName] = useState('')
  const [genre, setGenre] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [birthDate, setBirthDate] = useState('')

  useEffect(() => {
    // Check if user is authenticated
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

  const handleCreateArtistProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!userId) {
      toast({ title: "Error", description: "User not authenticated", variant: "destructive" })
      setIsLoading(false)
      return
    }

    try {
      // Get user's sign up date from auth.users
      const { data: { user } } = await supabase.auth.getUser()
      const userCreatedAt = user?.created_at || new Date().toISOString()
      
      console.log('📅 Using user sign up date as artist created_at:', userCreatedAt)
      
      // Create artist profile with the same created_at as user sign up
      // Note: Using 'name' for the artist name (stage_name doesn't exist in schema)
      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .insert({
          name: stageName || artistName, // Use stage name as the main name
          genre: genre,
          country: location || 'Unknown', // 'country' is required, use location or default
          bio: bio || '',
          user_id: userId,
          created_at: userCreatedAt, // Use sign up date
        })
        .select()
        .single()

      if (artistError) {
        console.error('Error creating artist profile:', artistError)
        toast({ 
          title: "Error", 
          description: artistError.message || "Failed to create artist profile", 
          variant: "destructive" 
        })
        setIsLoading(false)
        return
      }

      // Update user_profiles with artist_profile_id
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({
          artist_profile_id: artistData.id,
          username: stageName || artistName,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (profileUpdateError) {
        console.error('Error updating user profile:', profileUpdateError)
        // Continue anyway, this can be fixed later
      }

      toast({ 
        title: "Success! 🎉", 
        description: `Welcome, ${stageName || artistName}! Your artist profile has been created.`,
      })

      // Redirect to artist profile page
      setTimeout(() => {
        router.push(`/artists/${artistData.id}`)
      }, 1500)

    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast({ title: "Error", description: error.message, variant: "destructive" })
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

      {/* Right Panel - Artist Profile Form */}
      <div className="flex-1 flex justify-center items-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="flex justify-center items-center mb-6">
            <IconoX width={40} height={40} className="mr-3" />
            <AnimatedTitle 
              text="Welcome, Artist!" 
              level={1} 
              className="text-4xl font-bold text-zinc-800" 
            />
          </div>
          
          <p className="text-zinc-600 mb-8 text-lg text-center">
            Let&apos;s create your artist profile. This will be your identity in the platform.
          </p>

          <form onSubmit={handleCreateArtistProfile} className="space-y-6">
            {/* Artist Name */}
            <div className="space-y-2">
              <Label htmlFor="artistName" className="text-zinc-800 font-semibold text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Legal Name *
              </Label>
              <Input
                id="artistName"
                type="text"
                placeholder="Your legal name"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
            </div>

            {/* Stage Name */}
            <div className="space-y-2">
              <Label htmlFor="stageName" className="text-zinc-800 font-semibold text-base flex items-center gap-2">
                <Music className="w-4 h-4" />
                Stage Name / Artist Name *
              </Label>
              <Input
                id="stageName"
                type="text"
                placeholder="Your artist name (e.g., ECBY)"
                required
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
              <p className="text-sm text-zinc-500">This is how you&apos;ll be known on the platform</p>
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label htmlFor="genre" className="text-zinc-800 font-semibold text-base flex items-center gap-2">
                <Music className="w-4 h-4" />
                Genre *
              </Label>
              <Input
                id="genre"
                type="text"
                placeholder="e.g., Hip Hop, R&B, Pop"
                required
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-zinc-800 font-semibold text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-zinc-800 font-semibold text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Birth Date
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-zinc-800 font-semibold text-base">
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your music..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent resize-none"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full p-3 border-none rounded-lg bg-[#e1348f] text-white text-lg font-semibold cursor-pointer hover:bg-[#c72d7a] transition-colors duration-200" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Profile...' : 'Create My Artist Profile'}
            </Button>
          </form>

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
