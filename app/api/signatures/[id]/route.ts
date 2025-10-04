import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request, context: any) {
  const { id } = context.params;
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

export async function PATCH(request: Request, context: any) {
  const { id } = context.params;
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { status, archived } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (archived !== undefined) {
      updates.push(`archived = $${paramCount}`);
      values.push(archived);
      paramCount++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE public.signatures
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;
    
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

export async function DELETE(request: Request, context: any) {
  const { id } = context.params;
  let client;

  try {
    client = await pool.connect();
    
    // Soft delete: marcar como eliminado con timestamp
    const query = `
      UPDATE public.signatures 
      SET deleted_at = NOW(), archived = true
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Signature not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Signature deleted successfully',
      signature: rows[0] 
    });
  } catch (error) {
    console.error('Database Error on DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete signature' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}