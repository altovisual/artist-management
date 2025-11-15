'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import dynamic from 'next/dynamic'
import IconoX from '@/public/icono-x.svg'
import { DatePickerField } from '@/components/ui/datepicker'

import { AnimatedTitle } from '@/components/animated-title';

const AnimatedLogo = dynamic(() => import('@/components/animated-logo').then(mod => mod.AnimatedLogo), {
  ssr: false,
})

type UserRole = 'artist' | 'manager' | 'other'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    // Get the selected role from sessionStorage
    const role = sessionStorage.getItem('selected_role') as UserRole
    if (!role) {
      // If no role selected, redirect to role selection
      router.push('/auth/role-selection')
      return
    }
    setUserRole(role)
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({ title: "Sign Up Error", description: "Passwords do not match.", variant: "destructive" })
      setIsLoading(false)
      return
    }

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            date_of_birth: dateOfBirth,
            user_type: userRole,
          },
        },
      })

      if (authError) {
        toast({ title: "Sign Up Error", description: authError.message, variant: "destructive" })
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        toast({ title: "Error", description: "Failed to create user", variant: "destructive" })
        setIsLoading(false)
        return
      }

      // Create user profile with the selected role
      console.log('📝 Creating user profile with data:', {
        user_id: authData.user.id,
        user_type: userRole,
        onboarding_completed: false,
      })

      // Create user profile with user_type
      const profileInsertData = {
        user_id: authData.user.id,
        user_type: userRole,
        onboarding_completed: false,
      }
      
      console.log('🔍 Creating user profile:', profileInsertData)
      
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileInsertData)
        .select()
      
      if (profileError) {
        console.log('❌ Error creating user profile:')
        console.log('  Message:', profileError.message)
        console.log('  Code:', profileError.code)
        console.log('  Details:', profileError.details)
        
        // Show error but continue to email confirmation
        toast({ 
          title: "Profile Creation Warning", 
          description: "Account created but profile incomplete. Contact support if issues persist.",
          variant: "default",
          duration: 5000,
        })
      } else {
        console.log('✅ User profile created successfully!')
        console.log('  User ID:', profileData[0]?.user_id)
        console.log('  User Type:', profileData[0]?.user_type)
        console.log('  Profile ID:', profileData[0]?.id)
      }

      // Don't clear the role yet - we'll need it after email confirmation
      // sessionStorage will keep the role for after they confirm their email
      
      // All users go to email confirmation page first
      // After confirming email, they'll be redirected to their specific onboarding
      router.push('/auth/sign-up-success')
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen">
      {/* Left Panel with Video Background and Overlay */}
      <div className="relative flex-1 hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden">
        <video
          src="/video-home.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-80"></div> {/* Overlay */}
        
        <div className="relative z-10">
          <AnimatedLogo variant="dark" width={150} height={40} />
        </div>
        <div className="relative z-10 text-2xl font-semibold">
          Your Artist Management Solution
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="flex-1 flex justify-center items-center bg-white p-8">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center items-center mb-6">
            <IconoX width={40} height={40} className="mr-3" />
            <AnimatedTitle text="Sign Up" level={1} className="text-4xl font-bold text-zinc-800" />
          </div>
          <p className="text-zinc-600 mb-4 text-lg">
            Enter your details below to create your account
          </p>
          {userRole && (
            <div className="mb-6 p-3 bg-[#e1348f]/10 border border-[#e1348f]/20 rounded-lg">
              <p className="text-sm text-zinc-700">
                Creating account as: <span className="font-bold capitalize">{userRole}</span>
              </p>
            </div>
          )}
          <form onSubmit={handleSignUp} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-left text-zinc-800 font-semibold text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dateOfBirth" className="text-left text-zinc-800 font-semibold text-base">Fecha de Nacimiento</Label>
              <DatePickerField date={dateOfBirth} onDateChange={setDateOfBirth} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-left text-zinc-800 font-semibold text-base">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="text-left text-zinc-800 font-semibold text-base">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
            </div>
            <Button type="submit" className="w-full p-3 border-none rounded-lg bg-[#e1348f] text-white text-lg font-semibold cursor-pointer hover:bg-[#c72d7a] transition-colors duration-200" disabled={isLoading}>
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-6 text-zinc-600 text-base">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#e1348f] font-bold hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
