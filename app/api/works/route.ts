import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  try {
    let query = supabase.from('projects').select('*');

    if (name) {
      query = query.ilike('name', `%${name}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching works: ${error.message}`);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[API /works Error]', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { name, type, artist_id, alternative_title, iswc } = body;

    // Validate required fields
    if (!name || !type || !artist_id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, and artist_id are required' },
        { status: 400 }
      );
    }

    // Insert the new work into the projects table
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          type,
          artist_id,
          alternative_title: alternative_title || null,
          iswc: iswc || null,
        }
      ])
      .select();

    if (error) {
      throw new Error(`Error creating work: ${error.message}`);
    }

    return NextResponse.json(data[0], { status: 201 });

  } catch (error: any) {
    console.error('[API /works POST Error]', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
