import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

const contractStatusQuery = `
SELECT
  c.id,
  c.status,
  c.created_at,
  c.updated_at,
  COALESCE(
    json_agg(
      json_build_object(
        'id', s.id,
        'signer_email', s.signer_email,
        'status', s.status,
        'signed_at', s.signed_at,
        'signature_request_id', s.signature_request_id
      )
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::json
  ) as signatures
FROM public.contracts c
LEFT JOIN public.signatures s ON c.id = s.contract_id
WHERE c.id = $1
GROUP BY c.id, c.status, c.created_at, c.updated_at;
`;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let client;

  try {
    client = await pool.connect();
    const { rows } = await client.query(contractStatusQuery, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch contract status', details: errorMessage }, { status: 500 });
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
