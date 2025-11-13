import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { error: 'Artist name is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar si el artista ya existe
    const { data: existing } = await supabase
      .from('artists')
      .select('id')
      .eq('name', name)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: 'Artist already exists', artist: existing },
        { status: 200 }
      )
    }

    // Crear el artista
    const { data: artist, error } = await supabase
      .from('artists')
      .insert({
        name,
        genre: 'Unknown',
        bio: 'Artist profile',
        country: 'US',
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: 'Artist restored successfully',
      artist,
    })
  } catch (error: any) {
    console.error('Error restoring artist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to restore artist' },
      { status: 500 }
    )
  }
}
