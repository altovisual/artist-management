'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ArtistRedirectWrapperProps {
  children: React.ReactNode
}

export function ArtistRedirectWrapper({ children }: ArtistRedirectWrapperProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [isArtist, setIsArtist] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUserType = async () => {
      try {
        console.log('🔍 ArtistRedirectWrapper: Checking user type...')
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.log('⚠️ No user found, showing dashboard')
          setIsChecking(false)
          return
        }

        console.log('👤 User found:', user.id)

        // Check user profile to see if they're an artist
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('user_type, artist_profile_id')
          .eq('user_id', user.id)
          .maybeSingle() // Use maybeSingle instead of single to handle no rows

        if (error) {
          console.log('❌ Error fetching user profile:')
          console.log('Error message:', error.message)
          console.log('Error code:', error.code)
          console.log('Error details:', error.details)
          
          // If error is about missing column, user needs to run migration
          if (error.code === '42703' || error.message?.includes('user_type')) {
            console.log('⚠️ Migration not run - user_type column missing')
          }
          
          setIsChecking(false)
          return
        }

        if (!profile) {
          console.log('⚠️ No profile found for user, showing dashboard')
          setIsChecking(false)
          return
        }

        console.log('📋 Profile found:', profile)

        // If user is an artist
        if (profile.user_type === 'artist') {
          console.log('🎵 User is an artist')
          setIsArtist(true)
          
          // If they have an artist profile, redirect to their profile page
          if (profile.artist_profile_id) {
            console.log('✅ Artist with profile, redirecting to:', `/artists/${profile.artist_profile_id}`)
            router.push(`/artists/${profile.artist_profile_id}`)
          } else {
            // If they don't have a profile yet, redirect to onboarding
            console.log('⚠️ Artist without profile, redirecting to onboarding')
            router.push('/auth/artist-onboarding')
          }
          return
        }

        console.log('💼 User is not an artist (type:', profile.user_type, '), showing dashboard')
        setIsChecking(false)
      } catch (error) {
        console.log('❌ Exception in checkUserType:', error)
        setIsChecking(false)
      }
    }

    checkUserType()
  }, [router, supabase])

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // If artist, don't render children (will redirect)
  if (isArtist) {
    return null
  }

  // For managers and others, show the dashboard
  return <>{children}</>
}
