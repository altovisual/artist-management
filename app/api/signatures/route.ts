import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

export async function GET(request: Request) {
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query('SELECT * FROM public.signatures');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch signatures' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { contract_id, signer_email } = body;

    if (!contract_id || !signer_email) {
      return NextResponse.json({ error: 'contract_id and signer_email are required.' }, { status: 400 });
    }

    // In a real application, you would interact with the Yousign API here.
    // For this prototype, we will just generate a random signature request ID.
    const signature_request_id = `sr_${randomBytes(16).toString('hex')}`;

    const query = `
      INSERT INTO public.signatures (contract_id, signer_email, signature_request_id, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *;
    `;
    const values = [contract_id, signer_email, signature_request_id];
    const { rows } = await client.query(query, values);

    revalidatePath('/management/signatures');

    return NextResponse.json(rows[0], { status: 201 });

  } catch (error) {
    console.error('Database Error on POST /api/signatures:', error);
    return NextResponse.json({ error: 'Failed to create signature' }, { status: 500 });
  } finally {
    client.release();
  }
}
