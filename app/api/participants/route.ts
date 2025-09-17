import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

// Create a connection pool to the database
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

export async function GET(request: Request) {
  let client;
  try {
    client = await pool.connect();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    let query = 'SELECT * FROM public.participants';
    const values = [];

    if (name) {
      query += ' WHERE name ILIKE $1';
      values.push(`%${name}%`);
    }

    const { rows } = await client.query(query, values);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch participants from the database' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const {
      name,
      email,
      type,
      id_number,
      address,
      country,
      phone,
      bank_info,
      artistic_name,
      management_entity,
      ipi,
      user_id
    } = body;

    // Basic validation
    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required fields.' }, { status: 400 });
    }

    client = await pool.connect();
    const query = `
      INSERT INTO public.participants (
        name, email, type, id_number, address, country, phone, bank_info,
        artistic_name, management_entity, ipi, user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const values = [
      name,
      email ?? null,
      type,
      id_number ?? null,
      address ?? null,
      country ?? null,
      phone ?? null,
      bank_info ?? null,
      artistic_name ?? null,
      management_entity ?? null,
      ipi ?? null,
      user_id ?? null
    ];

    const { rows } = await client.query(query, values);

    revalidatePath('/management/participants');

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Database Error on POST:', error);
    return NextResponse.json({ error: 'Failed to create participant' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
