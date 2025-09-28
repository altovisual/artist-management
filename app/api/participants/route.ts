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
    console.log('📥 Received participant data:', body);

    // Clean up user_id field - convert empty strings and invalid UUIDs to null
    if (body.user_id === '' || body.user_id === null || body.user_id === undefined) {
      body.user_id = null;
    }

    // Clean up other empty string fields
    Object.keys(body).forEach(key => {
      if (body[key] === '') {
        body[key] = null;
      }
    });

    console.log('📝 Processed participant data:', body);

    // The RLS policy will handle the admin check automatically.
    const { data, error } = await supabase
      .from('participants')
      .insert(body) // Pass the body directly, Supabase client handles mapping
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error creating participant:', {
        message: error.message,
        details: error.details,
        code: error.code,
        hint: error.hint,
        body: body
      });
      
      // Handle specific error codes
      let userFriendlyMessage = error.message;
      
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.message.includes('email')) {
          userFriendlyMessage = `El email '${body.email}' ya está registrado. Por favor usa un email diferente.`;
        } else {
          userFriendlyMessage = 'Ya existe un registro con estos datos. Verifica que no esté duplicado.';
        }
      } else if (error.code === '23503') {
        // Foreign key constraint violation
        if (error.message.includes('user_id')) {
          userFriendlyMessage = 'El usuario seleccionado no es válido. Intenta crear el participante sin vincular a un usuario específico.';
        } else {
          userFriendlyMessage = 'Referencia inválida. Verifica que todos los datos relacionados existan.';
        }
      }
      
      // Return the detailed error to the client for debugging
      return NextResponse.json({
        error: 'Database error',
        message: userFriendlyMessage,
        details: error.details,
        code: error.code,
        hint: error.hint,
        originalMessage: error.message
      }, { status: 400 });
    }

    revalidatePath('/management/participants');
    return NextResponse.json(data, { status: 201 });

  } catch (e: any) {
    console.error('Unexpected error creating participant:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
