// app/api/webhooks/auco-signatures/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

// Usa el mismo valor que configuraste en Auco (sin "Bearer" en env)
const SHARED_SECRET =
  (process.env.AUCO_WEBHOOK_TOKEN || process.env.AUCO_API_SECRET || '').trim();

function mask(s?: string) {
  if (!s) return 'undefined';
  return s.length <= 8 ? `${s[0]}***${s.slice(-1)}(len=${s.length})`
                       : `${s.slice(0,4)}...${s.slice(-4)}(len=${s.length})`;
}

/** Auth flexible: Authorization: Bearer <secret>  o  X-Auco-Webhook: <secret> */
function isAuthorized(req: Request): boolean {
  if (!SHARED_SECRET) return false;
  const auth = (req.headers.get('authorization') || '').trim();
  const custom = (req.headers.get('x-auco-webhook') || '').trim();
  return auth === `Bearer ${SHARED_SECRET}` || custom === SHARED_SECRET;
}

/** Parseo robusto del body (JSON / x-www-form-urlencoded / vacío / desconocido) */
async function parseBody(req: Request): Promise<any> {
  const ct = (req.headers.get('content-type') || '').toLowerCase();
  const raw = await req.text();

  if (!raw) return {}; // ping vacío

  if (ct.startsWith('application/json')) {
    try {
      return JSON.parse(raw);
    } catch (e: any) {
      console.warn('[WEBHOOK] JSON parse error:', e?.message, { raw });
      return { _raw: raw, _jsonError: e?.message || 'json-parse-error' };
    }
  }

  if (ct.startsWith('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }

  // contenido desconocido → guarda raw
  return { _raw: raw, _contentType: ct };
}

/** Saca el ID de documento de varias formas posibles */
function extractDocumentId(body: any): string | null {
  if (!body || typeof body !== 'object') return null;
  if (typeof body.document === 'string' && body.document.trim()) return body.document.trim();
  if (body.document && typeof body.document.id === 'string' && body.document.id.trim()) {
    return body.document.id.trim();
  }
  // a veces “code” es el identificador de sesión
  if (typeof body.code === 'string' && body.code.trim()) return body.code.trim();
  return null;
}

/** Normaliza el evento/estado a un set chico */
function extractStatus(body: any): string {
  const candidates: Array<string | undefined> = [
    body?.event?.type,   // "signer.signed"
    body?.event,         // "signer.signed" / "process.completed"
    body?.status,        // "completed"
    body?.type           // alternativa
  ];
  const first = candidates.find(v => typeof v === 'string' && v.trim());
  const raw = (first || 'unknown').toString().trim().toLowerCase();

  if (raw.includes('completed')) return 'completed';
  if (raw.includes('signed'))    return 'signed';
  if (raw.includes('viewed') || raw.includes('opened')) return 'viewed';
  if (raw.includes('sent'))      return 'sent';
  return raw || 'unknown';
}

function json(status: number, obj: any) {
  return new NextResponse(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  let db: any;
  try {
    // 1) Auth
    if (!isAuthorized(req)) {
      console.warn('[WEBHOOK AUTH MISMATCH]', {
        expected: `Bearer ${mask(SHARED_SECRET)}`,
        received: mask(req.headers.get('authorization') || ''),
        custom: mask(req.headers.get('x-auco-webhook') || ''),
      });
      return json(401, { error: 'Missing/Invalid Authorization' });
    }

    // 2) Body robusto
    const body = await parseBody(req);

    // 3) Extraer info clave
    const documentId = extractDocumentId(body);
    const status = extractStatus(body);

    console.log('[AUCO WEBHOOK]', {
      contentType: req.headers.get('content-type'),
      documentId,
      status,
      keys: body && typeof body === 'object' ? Object.keys(body) : typeof body,
    });

    // Si no vino documentId, respondemos 200 para no generar reintentos infinitos
    if (!documentId) {
      return json(200, { ok: true, note: 'no document id in payload', received: body });
    }

    db = await pool.connect();

    // 4A) Intento idempotente: actualizar si ya existe la fila
    const upd = await db.query(
      `update public.signatures
          set status = $2, updated_at = now()
        where signature_request_id = $1`,
      [documentId, status]
    );

    if (upd.rowCount && upd.rowCount > 0) {
      return json(200, { ok: true, documentId, status, mode: 'update' });
    }

    // 4B) Si no existe, insertar resolviendo contract_id desde contracts.auco_document_id
    //     (tu schema exige contract_id NOT NULL)
    const ins = await db.query(
      `
      insert into public.signatures (
        signature_request_id, status, contract_id, updated_at
      )
      select
        $1, $2, c.id, now()
      from public.contracts c
      where c.auco_document_id = $1
      on conflict (signature_request_id)
      do update set
        status     = excluded.status,
        updated_at = now()
      returning contract_id
      `,
      [documentId, status]
    );

    if (ins.rowCount && ins.rowCount > 0) {
      return json(200, { ok: true, documentId, status, mode: 'insert' });
    }

    // 4C) No pudimos resolver el contract_id todavía (carrera rara)
    console.warn('[AUCO WEBHOOK] contract_not_resolved', { documentId, status });
    return json(200, {
      ok: false,
      documentId,
      status,
      reason: 'contract_not_resolved'
    });

  } catch (e: any) {
    console.error('[WEBHOOK] Fatal:', e?.message || e);
    // Para webhooks conviene no forzar reintentos infinitos → 200 con detalle
    return json(200, { ok: false, error: e?.message || 'internal-error' });
  } finally {
    // @ts-ignore
    db?.release?.();
  }
}
