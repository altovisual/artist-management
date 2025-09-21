import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('signatures')
      .select(`
        *,
        contract:contracts(internal_reference)
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

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const { contract_id, signer_email } = await request.json();

    if (!contract_id || !signer_email) {
      return NextResponse.json({ error: 'contract_id and signer_email are required' }, { status: 400 });
    }

    // In a real app, you'd integrate with a signature provider (e.g., DocuSign)
    // and get a real signature_request_id. For now, we'll generate a UUID.
    const signature_request_id = uuidv4();

    const { data, error } = await supabase
      .from('signatures')
      .insert([
        {
          contract_id,
          signer_email,
          signature_request_id,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating signature:', error);
      throw new Error(`Failed to create signature in database: ${error.message}`);
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error: any) {
    console.error('[API /signatures POST Error]', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}