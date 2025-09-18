import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Artist name is required' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // 1. Find the artist by name (case-insensitive)
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .ilike('name', `%${name}%`)
      .single();

    if (artistError) {
      if (artistError.code === 'PGRST116') { // "pgrst116" is the code for "more than one row" in PostgREST
        return NextResponse.json({ error: `Multiple artists found matching "${name}". Please be more specific.` }, { status: 404 });
      }
      return NextResponse.json({ error: `Artist "${name}" not found.` }, { status: 404 });
    }

    const artistId = artist.id;

    // 2. Fetch all related data in parallel
    const [ 
      socialAccountsRes,
      worksRes,
      contractParticipantsRes
    ] = await Promise.all([
      supabase.from('social_accounts').select('*').eq('artist_id', artistId),
      supabase.from('works').select('*').eq('artist_id', artistId),
      supabase.from('contract_participants').select('*, contracts(*)').eq('participant_id', artistId)
    ]);

    if (socialAccountsRes.error) throw new Error(`Error fetching social accounts: ${socialAccountsRes.error.message}`);
    if (worksRes.error) throw new Error(`Error fetching works: ${worksRes.error.message}`);
    if (contractParticipantsRes.error) throw new Error(`Error fetching contracts: ${contractParticipantsRes.error.message}`);

    const contracts = contractParticipantsRes.data.map((cp: any) => cp.contracts);
    const contractIds = contracts.map((c: any) => c.id);

    // 3. Fetch signatures for the found contracts
    let signatures = [];
    if (contractIds.length > 0) {
        const { data: signaturesData, error: signaturesError } = await supabase
            .from('signatures')
            .select('*')
            .in('contract_id', contractIds);
        if (signaturesError) throw new Error(`Error fetching signatures: ${signaturesError.message}`);
        signatures = signaturesData;
    }

    // 4. Assemble the full profile
    const fullProfile = {
      ...artist,
      social_accounts: socialAccountsRes.data,
      works: worksRes.data,
      contracts: contracts,
      signatures: signatures
    };

    return NextResponse.json(fullProfile);

  } catch (error: any) {
    console.error('[API /artists/full-profile Error]', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}