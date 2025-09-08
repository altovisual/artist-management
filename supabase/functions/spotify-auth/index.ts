import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID')
// The redirect URI must be registered in the Spotify Developer Dashboard
const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/spotify-callback`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json();
    console.log('Backend (spotify-auth): Received request body:', requestBody); // Debug log
    const { artistId } = requestBody;

    if (!artistId) {
      throw new Error('Missing artistId in request body.')
    }

    console.log('Backend (spotify-auth): SPOTIFY_CLIENT_ID:', SPOTIFY_CLIENT_ID); // Debug log
    if (!SPOTIFY_CLIENT_ID) {
        throw new Error('SPOTIFY_CLIENT_ID environment variable is not set.');
    }

    // The artistId will be used as the state parameter. 
    // It will be sent back by Spotify so we know which artist to link the credentials to.
    const state = artistId;

    const scope = 'user-read-email user-top-read';
    const authUrl = new URL('https://accounts.spotify.com/authorize')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', SPOTIFY_CLIENT_ID!)
    authUrl.searchParams.set('scope', scope)
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.set('state', state)

    return new Response(JSON.stringify({ authorizationUrl: authUrl.toString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in spotify-auth function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
