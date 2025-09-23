// app/api/_lib/auco.ts
export const runtime = 'nodejs';

// BASE con /ext (documentos, plantillas, etc.)
const RAW_BASE = process.env.AUCO_BASE_URL ?? 'https://api.auco.ai/v1.5/ext';
// BASE sin /ext (AucoFace /veriface)
const RAW_API  = process.env.AUCO_API_BASE ?? RAW_BASE.replace(/\/ext\/?$/, '');

const AUCO_BASE_URL = RAW_BASE.trim().replace(/\/+$/, '');
const AUCO_API_BASE = RAW_API.trim().replace(/\/+$/, '');

const AUCO_PUK = (process.env.AUCO_PUK ?? '').trim();
const AUCO_PRK = (process.env.AUCO_PRK ?? '').trim();

function mask(k?: string) {
  if (!k) return 'undefined';
  return `${k.slice(0,4)}...${k.slice(-4)}(len=${k.length})`;
}

function assertKey(method: 'GET'|'POST'|'PUT'|'DELETE') {
  const write = method !== 'GET';
  const key = write ? AUCO_PRK : AUCO_PUK;
  if (!key) throw new Error(`Falta ${write ? 'AUCO_PRK' : 'AUCO_PUK'} en env`);
  if (write && !key.startsWith('prk_')) throw new Error(`Key privada inválida para ${method}: ${mask(key)}`);
  if (!write && !key.startsWith('puk_')) throw new Error(`Key pública inválida para ${method}: ${mask(key)}`);
  return key;
}

// Para diagnosticar entorno: GET a /document con PUK (en base /ext)
async function pingAuth() {
  const r: any = await fetch(`${AUCO_BASE_URL}/document`, {
    method: 'GET',
    headers: { Authorization: AUCO_PUK },
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

// Si el path es /veriface (o /aucoface), usar base SIN /ext
function pickBase(path: string) {
  return /^\/(veriface|aucoface)/.test(path) ? AUCO_API_BASE : AUCO_BASE_URL;
}

export async function aucoFetch<T = any>(
  path: string,
  method: 'GET'|'POST'|'PUT'|'DELETE',
  body?: any,
  opts?: { diagnose?: boolean }
): Promise<T> {
  // El diagnóstico valida el entorno /ext; útil antes de POST generales.
  // Para /veriface también sirve (verifica que al menos /ext esté bien configurado).
  if (opts?.diagnose && method !== 'GET') {
    await pingAuth();
  }

  const key = assertKey(method);
  const base = pickBase(path);

  console.log('[AUCO]', method, `${base}${path}`, 'auth=', mask(key));

  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: key, // SIN "Bearer"
      ...(method === 'GET' ? {} : { 'Content-Type': 'application/json' }),
    },
    body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error('Error Auco:', txt);
    if (res.status === 401) {
      throw new Error(
`401 Unauthorized — Verificá:
• AUCO_BASE_URL=${AUCO_BASE_URL}
• AUCO_API_BASE=${AUCO_API_BASE}
• Key usada=${mask(key)} (POST=>prk_, GET=>puk_)
• Header "Authorization" exacto, sin "Bearer"
• Keys del MISMO entorno que las BASES
Detalle API: ${txt}`
      );
    }
    throw new Error(`${res.status} ${res.statusText} — ${txt}`);
  }

  return res.json();
}
