import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Define a unified structure for the search results
interface LinkableEntity {
  id: string;
  name: string;
  type: 'artist' | 'participant' | 'user';
  context: string; // e.g., email, artistic_name, or role
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  

  const supabase = await createClient();

  try {
    // Define queries
    let artistsQuery = supabase.from('artists').select('id, name, first_name, last_name');
    let participantsQuery = supabase.from('participants').select('id, name, artistic_name, email');
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
      consolidatedResults.push({
        id: artist.id,
        name: artist.name || `${artist.first_name} ${artist.last_name}`.trim(),
        type: 'artist',
        context: `Artista`
      });
    });

    participantsRes.data?.forEach(participant => {
      // Avoid duplicating artists that are also participants
      if (!consolidatedResults.some(r => r.id === participant.id && r.type === 'artist')) {
        consolidatedResults.push({
          id: participant.id,
          name: participant.name || participant.artistic_name,
          type: 'participant',
          context: `Participante (${participant.email || 'sin email'})`
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
          context: `Usuario del sistema (${user.email})`
        });
      }
    });
    
    // Remove duplicates based on ID and Type, giving preference to more specific types like 'artist'
    const uniqueResults = Array.from(new Map(consolidatedResults.map(item => [`${item.id}-${item.type}`, item])).values());

    return NextResponse.json(uniqueResults);

  } catch (error: any) {
    console.error('[API /linkable-entities Error]', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}