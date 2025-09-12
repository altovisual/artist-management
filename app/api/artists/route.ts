import { NextResponse } from 'next/server';
import { Client } from 'pg';

// Using direct connection to bypass local Supabase API cache issues
const connectionString = process.env.SUPABASE_DB_CONNECTION_STRING;

export async function GET() {
  const client = new Client({ connectionString });

  try {
    await client.connect();

    // Fetch all artists
    const res = await client.query('SELECT id, name, user_id FROM public.artists ORDER BY name;');
    const artists = res.rows;

    return NextResponse.json(artists, { status: 200 });

  } catch (error: any) {
    console.error('Database Error fetching artists:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
