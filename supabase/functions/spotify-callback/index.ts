import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID')!
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET')!
const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/spotify-callback`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // This is now the artistId
    const error = url.searchParams.get('error')

    if (error) {
      throw new Error(`Spotify error: ${error}`)
    }

    if (!code) {
      throw new Error('Missing authorization code.')
    }

    if (!state) {
      throw new Error('Missing state parameter (artistId).')
    }

    const artistId = state; // State is now artistId

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Exchange authorization code for tokens
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.json()
      throw new Error(`Failed to get tokens: ${errorBody.error_description || JSON.stringify(errorBody)}`)
    }

    const { access_token, refresh_token, expires_in } = await response.json()
    const token_expires_at = new Date(Date.now() + expires_in * 1000).toISOString()

    // Check if an entry for this artist and provider already exists
    const { data: existingAccount, error: fetchError } = await supabaseAdmin
      .from('distribution_accounts')
      .select('id')
      .eq('artist_id', artistId)
      .eq('provider', 'spotify')
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      throw new Error(`Database fetch error: ${fetchError.message}`)
    }

    const accountData = {
      artist_id: artistId,
      provider: 'spotify',
      access_token: access_token,
      refresh_token: refresh_token,
      token_expires_at: token_expires_at,
      analytics_status: 'connected',
    };

    if (existingAccount) {
      // Update existing account
      const { error: updateError } = await supabaseAdmin
        .from('distribution_accounts')
        .update(accountData)
        .eq('id', existingAccount.id)

      if (updateError) throw new Error(`Failed to update account: ${updateError.message}`)
    } else {
      // Insert new account
      const { error: insertError } = await supabaseAdmin
        .from('distribution_accounts')
        .insert([accountData])

      if (insertError) throw new Error(`Failed to insert account: ${insertError.message}`)
    }

    // Redirect to dashboard with success status
    return Response.redirect(`${Deno.env.get('SITE_URL')}/dashboard?status=success`, 302)

  } catch (error) {
    console.error('Error in spotify-callback function:', error)
    // Redirect to dashboard with error status
    return Response.redirect(`${Deno.env.get('SITE_URL')}/dashboard?status=error&message=${encodeURIComponent(error.message)}`, 302)
  }
})