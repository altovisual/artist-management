import { NextResponse } from 'next/server';
import { Client } from 'pg';

const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

export async function GET() {
  const client = new Client({ connectionString });

  try {
    await client.connect();

    const query = `
      (
        SELECT
          id,
          COALESCE(raw_user_meta_data->>'full_name', email) as name,
          'user' as type,
          email,
          NULL as country,
          id as user_id
        FROM auth.users
      )
      UNION ALL
      (
        SELECT
          a.id,
          a.name,
          'artist' as type,
          u.email,
          a.country,
          a.user_id
        FROM public.artists a
        LEFT JOIN auth.users u ON a.user_id = u.id
      )
      ORDER BY type, name;
    `;
    
    const { rows } = await client.query(query);

    return NextResponse.json(rows, { status: 200 });

  } catch (error: any) {
    console.error('Database Error fetching linkable entities:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
