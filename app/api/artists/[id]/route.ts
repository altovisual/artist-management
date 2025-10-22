import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, context: any) {
  const { id } = context.params;
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('artists')
      .select(`
        id,
        name,
        genre,
        country,
        bio,
        user_id
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error(`Error fetching artist ${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const { id } = context.params;
  const supabase = await createClient();

  try {
    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que el artista existe y pertenece al usuario (o es admin)
    const { data: artist, error: fetchError } = await supabase
      .from('artists')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Verificar permisos (solo el dueño o admin pueden eliminar)
    const isAdmin = user.app_metadata?.role === 'admin';
    const isOwner = artist.user_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this artist' }, { status: 403 });
    }

    // Eliminar el artista (las relaciones se eliminarán en cascada según la configuración de la BD)
    const { error: deleteError } = await supabase
      .from('artists')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting artist:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Artist deleted successfully' 
    }, { status: 200 });

  } catch (error: any) {
    console.error(`Error deleting artist ${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
