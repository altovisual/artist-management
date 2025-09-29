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
    const mockCredits = {
      data: {
        items: [
          {
            track: {
              id: 'track-1',
              title: 'Impaciente',
              spotifyPreviewUrl: 'https://p.scdn.co/mp3-preview/4uLU6hMCjMI75M1A2tKUQC',
              duration: 195000,
              releaseDate: '2023-08-15'
            },
            album: {
              albumArt: 'https://picsum.photos/400/400?random=1001',
              name: 'Impaciente - Single',
              releaseYear: 2023
            },
            artists: [{ name: 'Borngud' }],
            credits: [{ child: 'Producer' }, { child: 'Songwriter' }],
            streams: 2500000,
            popularity: 75
          },
          {
            track: {
              id: 'track-2',
              title: 'De Lejos',
              spotifyPreviewUrl: 'https://p.scdn.co/mp3-preview/2takcwOaAZWiXQijPHIx7B',
              duration: 210000,
              releaseDate: '2023-06-20'
            },
            album: {
              albumArt: 'https://picsum.photos/400/400?random=1002',
              name: 'De Lejos - Single',
              releaseYear: 2023
            },
            artists: [{ name: 'Borngud' }],
            credits: [{ child: 'Producer' }, { child: 'Mixing' }],
            streams: 1800000,
            popularity: 68
          },
          {
            track: {
              id: 'track-3',
              title: 'Me Amas',
              spotifyPreviewUrl: 'https://p.scdn.co/mp3-preview/3xKsf2YOz4JqCjMI75M1A2',
              duration: 188000,
              releaseDate: '2023-04-10'
            },
            album: {
              albumArt: 'https://picsum.photos/400/400?random=1003',
              name: 'Me Amas - Single',
              releaseYear: 2023
            },
            artists: [{ name: 'Borngud' }],
            credits: [{ child: 'Songwriter' }, { child: 'Vocalist' }],
            streams: 3200000,
            popularity: 72
          },
          {
            track: {
              id: 'track-4',
              title: 'Como Tu',
              spotifyPreviewUrl: 'https://p.scdn.co/mp3-preview/5yMnp3QRt6KrDkNJ86N2B3',
              duration: 203000,
              releaseDate: '2023-02-14'
            },
            album: {
              albumArt: 'https://picsum.photos/400/400?random=1004',
              name: 'Como Tu - Single',
              releaseYear: 2023
            },
            artists: [{ name: 'Borngud' }],
            credits: [{ child: 'Producer' }, { child: 'Arranger' }],
            streams: 2100000,
            popularity: 65
          },
          {
            track: {
              id: 'track-5',
              title: 'Real',
              spotifyPreviewUrl: 'https://p.scdn.co/mp3-preview/6zPqr4STu7LsElOK97O3C4',
              duration: 225000,
              releaseDate: '2022-12-05'
            },
            album: {
              albumArt: 'https://picsum.photos/400/400?random=1005',
              name: 'Real - Single',
              releaseYear: 2022
            },
            artists: [{ name: 'Borngud' }],
            credits: [{ child: 'Producer' }, { child: 'Mixing' }],
            streams: 2800000,
            popularity: 70
          },
          {
            track: {
              id: 'track-6',
              title: 'Cuidala',
              spotifyPreviewUrl: 'https://p.scdn.co/mp3-preview/7aBst5UVw8MtFmPL08P4D5',
              duration: 192000,
              releaseDate: '2022-10-18'
            },
            album: {
              albumArt: 'https://picsum.photos/400/400?random=1006',
              name: 'Cuidala - Single',
              releaseYear: 2022
            },
            artists: [{ name: 'Borngud' }],
            credits: [{ child: 'Songwriter' }, { child: 'Producer' }],
            streams: 1950000,
            popularity: 63
          }
        ],
        totalCount: 24
      }
    };
    return NextResponse.json(mockCredits);
  }

  try {
    // NEW: Pass limit and offset to Muso.AI API
    const musoAiResponse = await fetch(`${MUSO_AI_BASE_URL}/profile/${profileId}/credits?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'x-api-key': MUSO_AI_API_KEY,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 } // Cache the response for 1 hour
      });

    if (!musoAiResponse.ok) {
      const errorText = await musoAiResponse.text();
      console.error(`Muso.AI credits API error: Status ${musoAiResponse.status}, Response: ${errorText}`);
      return NextResponse.json({ error: `Muso.AI API Error: ${errorText}` }, { status: musoAiResponse.status });
    }

    const data = await musoAiResponse.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error fetching Muso.AI credits:', error);
    return NextResponse.json({ error: 'Failed to fetch Muso.AI credits', details: error.message }, { status: 500 });
  }
}