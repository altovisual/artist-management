// app/api/webhooks/auco/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

const AUCO_WEBHOOK_TOKEN = process.env.AUCO_WEBHOOK_TOKEN;

async function verifyWebhook(request: Request) {
  if (!AUCO_WEBHOOK_TOKEN) {
    throw new Error('AUCO_WEBHOOK_TOKEN is not set');
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || token !== AUCO_WEBHOOK_TOKEN) {
    throw new Error('Invalid authorization token');
  }

  return await request.json();
}

export async function POST(request: Request) {
  let dbClient;
  try {
    const payload = await verifyWebhook(request);

    // Assuming payload structure from Auco for verification
    const verificationId = payload?.validation?.id; // e.g., the document_code
    const status = payload?.event?.type; // e.g., 'validation_completed', 'validation_failed'

    if (!verificationId || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Map Auco status to our internal status
    const newStatus = status === 'validation_completed' ? 'verified' : 'error';

    dbClient = await pool.connect();
    const updateQuery = `
      UPDATE public.participants
      SET verification_status = $1, updated_at = NOW()
      WHERE auco_verification_id = $2;
    `;
    const { rowCount } = await dbClient.query(updateQuery, [newStatus, verificationId]);

    if (rowCount === 0) {
        console.warn(`Auco webhook: No participant found with auco_verification_id: ${verificationId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error handling Auco verification webhook:', error.message);
    const status = error.message.includes('token') || error.message.includes('header') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  } finally {
    // @ts-ignore
    dbClient?.release?.();
  }
}