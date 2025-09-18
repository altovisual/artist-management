import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('signatures')
      .select(`
        *,
        contract:contracts(internal_reference),
        participant:participants(name)
      `);

    if (error) {
      throw new Error(`Error fetching signatures: ${error.message}`);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[API /signatures Error]', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}