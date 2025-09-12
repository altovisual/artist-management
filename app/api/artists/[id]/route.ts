import { NextResponse } from 'next/server';
import { Client } from 'pg';

const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

export async function GET(request: Request, context: any) {
  const { id } = context.params;
  const client = new Client({ connectionString });

  try {
    await client.connect();

    const query = `
      SELECT
        a.id,
        a.name,
        a.genre,
        a.country,
        a.bio,
        a.user_id,
        u.email
      FROM public.artists a
      LEFT JOIN auth.users u ON a.user_id = u.id
      WHERE a.id = $1;
    `;
    
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });

  } catch (error: any) {
    console.error(`Database Error fetching artist ${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
