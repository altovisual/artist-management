import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID')
const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')?.replace('localhost', '127.0.0.1')}/functions/v1/spotify-callback`

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError) throw userError

    // Get the distribution_account_id from the request body
    const bodyText = await req.text()
    console.log('Raw body text:', bodyText)
    const { distribution_account_id } = JSON.parse(bodyText)
    if (!distribution_account_id) {
      throw new Error('Missing distribution_account_id in request body.')
    }

    // Generate a random state string and store it with the user_id and account_id
    const state = crypto.randomUUID()
    const { error: stateError } = await supabaseClient
      .from('oauth_state')
      .insert({ 
        state: state,
        user_id: user.id,
        distribution_account_id: distribution_account_id
      })

    if (stateError) throw stateError

    // Construct the Spotify authorization URL
    const scope = 'user-read-email user-top-read' // Add more scopes as needed
    const authUrl = new URL('https://accounts.spotify.com/authorize')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', SPOTIFY_CLIENT_ID!)
    authUrl.searchParams.set('scope', scope)
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.set('state', state)

    return new Response(JSON.stringify({ redirect_url: authUrl.toString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
