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
