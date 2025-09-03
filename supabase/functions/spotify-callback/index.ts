import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID')
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET')
const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')?.replace('localhost', '127.0.0.1')}/functions/v1/spotify-callback`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  )

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!code) throw new Error('Authorization code not found.')
    if (!state) throw new Error('State parameter not found.')

    // 1. Verify the state and get the user and account IDs
    const { data: stateData, error: stateError } = await supabaseAdmin
      .from('oauth_state')
      .select('user_id, distribution_account_id')
      .eq('state', state)
      .single()

    if (stateError) throw new Error('Invalid or expired state. Please try connecting again.')
    
    const { distribution_account_id } = stateData

    // 2. Exchange authorization code for an access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.json()
      throw new Error(`Failed to fetch access token: ${errorBody.error_description}`)
    }

    const tokens = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokens

    // 3. Securely save tokens to the distribution_accounts table
    const expires_at = new Date(Date.now() + expires_in * 1000).toISOString()

    const { error: updateError } = await supabaseAdmin
      .from('distribution_accounts')
      .update({
        access_token: access_token, // TODO: Encrypt before saving
        refresh_token: refresh_token, // TODO: Encrypt before saving
        token_expires_at: expires_at,
        analytics_status: 'connected',
        last_synced_at: new Date().toISOString()
      })
      .eq('id', distribution_account_id)

    if (updateError) throw new Error(`Failed to save tokens: ${updateError.message}`)

    // 4. Clean up the state entry
    await supabaseAdmin.from('oauth_state').delete().eq('state', state)

    // 5. Redirect user back to the frontend application
    const redirectUrl = `${Deno.env.get('SITE_URL')}/dashboard/analytics?status=success`
    return Response.redirect(redirectUrl, 303)

  } catch (error) {
    console.error(error)
    const redirectUrl = `${Deno.env.get('SITE_URL')}/dashboard/analytics?status=error&message=${encodeURIComponent(error.message)}`
    return Response.redirect(redirectUrl, 303)
  }
})
