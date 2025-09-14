import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

// Create a connection pool to the database
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

export async function GET(request: Request, context: any) {
  const { id } = await context.params;
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
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch template', details: errorMessage }, { status: 500 });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
  }
}

export async function PATCH(request: Request, context: any) {
  const { id } = await context.params;
  let client;

  try {
    client = await pool.connect();
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

    const { rows } = await client.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error('Database Error on PATCH:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update template', details: errorMessage }, { status: 500 });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
  }
}

export async function DELETE(request: Request, context: any) {
  const { id } = await context.params;
  let client;

  try {
    client = await pool.connect();
    const query = 'DELETE FROM public.templates WHERE id = $1 RETURNING *';
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    revalidatePath('/management/templates');

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error on DELETE:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete template', details: errorMessage }, { status: 500 });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
  }
}