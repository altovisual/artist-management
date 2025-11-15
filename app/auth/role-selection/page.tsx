'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AnimatedTitle } from '@/components/animated-title'
import dynamic from 'next/dynamic'
import IconoX from '@/public/icono-x.svg'

const AnimatedLogo = dynamic(() => import('@/components/animated-logo').then(mod => mod.AnimatedLogo), {
  ssr: false,
})

type UserRole = 'artist' | 'manager' | 'other'

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('')
  const router = useRouter()

  const handleContinue = () => {
    if (!selectedRole) return
    
    // Store the selected role in sessionStorage to use in the next step
    sessionStorage.setItem('selected_role', selectedRole)
    
    // Navigate to sign up page
    router.push('/auth/sign-up')
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
        <div className="absolute inset-0 bg-black opacity-80"></div>
        
        <div className="relative z-10">
          <AnimatedLogo variant="dark" width={150} height={40} />
        </div>
        <div className="relative z-10 text-2xl font-semibold">
          Your Artist Management Solution
        </div>
      </div>

      {/* Right Panel - Role Selection */}
      <div className="flex-1 flex justify-center items-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center items-center mb-6">
            <IconoX width={40} height={40} className="mr-3" />
          </div>
          
          <AnimatedTitle 
            text="Are you an Artist or a Manager?" 
            level={1} 
            className="text-4xl font-bold text-zinc-800 text-center mb-4" 
          />
          
          <p className="text-zinc-600 mb-8 text-lg text-center">
            Select one
          </p>

          <RadioGroup 
            value={selectedRole} 
            onValueChange={(value) => setSelectedRole(value as UserRole)}
            className="space-y-4 mb-8"
          >
            <div className="flex items-center space-x-3 p-4 border-2 border-zinc-200 rounded-lg hover:border-[#e1348f] transition-colors cursor-pointer">
              <RadioGroupItem value="artist" id="artist" className="border-zinc-400" />
              <Label 
                htmlFor="artist" 
                className="text-lg font-medium text-zinc-800 cursor-pointer flex-1"
              >
                Artist
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border-2 border-zinc-200 rounded-lg hover:border-[#e1348f] transition-colors cursor-pointer">
              <RadioGroupItem value="manager" id="manager" className="border-zinc-400" />
              <Label 
                htmlFor="manager" 
                className="text-lg font-medium text-zinc-800 cursor-pointer flex-1"
              >
                Manager
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border-2 border-zinc-200 rounded-lg hover:border-[#e1348f] transition-colors cursor-pointer">
              <RadioGroupItem value="other" id="other" className="border-zinc-400" />
              <Label 
                htmlFor="other" 
                className="text-lg font-medium text-zinc-800 cursor-pointer flex-1"
              >
                Other
              </Label>
            </div>
          </RadioGroup>

          <Button 
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full p-3 border-none rounded-lg bg-[#e1348f] text-white text-lg font-semibold cursor-pointer hover:bg-[#c72d7a] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </Button>

          <div className="mt-6 text-zinc-600 text-base text-center">
            Have an account?{" "}
            <Link href="/auth/login" className="text-[#e1348f] font-bold hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
