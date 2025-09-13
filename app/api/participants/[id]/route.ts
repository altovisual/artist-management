import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

export async function DELETE(request: Request, context: any) {
  const { id } = context.params;
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
