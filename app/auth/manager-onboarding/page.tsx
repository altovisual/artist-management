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
import { User, Briefcase, Building } from 'lucide-react'

const AnimatedLogo = dynamic(() => import('@/components/animated-logo').then(mod => mod.AnimatedLogo), {
  ssr: false,
})

export default function ManagerOnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  // Manager profile fields
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [company, setCompany] = useState('')
  const [bio, setBio] = useState('')

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

  const handleCreateManagerProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!userId) {
      toast({ title: "Error", description: "User not authenticated", variant: "destructive" })
      setIsLoading(false)
      return
    }

    try {
      // Update user_profiles with manager information
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({
          username: username || fullName,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (profileUpdateError) {
        console.error('Error updating user profile:', profileUpdateError)
        toast({ 
          title: "Error", 
          description: profileUpdateError.message || "Failed to update profile", 
          variant: "destructive" 
        })
        setIsLoading(false)
        return
      }

      toast({ 
        title: "Success! 🎉", 
        description: `Welcome, ${username || fullName}! Your manager profile has been created.`,
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
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
          Create Your Manager Profile
        </div>
      </div>

      {/* Right Panel - Manager Profile Form */}
      <div className="flex-1 flex justify-center items-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="flex justify-center items-center mb-6">
            <IconoX width={40} height={40} className="mr-3" />
            <AnimatedTitle 
              text="Welcome, Manager!" 
              level={1} 
              className="text-4xl font-bold text-zinc-800" 
            />
          </div>
          
          <p className="text-zinc-600 mb-8 text-lg text-center">
            Let&apos;s set up your manager profile. You&apos;ll be able to manage multiple artists.
          </p>

          <form onSubmit={handleCreateManagerProfile} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-800 font-semibold text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your full name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-800 font-semibold text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Username *
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Your username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
              <p className="text-sm text-zinc-500">This is how you&apos;ll be identified on the platform</p>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-zinc-800 font-semibold text-base flex items-center gap-2">
                <Building className="w-4 h-4" />
                Company / Label
              </Label>
              <Input
                id="company"
                type="text"
                placeholder="Your company or label name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
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
                placeholder="Tell us about your experience and what you do..."
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
              {isLoading ? 'Creating Profile...' : 'Create My Manager Profile'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> As a manager, you can create and manage multiple artist profiles from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
