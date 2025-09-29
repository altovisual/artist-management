import { NextResponse, NextRequest } from 'next/server';

const MUSO_AI_API_KEY = process.env.MUSO_AI_API_KEY;
const MUSO_AI_BASE_URL = 'https://api.developer.muso.ai/v4';

export async function GET(request: NextRequest) {
  if (!MUSO_AI_API_KEY) {
    return NextResponse.json({ error: 'MUSO_AI_API_KEY is not set.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profile_id');
  // NEW: Get limit and offset from search params
  const limit = searchParams.get('limit') || '20'; // Default to 20
  const offset = searchParams.get('offset') || '0'; // Default to 0

  if (!profileId) {
    return NextResponse.json({ error: 'profile_id is required.' }, { status: 400 });
  }

  // Handle mock profile ID for development
  if (profileId === 'mock-id' || profileId === 'mock-profile-id') {
    const mockCollaborators = {
      data: {
        items: [
          {
            id: 'collab-1',
            name: 'Alex Producer',
            avatarUrl: 'https://picsum.photos/150/150?random=4001',
            popularity: 78,
            collaborationsCount: 15,
            commonCredits: ['Producer', 'Mixing'],
            totalTracks: 45,
            genres: ['Hip Hop', 'Urban']
          },
          {
            id: 'collab-2',
            name: 'Maria Songwriter',
            avatarUrl: 'https://picsum.photos/150/150?random=4002',
            popularity: 82,
            collaborationsCount: 8,
            commonCredits: ['Songwriter', 'Vocalist'],
            totalTracks: 32,
            genres: ['Latin', 'Pop']
          },
          {
            id: 'collab-3',
            name: 'DJ Carlos',
            avatarUrl: 'https://picsum.photos/150/150?random=4003',
            popularity: 65,
            collaborationsCount: 12,
            commonCredits: ['Producer', 'Arranger'],
            totalTracks: 28,
            genres: ['Urban', 'R&B']
          },
          {
            id: 'collab-4',
            name: 'Sofia Engineer',
            avatarUrl: 'https://picsum.photos/150/150?random=4004',
            popularity: 71,
            collaborationsCount: 10,
            commonCredits: ['Mixing', 'Mastering'],
            totalTracks: 38,
            genres: ['Hip Hop', 'Latin']
          },
          {
            id: 'collab-5',
            name: 'Miguel Beats',
            avatarUrl: 'https://picsum.photos/150/150?random=4005',
            popularity: 69,
            collaborationsCount: 18,
            commonCredits: ['Producer', 'Songwriter'],
            totalTracks: 52,
            genres: ['Urban', 'Pop']
          }
        ],
        totalCount: 12
      }
    };
    return NextResponse.json(mockCollaborators);
  }

  try {
    // NEW: Pass limit and offset to Muso.AI API
    const musoAiResponse = await fetch(`${MUSO_AI_BASE_URL}/profile/${profileId}/collaborators?limit=${limit}&offset=${offset}`,
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