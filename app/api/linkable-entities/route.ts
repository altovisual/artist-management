import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Define a unified structure for the search results
interface LinkableEntity {
  id: string;
  name: string;
  type: 'artist' | 'participant' | 'user';
  email: string | null;
  country: string | null;
  user_id: string | null;
  id_number: string | null;
  address: string | null;
  phone: string | null;
  bank_info: any | null; // Can be jsonb
  artistic_name: string | null;
  management_entity: string | null;
  ipi: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  const supabase = await createClient();

  try {
    // Define queries
    let artistsQuery = supabase.from('artists').select('id, name, first_name, last_name, country, user_id, participants(*)');
    let participantsQuery = supabase.from('participants').select('*'); // Select all participant fields
    let usersQuery = supabase.from('users_view').select('id, email, raw_user_meta_data');

    // If a search name is provided, add the search filters
    if (name) {
      const searchPattern = `%${name}%`;
      artistsQuery = artistsQuery.or(`name.ilike.${searchPattern},first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`);
      participantsQuery = participantsQuery.or(`name.ilike.${searchPattern},artistic_name.ilike.${searchPattern}`);
      usersQuery = usersQuery.ilike('email', searchPattern);
    }

    // Perform searches in parallel
    const [artistsRes, participantsRes, usersRes] = await Promise.all([
      artistsQuery,
      participantsQuery,
      usersQuery
    ]);

    if (artistsRes.error) throw new Error(`Error fetching artists: ${artistsRes.error.message}`);
    if (participantsRes.error) throw new Error(`Error fetching participants: ${participantsRes.error.message}`);
    if (usersRes.error) throw new Error(`Error fetching users: ${usersRes.error.message}`);

    // Consolidate and format results
    const consolidatedResults: LinkableEntity[] = [];

    artistsRes.data?.forEach(artist => {
      const participantData = Array.isArray(artist.participants) ? artist.participants[0] : artist.participants;
      consolidatedResults.push({
        id: artist.id,
        name: artist.name || `${artist.first_name} ${artist.last_name}`.trim(),
        type: 'artist',
        email: participantData?.email || null,
        country: artist.country || participantData?.country || null,
        user_id: artist.user_id || participantData?.user_id || null,
        id_number: participantData?.id_number || null,
        address: participantData?.address || null,
        phone: participantData?.phone || null,
        bank_info: participantData?.bank_info || null,
        artistic_name: participantData?.artistic_name || artist.name || null,
        management_entity: participantData?.management_entity || null,
        ipi: participantData?.ipi || null,
      });
    });

    participantsRes.data?.forEach(participant => {
      // Avoid duplicating artists that are also participants
      if (!consolidatedResults.some(r => r.id === participant.id)) {
        consolidatedResults.push({
          id: participant.id,
          name: participant.name || participant.artistic_name,
          type: 'participant',
          email: participant.email || null,
          country: participant.country || null,
          user_id: participant.user_id || null,
          id_number: participant.id_number || null,
          address: participant.address || null,
          phone: participant.phone || null,
          bank_info: participant.bank_info || null,
          artistic_name: participant.artistic_name || null,
          management_entity: participant.management_entity || null,
          ipi: participant.ipi || null,
        });
      }
    });

    usersRes.data?.forEach(user => {
       // Avoid duplicating if user is already listed as an artist or participant
       if (!consolidatedResults.some(r => r.id === user.id)) {
        consolidatedResults.push({
          id: user.id,
          name: user.raw_user_meta_data?.name || user.email,
          type: 'user',
          email: user.email || null,
          country: null,
          user_id: user.id,
          id_number: null,
          address: null,
          phone: null,
          bank_info: null,
          artistic_name: null,
          management_entity: null,
          ipi: null,
        });
      }
    });
    
    // Remove duplicates based on ID, giving preference to more specific types like 'artist'
    const uniqueResults = Array.from(new Map(consolidatedResults.map(item => [item.id, item])).values());


    return NextResponse.json(uniqueResults);

  } catch (error: any) {
    console.error('[API /linkable-entities Error]', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}