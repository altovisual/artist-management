
import { NextResponse, NextRequest } from 'next/server';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

export async function GET(request: NextRequest) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artist_id');

    if (!artistId) {
      return NextResponse.json({ error: 'artist_id is required.' }, { status: 400 });
    }

    client = await pool.connect();
    // SELECT * will automatically include the new profile_data column
    const { rows } = await client.query(
      'SELECT * FROM public.muso_ai_profiles WHERE artist_id = $1',
      [artistId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Muso.AI profile not found for this artist.' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error on GET /api/muso-ai/profiles:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch Muso.AI profile data', details: errorMessage }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(request: Request) {
  let client;
  try {
    // Destructure the new profile_data field
    const { artistId, musoAiProfileId, popularity, profile_data } = await request.json();

    // profile_data is optional for the initial link, but required for sync
    if (!artistId || !musoAiProfileId) {
      return NextResponse.json({ error: 'artistId and musoAiProfileId are required.' }, { status: 400 });
    }

    client = await pool.connect();

    const existingProfile = await client.query(
      'SELECT id FROM public.muso_ai_profiles WHERE artist_id = $1',
      [artistId]
    );

    if (existingProfile.rows.length > 0) {
      // Update existing profile
      const updateQuery = `
        UPDATE public.muso_ai_profiles
        SET popularity = $1, last_updated = NOW(), muso_ai_profile_id = $2, profile_data = $3
        WHERE artist_id = $4
        RETURNING *;
      `;
      const { rows } = await client.query(updateQuery, [popularity, musoAiProfileId, profile_data, artistId]);
      revalidatePath('/dashboard/analytics');
      return NextResponse.json(rows[0]);
    } else {
      // Insert new profile
      const insertQuery = `
        INSERT INTO public.muso_ai_profiles (artist_id, muso_ai_profile_id, popularity, profile_data)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const { rows } = await client.query(insertQuery, [artistId, musoAiProfileId, popularity, profile_data]);
      revalidatePath('/dashboard/analytics');
      return NextResponse.json(rows[0], { status: 201 });
    }
  } catch (error) {
    console.error('Database Error on POST /api/muso-ai/profiles:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to save Muso.AI profile data', details: errorMessage }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
