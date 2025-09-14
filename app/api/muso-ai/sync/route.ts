import { NextResponse, NextRequest } from 'next/server';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

const MUSO_AI_API_KEY = process.env.MUSO_AI_API_KEY;
const MUSO_AI_BASE_URL = 'https://api.muso.ai/v1';

export async function GET(request: NextRequest) {
  if (!MUSO_AI_API_KEY) {
    return NextResponse.json({ error: 'MUSO_AI_API_KEY is not set.' }, { status: 500 });
  }

  let client;
  try {
    client = await pool.connect();

    // Fetch all artists from our database
    const { rows: artists } = await client.query('SELECT id, spotify_artist_id FROM public.artists WHERE spotify_artist_id IS NOT NULL');

    if (artists.length === 0) {
      return NextResponse.json({ message: 'No artists with Spotify IDs found to sync.' });
    }

    const syncResults = [];

    for (const artist of artists) {
      try {
        // Call Muso.AI API to get profile details
        const musoAiResponse = await fetch(`${MUSO_AI_BASE_URL}/profiles/${artist.spotify_artist_id}`, {
          headers: {
            'Authorization': `Bearer ${MUSO_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (!musoAiResponse.ok) {
          const errorText = await musoAiResponse.text(); // Get raw text
          console.error(`Muso.AI API error for artist ${artist.id}: Status ${musoAiResponse.status}, Response: ${errorText}`);
          syncResults.push({ artistId: artist.id, status: 'failed', error: `Muso.AI API error: Status ${musoAiResponse.status}` });
          continue;
        }

        const musoAiData = await musoAiResponse.json();
        const popularity = musoAiData.popularity; // Assuming popularity is directly available
        const musoAiProfileId = musoAiData.id; // Muso.AI's internal profile ID

        // Call our internal API to save/update the data
        const saveResponse = await fetch(`${request.nextUrl.origin}/api/muso-ai/profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ artistId: artist.id, musoAiProfileId, popularity }),
        });

        if (!saveResponse.ok) {
          const errorBody = await saveResponse.json();
          console.error(`Failed to save Muso.AI data for artist ${artist.id}:`, errorBody);
          syncResults.push({ artistId: artist.id, status: 'failed', error: errorBody.error || 'Internal save error' });
          continue;
        }

        syncResults.push({ artistId: artist.id, status: 'success', popularity });

      } catch (innerError: any) {
        console.error(`Error processing artist ${artist.id}:`, innerError);
        syncResults.push({ artistId: artist.id, status: 'failed', error: innerError.message || 'Unknown error' });
      }
    }

    revalidatePath('/dashboard/analytics'); // Revalidate analytics page after sync
    return NextResponse.json({ message: 'Muso.AI sync complete', results: syncResults });

  } catch (error) {
    console.error('Error during Muso.AI sync:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to sync Muso.AI data', details: errorMessage }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
