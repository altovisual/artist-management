// app/api/auco/start-verification/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { aucoFetch } from '@/app/api/_lib/auco';

type VerifaceResp = { code: string };

// Mapea outputs a document_code para el SDK
function toDocumentCode(r: any): string | null {
  if (!r) return null;
  if (typeof r.code === 'string' && r.code.trim()) return r.code.trim();
  if (typeof r.document === 'string' && r.document.trim()) return r.document.trim();
  if (typeof r.document_code === 'string' && r.document_code.trim()) return r.document_code.trim();
  if (typeof r.id === 'string' && r.id.trim()) return r.id.trim();
  return null;
}

export async function POST(req: Request) {
  try {
    const { name, email, id_number, phone, country, type, platform } = await req.json();

    // Validaciones mínimas (ajusta según tu flujo)
    if (!name)  return NextResponse.json({ error: 'name es requerido' }, { status: 400 });
    if (!phone || !phone.startsWith('+'))
      return NextResponse.json({ error: 'phone (con código de país, ej +573003003030) es requerido' }, { status: 400 });
    if (!country) return NextResponse.json({ error: 'country es requerido (p.ej. ES, CO, PE, MX)' }, { status: 400 });
    if (!type)    return NextResponse.json({ error: 'type es requerido (p.ej. DNI, CC, PASSPORT)' }, { status: 400 });

    const ownerEmail = (process.env.AUCO_OWNER_EMAIL || '').trim();
    if (!ownerEmail) return NextResponse.json({ error: 'Falta AUCO_OWNER_EMAIL en env' }, { status: 500 });

    // Payload de /veriface (AucoFace)
    const body = {
      email: ownerEmail,                  // dueño del proceso (tu usuario en Auco)
      platform: platform ?? 'web',        // 'web' o 'whatsapp'
      name,                               // nombre a validar
      phone,                              // +código-país
      country,                            // ES, CO, PE, MX, ...
      type,                               // DNI, CC, PASSPORT, ...
      identification: id_number ?? '',    // número de documento
      userEmail: email ?? '',             // correo del usuario a validar (opcional)
    };

    console.log('[AUCO VERIFY] POST /veriface payload=', { ...body, email: ownerEmail });

    // Importante: /veriface va contra la base SIN /ext (lo maneja aucoFetch)
    const resp = await aucoFetch<VerifaceResp>('/veriface', 'POST', body, { diagnose: true });
    const document_code = toDocumentCode(resp);

    if (!document_code) {
      return NextResponse.json(
        { error: 'Respuesta inesperada de Auco en /veriface', details: resp },
        { status: 502 }
      );
    }

    return NextResponse.json({ document_code }, { status: 200 });
  } catch (e: any) {
    console.error('[AUCO VERIFY] Error:', e?.message || e);
    return NextResponse.json({ error: e?.message || 'verify-failed' }, { status: 502 });
  }
}
