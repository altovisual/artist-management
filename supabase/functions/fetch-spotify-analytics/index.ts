
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID')!
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET')!

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getApplicationAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Failed to get application access token: ${errorBody.error_description || JSON.stringify(errorBody)}`);
  }

  const data = await response.json();
  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000; // Cache for 5 minutes less than expiry
  return cachedAccessToken;
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
    const accessToken = await getApplicationAccessToken();

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
        // If no artist_id is provided in the body, we cannot proceed.
        // In the previous version, it tried to get the current user's artist_id.
        // For public analytics, we must have an artist_id provided.
        throw new Error('Artist ID is required for public analytics.');
    }

    const [artistDetails, topTracksData, albumsData] = await Promise.all([
      fetchFromSpotify(`artists/${targetArtistId}`, accessToken),
      fetchFromSpotify(`artists/${targetArtistId}/top-tracks?market=US`, accessToken), // Using a default market for simplicity
      fetchFromSpotify(`artists/${targetArtistId}/albums?include_groups=album,single,appears_on,compilation&limit=50`, accessToken)
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
