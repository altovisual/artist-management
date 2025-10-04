import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  const supabase = await createClient();

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const showArchived = searchParams.get('showArchived') === 'true';
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('signatures')
      .select(`
        *,
        contract:contracts(
          internal_reference,
          status,
          projects(name)
        )
      `, { count: 'exact' });

    // Filter by archived status
    if (!showArchived) {
      query = query.or('archived.is.null,archived.eq.false');
    }

    // Filter by deleted (never show deleted)
    query = query.is('deleted_at', null);

    // Filter by status if provided
    if (status && status !== 'all') {
      if (status === 'pending') {
        query = query.in('status', ['sent', 'pending']);
      } else {
        query = query.eq('status', status);
      }
    }

    // Filter by search query
    if (search) {
      query = query.or(`document_name.ilike.%${search}%,signer_email.ilike.%${search}%,signer_name.ilike.%${search}%,signature_request_id.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching signatures: ${error.message}`);
    }

    // Transformar los datos para el dashboard
    const transformedData = data?.map(signature => ({
      ...signature,
      contract: signature.contract ? {
        internal_reference: signature.contract.internal_reference,
        status: signature.contract.status,
        work_name: signature.contract.projects?.name || 'Sin título'
      } : null
    })) || [];

    return NextResponse.json({
      data: transformedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

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