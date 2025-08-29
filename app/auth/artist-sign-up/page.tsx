'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function ArtistSignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [artistName, setArtistName] = useState('')
  const [genre, setGenre] = useState('')
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
    <div className="w-full min-h-screen flex flex-col lg:grid lg:grid-cols-2 xl:min-h-screen">
      <div className="flex flex-col items-center justify-center flex-grow relative">
        <div className="absolute top-4 left-4">
          <Image src="/mi-logo.svg" alt="Logo" width={100} height={32} />
        </div>
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Artist Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Create your artist account and profile
            </p>
          </div>
          <form onSubmit={handleArtistSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="artist-name">Artist Name</Label>
              <Input
                id="artist-name"
                type="text"
                placeholder="Your Artist Name"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                type="text"
                placeholder="Pop, Rock, Hip Hop..."
                required
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing up...' : 'Sign Up as Artist'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <video
          src="/intro-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
        />
        
      </div>
    </div>
  )
}
