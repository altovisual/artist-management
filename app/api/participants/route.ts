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
    // Get a client from the pool
    client = await pool.connect();

    // Execute the query
    const { rows } = await client.query('SELECT * FROM public.participants');

    // Return the data
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch participants from the database' }, { status: 500 });
  } finally {
    // Make sure to release the client back to the pool
    if (client) {
      client.release();
    }
  }
}

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    let {
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
      user_id // Added user_id
    } = body;

    // Basic validation
    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required fields.' }, { status: 400 });
    }

    // Convert empty string to null for optional fields
    if (bank_info === "") bank_info = null;
    if (user_id === "") user_id = null;


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
      name, email, type, id_number, address, country, phone, bank_info,
      artistic_name, management_entity, ipi, user_id
    ];

    const { rows } = await client.query(query, values);

    revalidatePath('/management/participants');

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Database Error on POST:', error);
    console.error(error);
    return NextResponse.json({ error: 'Failed to create participant' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
