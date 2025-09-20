import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  const supabase = await createClient();
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    let query = supabase.from('participants').select('*');

    if (name) {
      query = query.ilike('name', `%${name}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch participants from the database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const body = await request.json();

    // FIX: If user_id is an empty string from the form, convert it to null for the DB
    if (body.user_id === '') {
      body.user_id = null;
    }

    // The RLS policy will handle the admin check automatically.
    const { data, error } = await supabase
      .from('participants')
      .insert(body) // Pass the body directly, Supabase client handles mapping
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating participant:', error); // Log the whole error object
      // Return the detailed error to the client for debugging
      return NextResponse.json({
        message: error.message,
        details: error.details,
        code: error.code,
      }, { status: 400 });
    }

    revalidatePath('/management/participants');
    return NextResponse.json(data, { status: 201 });

  } catch (e: any) {
    console.error('Unexpected error creating participant:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
