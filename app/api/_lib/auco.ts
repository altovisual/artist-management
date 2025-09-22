// app/api/_lib/auco.ts
export const runtime = 'nodejs';

const RAW_BASE = process.env.AUCO_BASE_URL ?? 'https://dev.auco.ai/v1.5/ext';
const AUCO_BASE_URL = RAW_BASE.trim().replace(/\/+$/, ''); // sin barra final
const RAW_PUK = process.env.AUCO_PUK ?? '';
const RAW_PRK = process.env.AUCO_PRK ?? '';

// saneo por si vinieron con \n o espacios
const AUCO_PUK = RAW_PUK.trim();
const AUCO_PRK = RAW_PRK.trim();

function mask(k?: string) {
  if (!k) return 'undefined';
  return `${k.slice(0,4)}...${k.slice(-4)}(len=${k.length})`;
}

function assertKey(method: 'GET'|'POST'|'PUT'|'DELETE') {
  const write = method !== 'GET';
  const key = write ? AUCO_PRK : AUCO_PUK;
  if (!key) throw new Error(`Falta ${write ? 'AUCO_PRK' : 'AUCO_PUK'} en env`);
  if (write && !key.startsWith('prk_')) throw new Error(`Key privada inválida para POST: ${mask(key)}`);
  if (!write && !key.startsWith('puk_')) throw new Error(`Key pública inválida para GET: ${mask(key)}`);
  return key;
}

async function pingAuth() {
  // Verifica que la PÚBLICA funciona en este BASE_URL (debe dar 200 con lista de plantillas)
  const r: any = await fetch(`${AUCO_BASE_URL}/document`, {
    method: 'GET',
    headers: { Authorization: AUCO_PUK }
  }).catch((e) => ({ ok: false, status: 0, statusText: String(e), text: async () => String(e) }));

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(
      `Auth/Entorno inválido para GET /document -> ${AUCO_BASE_URL}
PUK=${mask(AUCO_PUK)} => status=${r.status} ${r.statusText}
Detalle: ${txt}
Revisa que AUCO_BASE_URL y la key pública correspondan al MISMO entorno (dev vs api),
y que el header sea exactamente "Authorization: puk_..." (sin Bearer).`
    );
  }
}

export async function aucoFetch<T = any>(
  path: string,
  method: 'GET'|'POST'|'PUT'|'DELETE',
  body?: any,
  opts?: { diagnose?: boolean }
): Promise<T> {
  if (opts?.diagnose && method !== 'GET') {
    // antes de cualquier POST, validamos que la pública pase en este base
    await pingAuth();
  }

  const key = assertKey(method);

  // Log mínimo (enmascarado)
  console.log('[AUCO]', method, `${AUCO_BASE_URL}${path}`, 'auth=', mask(key));

  const res = await fetch(`${AUCO_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: key, // SIN "Bearer"
      ...(method === 'GET' ? {} : { 'Content-Type': 'application/json' })
    },
    body: method === 'GET' ? undefined : JSON.stringify(body ?? {})
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error('Error Auco:', txt);
    // Mensajes más claros para 401
    if (res.status === 401) {
      throw new Error(
        `401 Unauthorized — Verificá:
• AUCO_BASE_URL=${AUCO_BASE_URL}
• Key usada=${mask(key)} (POST=>prk_, GET=>puk_)
• Header "Authorization" exacto, sin "Bearer"
• Keys del MISMO entorno que AUCO_BASE_URL (dev vs api)
Detalle API: ${txt}`
      );
    }
    throw new Error(`${res.status} ${res.statusText} — ${txt}`);
  }

  return res.json();
}
