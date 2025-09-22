// app/api/auco/start-signature/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { generatePdfFromHtml } from '@/lib/pdf';
import { aucoFetch } from '@/app/api/_lib/auco';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

// --------------------- SQL ---------------------
const contractDataQuery = `
SELECT
  c.id as contract_id,
  c.status as contract_status,
  c.internal_reference,
  c.signing_location,
  c.additional_notes,
  c.publisher,
  c.publisher_percentage,
  c.co_publishers,
  c.publisher_admin,
  c.created_at as contract_created_at,
  w.name as work_name,
  w.alternative_title as work_alternative_title,
  w.iswc as work_iswc,
  w.type as work_type,
  w.status as work_status,
  w.release_date as work_release_date,
  w.isrc as work_isrc,
  w.upc as work_upc,
  t.template_html,
  json_agg(
    json_build_object(
      'id', p.id,
      'name', p.name,
      'email', p.email,
      'phone', p.phone,
      'role', cp.role,
      'percentage', cp.percentage
    )
  ) as participants
FROM public.contracts c
LEFT JOIN public.projects w ON c.project_id = w.id
LEFT JOIN public.templates t ON c.template_id = t.id
LEFT JOIN public.contract_participants cp ON c.id = cp.contract_id
LEFT JOIN public.participants p ON cp.participant_id = p.id
WHERE c.id = $1
GROUP BY c.id, w.id, t.id;
`;

// --------------------- Utils ---------------------
function renderTemplate(html: string, data: any): string {
  let renderedHtml = html;

  for (const key in data) {
    if (typeof data[key] === 'object' && data[key] !== null) {
      for (const nestedKey in data[key]) {
        const placeholder = new RegExp(`{{${key}\\.${nestedKey}}}`, 'g');
        renderedHtml = renderedHtml.replace(
          placeholder,
          data[key][nestedKey] != null && data[key][nestedKey] !== '' ? String(data[key][nestedKey]) : 'N/A'
        );
      }
    } else {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      renderedHtml = renderedHtml.replace(
        placeholder,
        data[key] != null && data[key] !== '' ? String(data[key]) : 'N/A'
      );
    }
  }

  return renderedHtml;
}

/** Verifica que el Buffer sea un PDF válido (evita FILE_NOT_VALID) */
function assertPdfBuffer(pdf: Buffer) {
  if (!Buffer.isBuffer(pdf)) throw new Error('PDF no es Buffer');
  const head = pdf.subarray(0, 5).toString('utf8'); // %PDF-
  const tail = pdf.subarray(-32).toString('utf8');  // ...%%EOF
  if (!head.startsWith('%PDF-')) throw new Error('PDF inválido: falta cabecera %PDF-');
  if (!/%%EOF\s*$/.test(tail)) throw new Error('PDF inválido: falta marcador %%EOF al final');
  if (pdf.length < 1024) throw new Error('PDF demasiado pequeño (posible truncado)');
}

/** Convierte a Base64 “puro” (sin data:) tras validar el PDF */
function toPdfBase64Strict(pdf: Buffer) {
  assertPdfBuffer(pdf);
  return pdf.toString('base64'); // sin data:application/pdf;base64,
}

/** Normaliza el teléfono a string y quita espacios. (E.164 esperado por Auco) */
function normalizePhone(p: any): string {
  if (p == null) return '';
  return String(p).trim();
}

// --------------------- Handler ---------------------
export async function POST(req: Request) {
  let dbClient;
  try {
    const { contractId } = await req.json();
    if (!contractId) {
      return NextResponse.json({ error: 'contractId es requerido' }, { status: 400 });
    }

    const ownerEmail = process.env.AUCO_OWNER_EMAIL?.trim().toLowerCase();
    if (!ownerEmail) {
      return NextResponse.json(
        { error: 'Config faltante', details: 'AUCO_OWNER_EMAIL no está configurado en el entorno' },
        { status: 500 }
      );
    }

    // 1) Obtener datos de contrato/obra/participantes/plantilla
    dbClient = await pool.connect();
    const { rows } = await dbClient.query(contractDataQuery, [contractId]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }
    const contractData = rows[0];

    if (!contractData.template_html) {
      return NextResponse.json({ error: 'La plantilla del contrato no contiene código HTML.' }, { status: 400 });
    }

    // 2) Renderizar HTML de contrato
    const templateRenderData = {
      contract: {
        status: contractData.contract_status,
        internal_reference: contractData.internal_reference,
        signing_location: contractData.signing_location,
        additional_notes: contractData.additional_notes,
        publisher: contractData.publisher,
        publisher_percentage: contractData.publisher_percentage,
        co_publishers: contractData.co_publishers,
        publisher_admin: contractData.publisher_admin,
        created_at: new Date(contractData.contract_created_at).toLocaleDateString(),
      },
      work: {
        name: contractData.work_name,
        alternative_title: contractData.work_alternative_title,
        iswc: contractData.work_iswc,
        type: contractData.work_type,
        status: contractData.work_status,
        release_date: contractData.work_release_date
          ? new Date(contractData.work_release_date).toLocaleDateString()
          : 'N/A',
        isrc: contractData.work_isrc,
        upc: contractData.work_upc,
      },
      participants: contractData.participants,
      current_date: new Date().toLocaleDateString(),
      current_year: new Date().getFullYear(),
    };

    let renderedHtml = renderTemplate(contractData.template_html, templateRenderData);

    // 2.1) Añadir etiquetas de firma (labels) para cada participante
    //      Auco las detecta con {{signature:N}} => para usar con "label: true"
    const signatureTags = contractData.participants
      .map((p: any, index: number) => `<br/><p>Firma de ${p.name || 'Firmante'}: {{signature:${index}}}</p>`)
      .join('');
    renderedHtml += signatureTags;

    // 3) Generar PDF (Buffer) desde HTML (tu lib debe devolver Buffer real del PDF)
    const pdfBuffer: Buffer = await generatePdfFromHtml(renderedHtml);

    // 3.1) Validar PDF y convertir a Base64 puro
    const base64Pdf = toPdfBase64Strict(pdfBuffer);

    // 4) Construir signProfile (usar labels)
    const signProfile = contractData.participants.map((p: any) => ({
      name: p.name,
      email: p.email,
      phone: normalizePhone(p.phone), // string; se espera E.164 ("+549...")
      label: true,                    // usamos las etiquetas agregadas al PDF
    }));

    // 5) Payload para Auco (/document/upload) — ¡sin "sign"!
    const aucoRequestBody = {
      email: ownerEmail,                                  // OWNER del tenant Auco (producción)
      name: `Contrato: ${contractData.work_name || 'Sin título'}`,
      subject: `Firma requerida: Contrato para ${contractData.work_name || 'Obra'}`,
      message: `Hola, por favor revisa y firma este documento para la obra ${contractData.work_name || ''}.`,
      notification: true,
      remember: 6,
      signProfile,
      file: base64Pdf,                                    // Base64 del binario del PDF (válido)
    };

    // 6) Llamar a Auco
    //    diagnose:true hace un ping GET previo para validar entorno/PUK (ayuda a detectar mismatches dev/prod)
    const aucoData = await aucoFetch('/document/upload', 'POST', aucoRequestBody, { diagnose: true });

    // 7) Validar respuesta y devolver código de sesión
    if (!aucoData?.code) {
      console.error('Respuesta inesperada de Auco (sin "code"):', aucoData);
      return NextResponse.json(
        { error: 'Respuesta inesperada de la API de Auco', details: aucoData },
        { status: 502 }
      );
    }

    return NextResponse.json({ session_code: aucoData.code }, { status: 200 });

  } catch (err: any) {
    // Propaga mensajes útiles (400/401) y evita 500 genéricos cuando sea validación
    const msg = err?.message ?? 'Error desconocido';
    const status =
      msg.includes('401') ? 401 :
      msg.includes('PDF inválido') ? 400 :
      msg.includes('contrato') ? 404 :
      500;

    console.error('Error al iniciar la sesión de firma de Auco:', msg);
    return NextResponse.json(
      { error: 'No se pudo iniciar el proceso de firma.', details: msg },
      { status }
    );
  } finally {
    if (dbClient) dbClient.release();
  }
}
