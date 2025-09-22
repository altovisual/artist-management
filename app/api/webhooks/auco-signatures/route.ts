// app/api/webhooks/auco-signatures/route.ts
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

    // Assuming payload structure from Auco
    const documentId = payload?.document?.id;
    const status = payload?.event?.type; // e.g., 'signed', 'viewed'

    if (!documentId || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    dbClient = await pool.connect();
    const updateQuery = `
      UPDATE public.signatures
      SET status = $1, updated_at = NOW()
      WHERE signature_request_id = $2;
    `;
    await dbClient.query(updateQuery, [status, documentId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error handling Auco webhook:', error.message);
    const status = error.message.includes('token') || error.message.includes('header') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  } finally {
    // @ts-ignore
    dbClient?.release?.();
  }
}