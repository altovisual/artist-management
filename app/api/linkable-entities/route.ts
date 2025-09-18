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

  if (!name) {
    return NextResponse.json({ error: 'Search name is required' }, { status: 400 });
  }

  const supabase = await createClient();
  const searchPattern = `%${name}%`;

  try {
    // Perform searches in parallel
    const [artistsRes, participantsRes, usersRes] = await Promise.all([
      // Search in artists by name, first_name, or last_name
      supabase
        .from('artists')
        .select('id, name, first_name, last_name')
        .or(`name.ilike.${searchPattern},first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`),

      // Search in participants by name or artistic_name
      supabase
        .from('participants')
        .select('id, name, artistic_name, email')
        .or(`name.ilike.${searchPattern},artistic_name.ilike.${searchPattern}`),
      
      // Search in auth.users by email
      supabase
        .from('users')
        .select('id, email, raw_user_meta_data')
        .ilike('email', searchPattern)
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