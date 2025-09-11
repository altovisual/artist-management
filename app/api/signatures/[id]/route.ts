import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  let client;

  try {
    client = await pool.connect();
    const query = 'SELECT * FROM public.signatures WHERE id = $1';
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch signature' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required.' }, { status: 400 });
    }

    const query = `
      UPDATE public.signatures
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;
    const values = [status, id];
    const { rows } = await client.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error('Database Error on PATCH /api/signatures/[id]:', error);
    return NextResponse.json({ error: 'Failed to update signature' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  let client;

  try {
    client = await pool.connect();
    const query = 'DELETE FROM public.signatures WHERE id = $1 RETURNING *';
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error on DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete signature' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
