import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

// Helper function to handle JSONB parameters
function toJsonParam(x: any) {
  if (x === null || x === undefined || x === '') return null;
  if (typeof x === 'string') {
    try { JSON.parse(x); return x; } catch { /* not JSON string */ }
  }
  return JSON.stringify(x);
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
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
    console.error('Database Error on GET /api/participants/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch participant', details: errorMessage }, { status: 500 });
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

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let client;

  try {
    client = await pool.connect();
    const body = await req.json();

    const allowedFields = [
      'name',
      'email',
      'type',
      'id_number',
      'address',
      'country',
      'phone',
      'bank_info',
      'artistic_name',
      'management_entity',
      'ipi'
    ];

    const updateFields = Object.keys(body).filter(field => 
      allowedFields.includes(field) && body[field] !== null && body[field] !== undefined
    );

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update.' }, { status: 400 });
    }

    // Construir la cláusula SET dinámicamente
    const setClauseParts: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 2; // $1 es para el ID

    for (const field of updateFields) {
      if (field === 'type') {
        // Para el campo 'type', añadir un cast explícito al tipo ENUM
        setClauseParts.push(`"${field}" = $${paramIndex}::public.participant_type`);
        updateValues.push(String(body[field]).toUpperCase());
      } else if (field === 'bank_info') { // Asumiendo que bank_info es JSONB
        setClauseParts.push(`"${field}" = $${paramIndex}::jsonb`);
        updateValues.push(toJsonParam(body[field]));
      } else {
        setClauseParts.push(`"${field}" = $${paramIndex}`);
        updateValues.push(body[field]);
      }
      paramIndex++;
    }

    const setClause = setClauseParts.join(', ');

    const query = `
      UPDATE public.participants
      SET ${setClause}
      WHERE id = $1
      RETURNING *;
    `;
    
    const allValues = [id, ...updateValues];

    const { rows } = await client.query(query, allValues);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    revalidatePath('/management/participants');
    revalidatePath(`/management/participants/${id}/edit`);

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error('Database Error on PATCH /api/participants/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update participant', details: errorMessage }, { status: 500 });
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

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let client;

  try {
    client = await pool.connect();
    
    const checkContractsQuery = 'SELECT 1 FROM public.contract_participants WHERE participant_id = $1';
    const contractCheck = await client.query(checkContractsQuery, [id]);

    if (contractCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Cannot delete participant because they are part of one or more contracts.' }, { status: 409 });
    }
    
    const query = 'DELETE FROM public.participants WHERE id = $1 RETURNING *';
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    revalidatePath('/management/participants');

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error on DELETE /api/participants/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete participant', details: errorMessage }, { status: 500 });
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
