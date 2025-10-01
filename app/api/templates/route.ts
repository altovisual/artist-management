import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

// Create a connection pool to the database
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

export async function GET(request: Request) {
  console.log('POSTGRES_URL_POOLER:', process.env.POSTGRES_URL_POOLER);
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
    const { type, language, template_html, version, jurisdiction, auco_template_id } = body;

    console.log('POST /api/templates - Received data:', { type, language, version, html_length: template_html?.length });

    // Basic validation
    if (!type || !language || !version) {
      return NextResponse.json({ error: 'type, language and version are required fields.' }, { status: 400 });
    }

    client = await pool.connect();
    const query = `
      INSERT INTO public.templates (type, language, version, jurisdiction, auco_template_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [type, language, version, jurisdiction || null, auco_template_id || template_html || null];

    console.log('Executing query with values:', { type, language, version, jurisdiction });
    const { rows } = await client.query(query, values);
    console.log('Template created successfully:', rows[0]?.id);

    revalidatePath('/management/templates');

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Database Error on POST:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    return NextResponse.json({ 
      error: 'Failed to create template',
      details: error.message,
      code: error.code
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get('id');

  if (!templateId) {
    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();
    const { rowCount } = await client.query('DELETE FROM public.templates WHERE id = $1', [templateId]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    revalidatePath('/management/templates');
    return NextResponse.json({ message: 'Template deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Database Error on DELETE:', error);
    if (error.code === '23503') { // PostgreSQL foreign key violation error code
      return NextResponse.json({ error: 'Cannot delete template: It is currently referenced by one or more contracts.' }, { status: 409 }); // 409 Conflict
    }
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
