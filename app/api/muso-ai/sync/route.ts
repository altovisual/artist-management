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

    // CORRECTED LOGIC: Fetch all profiles from our muso_ai_profiles table
    const { rows: profiles } = await client.query('SELECT artist_id, muso_ai_profile_id FROM public.muso_ai_profiles WHERE muso_ai_profile_id IS NOT NULL');

    if (profiles.length === 0) {
      return NextResponse.json({ message: 'No linked Muso.AI profiles found to sync.' });
    }

    const syncResults = [];

    for (const profile of profiles) {
      try {
        // CORRECTED LOGIC: Use the muso_ai_profile_id to call the Muso.AI API
        const musoAiResponse = await fetch(`${MUSO_AI_BASE_URL}/profiles/${profile.muso_ai_profile_id}`,
         {
          headers: {
            'Authorization': `Bearer ${MUSO_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (!musoAiResponse.ok) {
          const errorText = await musoAiResponse.text();
          console.error(`Muso.AI API error for artist ${profile.artist_id}: Status ${musoAiResponse.status}, Response: ${errorText}`);
          syncResults.push({ artistId: profile.artist_id, status: 'failed', error: `Muso.AI API error: Status ${musoAiResponse.status}` });
          continue;
        }

        const musoAiData = await musoAiResponse.json();
        // Assuming the API returns popularity directly. This might need adjustment based on the actual API response structure.
        const popularity = musoAiData.popularity || 0;

        // Call our internal API to save/update the data
        const saveResponse = await fetch(`${request.nextUrl.origin}/api/muso-ai/profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ artistId: profile.artist_id, musoAiProfileId: profile.muso_ai_profile_id, popularity }),
        });

        if (!saveResponse.ok) {
          const errorBody = await saveResponse.json();
          console.error(`Failed to save Muso.AI data for artist ${profile.artist_id}:`, errorBody);
          syncResults.push({ artistId: profile.artist_id, status: 'failed', error: errorBody.error || 'Internal save error' });
          continue;
        }

        syncResults.push({ artistId: profile.artist_id, status: 'success', popularity });

      } catch (innerError: any) {
        console.error(`Error processing artist ${profile.artist_id}:`, innerError);
        syncResults.push({ artistId: profile.artist_id, status: 'failed', error: innerError.message || 'Unknown error' });
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