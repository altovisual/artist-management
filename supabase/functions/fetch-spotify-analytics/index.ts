
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID')!
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET')!

// ... (helper functions remain the same) ...
async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  if (!response.ok) {
    const errorBody = await response.json()
    throw new Error(`Failed to refresh access token: ${errorBody.error_description}`)
  }
  return await response.json()
}

async function fetchFromSpotify(endpoint: string, accessToken: string) {
  const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch from Spotify ${endpoint}: ${await response.text()}`);
  }
  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const userSupabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await userSupabaseClient.auth.getUser()
    if (!user) throw new Error('User not found')

    // Get artist_id from request body if provided, otherwise use current user's artist_id
    let targetArtistId: string;
    let body;
    try {
        body = await req.json();
    } catch (e) {
        // If body is not JSON, it's likely a GET request from the original analytics page
        // In this case, body will be undefined, and we proceed to use the current user's artist_id
    }
    const { artist_id: bodyArtistId } = body || {};

    if (bodyArtistId) {
        targetArtistId = bodyArtistId;
    } else {
        // Fetch artist_id for the current user
        const { data: currentUserArtist, error: currentUserArtistError } = await supabaseAdmin
            .from('artists')
            .select('id')
            .eq('user_id', user.id)
            .single();
        if (currentUserArtistError || !currentUserArtist) {
            throw new Error('Could not find artist profile for the current user.');
        }
        targetArtistId = currentUserArtist.id;
    }

    const { data: artistProfile, error: profileError } = await supabaseAdmin
      .from('artists')
      .select('spotify_artist_id')
      .eq('id', targetArtistId)
      .single();

    if (profileError) throw new Error('Could not fetch artist profile for the given ID.');
    if (!artistProfile.spotify_artist_id) {
      throw new Error('Spotify Artist ID is not set for this artist. Please add it in their profile page.');
    }
    const spotifyArtistId = artistProfile.spotify_artist_id;

    const { data: account, error: accountError } = await supabaseAdmin
      .from('distribution_accounts')
      .select('id, access_token, refresh_token, token_expires_at')
      .eq('analytics_status', 'connected')
      .limit(1)
      .single()

    if (accountError || !account) {
      throw new Error('No connected Spotify account found.')
    }

    let { access_token, refresh_token, token_expires_at } = account;

    if (new Date(token_expires_at) < new Date(Date.now() + 5 * 60 * 1000)) {
      const newTokens = await refreshAccessToken(refresh_token!)
      access_token = newTokens.access_token
      if (newTokens.refresh_token) refresh_token = newTokens.refresh_token;
      const new_expires_at = new Date(Date.now() + newTokens.expires_in * 1000).toISOString()

      await supabaseAdmin
        .from('distribution_accounts')
        .update({ access_token, refresh_token, token_expires_at: new_expires_at })
        .eq('id', account.id)
    }

    const userData = await fetchFromSpotify('me', access_token!)
    const market = userData.country || 'US';

    const [artistDetails, topTracksData, albumsData] = await Promise.all([
      fetchFromSpotify(`artists/${spotifyArtistId}`, access_token!),
      fetchFromSpotify(`artists/${spotifyArtistId}/top-tracks?market=${market}`, access_token!),
      fetchFromSpotify(`artists/${spotifyArtistId}/albums?include_groups=album,single,appears_on,compilation&limit=50`, access_token!)
    ]);

    const responsePayload = {
      artist: {
        name: artistDetails.name,
        followers: artistDetails.followers.total,
        imageUrl: artistDetails.images[0]?.url,
        genres: artistDetails.genres,
      },
      topTracks: topTracksData.tracks,
      albums: albumsData.items,
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Edge Function Error:", error); // Log the full error
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
