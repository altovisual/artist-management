import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a connection pool to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET a single work by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  let client;

  try {
    client = await pool.connect();
    const query = `
      SELECT
        w.*,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name
          )
        ) as participants
      FROM public.projects w
      LEFT JOIN public.work_participants wp ON w.id = wp.project_id
      LEFT JOIN public.participants p ON wp.participant_id = p.id
      WHERE w.id = $1
      GROUP BY w.id;
    `;
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch work' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// PATCH (update) a work by ID
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  let client;

  try {
    const body = await request.json();

    const allowedFields = [
      'name', 'type', 'status', 'release_date', 'description', 'isrc', 'upc', 'genre', 'duration',
      'alternative_title', // New field
      'iswc',               // New field
      'artist_id'
    ];
    const updateFields = Object.keys(body).filter(field => allowedFields.includes(field));

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update.' }, { status: 400 });
    }

    const setClause = updateFields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
    const values = updateFields.map(field => body[field]);
    values.push(id);

    const query = `
      UPDATE public.projects
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING *;
    `;

    client = await pool.connect();
    const { rows } = await client.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);

  } catch (error: any) {
    console.error('Database Error on PATCH:', error);
    return NextResponse.json({ error: 'Failed to update work', details: error.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// DELETE a work by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  let client;

  try {
    client = await pool.connect();
    const query = 'DELETE FROM public.projects WHERE id = $1 RETURNING *';
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error on DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete work' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}