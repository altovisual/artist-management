import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const query = `
      SELECT
        c.id,
        c.status,
        c.signed_at,
        c.final_contract_pdf_url,
        w.name as project_name
      FROM public.contracts c
      LEFT JOIN public.projects w ON c.project_id = w.id
      WHERE c.status = 'signed'
    `;
    const { rows } = await client.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch signed contracts' }, { status: 500 });
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
