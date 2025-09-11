import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a connection pool to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();

    // Execute the query
    const { rows } = await client.query('SELECT * FROM public.templates');

    // Return the data
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates from the database' }, { status: 500 });
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
    const { type, language, template_html, version, jurisdiction } = body;

    // Basic validation
    if (!type || !language || !template_html || !version) {
      return NextResponse.json({ error: 'type, language, template_html and version are required fields.' }, { status: 400 });
    }

    client = await pool.connect();
    const query = `
      INSERT INTO public.templates (type, language, template_html, version, jurisdiction)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [type, language, template_html, version, jurisdiction];

    const { rows } = await client.query(query, values);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Database Error on POST:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
