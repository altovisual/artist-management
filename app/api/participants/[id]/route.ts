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
    const query = 'SELECT * FROM public.participants WHERE id = $1';
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch participant' }, { status: 500 });
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

    const allowedFields = [
      'name', 'email', 'type', 'id_number', 'address', 'country', 'phone', 'bank_info',
      'artistic_name',      // New field
      'management_entity',  // New field
      'ipi'                 // New field
    ];

    const updateFields = Object.keys(body).filter(field => allowedFields.includes(field));

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update.' }, { status: 400 });
    }

    const setClause = updateFields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
    const values = updateFields.map(field => {
      // Convert empty string bank_info to null if the column is JSON/JSONB type
      if (field === 'bank_info' && body[field] === "") {
        return null;
      }
      return body[field];
    });
    values.push(id); // Add the id for the WHERE clause

    const query = `
      UPDATE public.participants
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING *;
    `;

    client = await pool.connect();
    const { rows } = await client.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error('Database Error on PATCH:', error);
    return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 });
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
    const query = 'DELETE FROM public.participants WHERE id = $1 RETURNING *';
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error on DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete participant' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}