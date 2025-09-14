
import { NextResponse, NextRequest } from 'next/server';

const MUSO_AI_API_KEY = process.env.MUSO_AI_API_KEY;
const MUSO_AI_BASE_URL = 'https://api.developer.muso.ai/v4';

export async function GET(request: NextRequest) {
  if (!MUSO_AI_API_KEY) {
    return NextResponse.json({ error: 'MUSO_AI_API_KEY is not set.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profile_id');

  if (!profileId) {
    return NextResponse.json({ error: 'profile_id is required.' }, { status: 400 });
  }

  try {
    const musoAiResponse = await fetch(`${MUSO_AI_BASE_URL}/profile/${profileId}/collaborators`,
      {
        headers: {
          'x-api-key': MUSO_AI_API_KEY,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 } // Cache the response for 1 hour
      });

    if (!musoAiResponse.ok) {
      const errorText = await musoAiResponse.text();
      console.error(`Muso.AI collaborators API error: Status ${musoAiResponse.status}, Response: ${errorText}`);
      return NextResponse.json({ error: `Muso.AI API Error: ${errorText}` }, { status: musoAiResponse.status });
    }

    const data = await musoAiResponse.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error fetching Muso.AI collaborators:', error);
    return NextResponse.json({ error: 'Failed to fetch Muso.AI collaborators', details: error.message }, { status: 500 });
  }
}
