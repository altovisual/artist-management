import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

export async function POST(request: Request) {
  let client;
  try {
    const { artistId, musoAiProfileId, popularity } = await request.json();

    if (!artistId || !musoAiProfileId || popularity === undefined) {
      return NextResponse.json({ error: 'artistId, musoAiProfileId, and popularity are required.' }, { status: 400 });
    }

    client = await pool.connect();

    // Check if profile already exists
    const existingProfile = await client.query(
      'SELECT id FROM public.muso_ai_profiles WHERE artist_id = $1',
      [artistId]
    );

    if (existingProfile.rows.length > 0) {
      // Update existing profile
      const updateQuery = `
        UPDATE public.muso_ai_profiles
        SET popularity = $1, last_updated = NOW(), muso_ai_profile_id = $2
        WHERE artist_id = $3
        RETURNING *;
      `;
      const { rows } = await client.query(updateQuery, [popularity, musoAiProfileId, artistId]);
      revalidatePath('/dashboard/analytics'); // Revalidate analytics page
      return NextResponse.json(rows[0]);
    } else {
      // Insert new profile
      const insertQuery = `
        INSERT INTO public.muso_ai_profiles (artist_id, muso_ai_profile_id, popularity)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const { rows } = await client.query(insertQuery, [artistId, musoAiProfileId, popularity]);
      revalidatePath('/dashboard/analytics'); // Revalidate analytics page
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
