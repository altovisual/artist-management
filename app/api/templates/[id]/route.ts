import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a connection pool to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request, context: any) {
  const { id } = context.params;
  let client;

  try {
    client = await pool.connect();
    const query = 'SELECT * FROM public.templates WHERE id = $1';
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PATCH(request: Request, context: any) {
  const { id } = context.params;
  let client;

  try {
    const body = await request.json();

    // Whitelist of updatable fields
    const allowedFields = ['type', 'language', 'template_html', 'version', 'jurisdiction'];

    const updateFields = Object.keys(body).filter(field => allowedFields.includes(field));

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update.' }, { status: 400 });
    }

    const setClause = updateFields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
    const values = updateFields.map(field => body[field]);
    values.push(id); // Add the id for the WHERE clause

    const query = `
      UPDATE public.templates
      SET ${setClause}
      WHERE id = $${values.length}
      RETURNING *;
    `;

    client = await pool.connect();
    const { rows } = await client.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error('Database Error on PATCH:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function DELETE(request: Request, context: any) {
  const { id } = context.params;
  let client;

  try {
    client = await pool.connect();
    const query = 'DELETE FROM public.templates WHERE id = $1 RETURNING *';
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error on DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}