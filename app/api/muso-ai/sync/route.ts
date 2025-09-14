import { NextResponse, NextRequest } from 'next/server';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

const MUSO_AI_API_KEY = process.env.MUSO_AI_API_KEY;
const MUSO_AI_BASE_URL = 'https://api.developer.muso.ai/v4';

export async function GET(request: NextRequest) {
  if (!MUSO_AI_API_KEY) {
    return NextResponse.json({ error: 'MUSO_AI_API_KEY is not set.' }, { status: 500 });
  }

  let client;
  const syncResults: any[] = [];

  try {
    client = await pool.connect();

    const { rows: profiles } = await client.query('SELECT artist_id, muso_ai_profile_id FROM public.muso_ai_profiles WHERE muso_ai_profile_id IS NOT NULL');

    if (profiles.length === 0) {
      return NextResponse.json({ message: 'No linked Muso.AI profiles found to sync.' });
    }

    for (const profile of profiles) {
      try {
        const musoAiResponse = await fetch(`${MUSO_AI_BASE_URL}/profile/${profile.muso_ai_profile_id}`,
         {
          headers: {
            'x-api-key': MUSO_AI_API_KEY,
            'Content-Type': 'application/json',
          },
        });

        if (!musoAiResponse.ok) {
          const errorText = await musoAiResponse.text();
          syncResults.push({ artistId: profile.artist_id, status: 'failed', error: `Muso.AI Error (Status ${musoAiResponse.status}): ${errorText}` });
          continue;
        }

        const musoAiData = await musoAiResponse.json();
        const popularity = musoAiData.data?.popularity || 0;
        const profileData = musoAiData.data; // Get the full data object

        // Pass the full profile data to our internal API
        const saveResponse = await fetch(`${request.nextUrl.origin}/api/muso-ai/profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            artistId: profile.artist_id, 
            musoAiProfileId: profile.muso_ai_profile_id, 
            popularity, 
            profile_data: profileData // Pass the whole data object
          }),
        });

        if (!saveResponse.ok) {
          const errorBody = await saveResponse.json();
          syncResults.push({ artistId: profile.artist_id, status: 'failed', error: errorBody.error || 'Internal save error' });
          continue;
        }

        syncResults.push({ artistId: profile.artist_id, status: 'success', popularity });

      } catch (innerError: any) {
        syncResults.push({ artistId: profile.artist_id, status: 'failed', error: innerError.message || 'Unknown error' });
      }
    }

    revalidatePath('/dashboard/analytics');
    return NextResponse.json({ message: 'Muso.AI sync complete', results: syncResults });

  } catch (error) {
    console.error('Error during Muso.AI sync:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to sync Muso.AI data', details: errorMessage, results: syncResults }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}