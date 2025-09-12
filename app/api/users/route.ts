import { NextResponse } from 'next/server';
import { Client } from 'pg';

// Debido a un bug persistente en la caché de la API local de Supabase,
// nos conectamos directamente a la base de datos, ignorando el cliente de Supabase.
const connectionString = process.env.SUPABASE_DB_CONNECTION_STRING;

export async function GET() {
  const client = new Client({ connectionString });

  try {
    await client.connect();

    // Ejecutamos la consulta SQL directamente contra el esquema 'auth'
    const res = await client.query('SELECT id, email, raw_user_meta_data FROM auth.users;');
    const users = res.rows;

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.raw_user_meta_data?.full_name || user.email,
    }));

    return NextResponse.json(formattedUsers, { status: 200 });

  } catch (error: any) {
    console.error('Error en la conexión directa a la BD:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // Nos aseguramos de cerrar la conexión
    await client.end();
  }
}
