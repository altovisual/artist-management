'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import IconoX from '@/public/icono-x.svg'

const AnimatedLogo = dynamic(() => import('@/components/animated-logo').then(mod => mod.AnimatedLogo), {
  ssr: false,
})
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { AnimatedTitle } from '@/components/animated-title';

export default function ArtistSignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [artistName, setArtistName] = useState('')
  const [genre, setGenre] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleArtistSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({ title: "Sign Up Error", description: "Passwords do not match.", variant: "destructive" })
      setIsLoading(false)
      return
    }

    try {
      // First, sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        toast({ title: "Sign Up Error", description: signUpError.message, variant: "destructive" })
        setIsLoading(false)
        return
      }

      // If sign up is successful, create the artist profile
      if (signUpData.user) {
        const { error: artistError } = await supabase.from('artists').insert({
          user_id: signUpData.user.id,
          name: artistName,
          genre: genre,
          email: email, // Assuming email is also stored in artist profile
          first_name: firstName,
          last_name: lastName,
        })

        if (artistError) {
          // If artist profile creation fails, you might want to delete the user or handle it
          console.error("Error creating artist profile:", artistError.message)
          toast({ title: "Artist Profile Error", description: artistError.message, variant: "destructive" })
          // Optionally, delete the user if artist profile creation fails
          // await supabase.auth.admin.deleteUser(signUpData.user.id)
        } else {
          router.push('/auth/sign-up-success')
        }
      } else {
        toast({ title: "Sign Up Error", description: "User data not returned after sign up.", variant: "destructive" })
      }
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
          src="/intro-video.mp4"
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

      {/* Right Panel - Artist Sign Up Form */}
      <div className="flex-1 flex justify-center items-center bg-white p-8">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center items-center mb-6">
            <IconoX width={40} height={40} className="mr-3" />
            <AnimatedTitle text="Artist Sign Up" level={1} className="text-4xl font-bold text-zinc-800" />
          </div>
          <p className="text-zinc-600 mb-8 text-lg">
            Create your artist account and profile
          </p>
          <form onSubmit={handleArtistSignUp} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="artist-name" className="text-left text-zinc-800 font-semibold text-base">Artist Name</Label>
              <Input
                id="artist-name"
                type="text"
                placeholder="Your Artist Name"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firstName" className="text-left text-zinc-800 font-semibold text-base">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Your First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName" className="text-left text-zinc-800 font-semibold text-base">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Your Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="genre" className="text-left text-zinc-800 font-semibold text-base">Genre</Label>
              <Input
                id="genre"
                type="text"
                placeholder="Pop, Rock, Hip Hop..."
                required
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-[#e1348f] focus:border-transparent"
              />
            </div>
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
              {isLoading ? 'Signing up...' : 'Sign Up as Artist'}
            </Button>
          </form>
          <div className="text-zinc-600 text-sm">
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