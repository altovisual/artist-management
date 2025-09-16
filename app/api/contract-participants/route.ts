import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

// GET handler to fetch splits for a specific contract
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contractId = searchParams.get('contract_id');

  if (!contractId) {
    return NextResponse.json({ error: 'contract_id query parameter is required' }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query('SELECT * FROM public.contract_participants WHERE contract_id = $1', [contractId]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error [GET contract_participants]:', error);
    return NextResponse.json({ error: 'Failed to fetch contract participants' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

// POST handler to create a new participant split for a contract
export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { contract_id, participant_id, split_percentage } = body;

    if (contract_id === undefined || participant_id === undefined || split_percentage === undefined) {
      return NextResponse.json({ error: 'contract_id, participant_id, and split_percentage are required fields' }, { status: 400 });
    }

    client = await pool.connect();
    const query = `
      INSERT INTO public.contract_participants (contract_id, participant_id, split_percentage)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [contract_id, participant_id, split_percentage];
    const { rows } = await client.query(query, values);

    // Revalidate the contract page to show the new participant
    revalidatePath('/management/contracts');

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Database Error [POST contract_participants]:', error);
    return NextResponse.json({ error: 'Failed to link participant to contract' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
