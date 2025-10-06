// app/api/auco/start-signature/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { generatePdfFromHtml } from '@/lib/pdf';
import { aucoFetch } from '@/app/api/_lib/auco';
import { getContractTemplate } from '@/lib/contract-templates';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

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

const contractDataQueryNoTemplate = `
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
  NULL::text as template_html,
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
LEFT JOIN public.contract_participants cp ON c.id = cp.contract_id
LEFT JOIN public.participants p ON cp.participant_id = p.id
WHERE c.id = $1
GROUP BY c.id, w.id;
`;

// ---------- utils ----------
function renderTemplate(html: string, data: any): string {
  let renderedHtml = html;
  for (const key in data) {
    if (typeof data[key] === 'object' && data[key] !== null) {
      for (const nestedKey in data[key]) {
        const ph = new RegExp(`{{${key}\.${nestedKey}}}`, 'g');
        renderedHtml = renderedHtml.replace(
          ph,
          data[key][nestedKey] != null && data[key][nestedKey] !== '' ? String(data[key][nestedKey]) : 'N/A'
        );
      }
    } else {
      const ph = new RegExp(`{{${key}}}`, 'g');
      renderedHtml = renderedHtml.replace(
        ph,
        data[key] != null && data[key] !== '' ? String(data[key]) : 'N/A'
      );
    }
  }
  return renderedHtml;
}

async function normalizeToBuffer(maybePdf: any): Promise<Buffer> {
  if (Buffer.isBuffer(maybePdf)) return maybePdf;
  if (maybePdf instanceof Uint8Array) return Buffer.from(maybePdf);
  if (typeof maybePdf === 'object' && maybePdf?.byteLength && maybePdf.constructor?.name === 'ArrayBuffer') {
    return Buffer.from(new Uint8Array(maybePdf as ArrayBuffer));
  }
  if (typeof Blob !== 'undefined' && maybePdf instanceof Blob) {
    const ab = await maybePdf.arrayBuffer();
    return Buffer.from(new Uint8Array(ab));
  }
  if (maybePdf && typeof maybePdf.arrayBuffer === 'function' && typeof maybePdf.text === 'function') {
    const ab = await maybePdf.arrayBuffer();
    return Buffer.from(new Uint8Array(ab));
  }
  if (typeof maybePdf === 'string') {
    const s = maybePdf.trim();
    const b64 = s.startsWith('data:application/pdf;base64,') ? s.replace(/^data:application\/pdf;base64,/, '') : s;
    return Buffer.from(b64, 'base64');
  }
  throw new Error('No se pudo convertir el PDF a Buffer (tipo no soportado)');
}

function assertPdfBuffer(pdf: Buffer) {
  const head = pdf.subarray(0, 5).toString('utf8');
  const tail = pdf.subarray(-32).toString('utf8');
  if (!head.startsWith('%PDF-')) throw new Error('PDF inválido: falta cabecera %PDF-');
  if (!/%%EOF\s*$/.test(tail)) throw new Error('PDF inválido: falta marcador %%EOF al final');
  if (pdf.length < 1024) throw new Error('PDF demasiado pequeño (posible truncado)');
}

function toPdfBase64Strict(pdf: Buffer) {
  assertPdfBuffer(pdf);
  return pdf.toString('base64');
}

function normalizePhone(p: any): string {
  if (p == null) return '';
  return String(p).trim();
}

async function saveSignatureRequests(dbClient: any, contractId: string, participants: any[], aucoCode: string) {
  const insertQuery = `
    INSERT INTO public.signatures (contract_id, signer_email, signature_request_id, status)
    VALUES ($1, $2, $3, 'sent');
  `;
  for (const participant of participants) {
    if (participant.email) {
      await dbClient.query(insertQuery, [contractId, participant.email, aucoCode]);
    }
  }
}

export async function POST(req: Request) {
  let dbClient;
  
  try {
    const body = await req.json();
    const { contractId } = body;
    
    if (!contractId) {
      return NextResponse.json({ error: 'contractId es requerido' }, { status: 400 });
    }

    // Check environment variables
    const ownerEmail = process.env.AUCO_OWNER_EMAIL?.trim().toLowerCase();
    const postgresUrl = process.env.POSTGRES_URL_POOLER;
    
    if (!ownerEmail) {
      return NextResponse.json(
        { error: 'Config faltante', details: 'AUCO_OWNER_EMAIL no está configurado en el entorno' },
        { status: 500 }
      );
    }

    if (!postgresUrl) {
      return NextResponse.json(
        { error: 'Config faltante', details: 'POSTGRES_URL_POOLER no está configurado en el entorno' },
        { status: 500 }
      );
    }

    // 1) Datos
    dbClient = await pool.connect();
    let rows;
    try {
      rows = (await dbClient.query(contractDataQuery, [contractId])).rows;
    } catch (e: any) {
      if ((e?.message || '').includes('template_html')) {
        rows = (await dbClient.query(contractDataQueryNoTemplate, [contractId])).rows;
      } else {
        throw e;
      }
    }
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }
    
    const contractData = rows[0];

    // Si no hay template_html, usaremos una plantilla HTML mínima por defecto

    // 2) Render
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

    // Usar plantilla personalizada o la moderna por defecto
    const templateType = process.env.CONTRACT_TEMPLATE_TYPE as 'modern' | 'simple' || 'modern';
    const baseTemplate = contractData.template_html || getContractTemplate(templateType);
    let renderedHtml = renderTemplate(baseTemplate, templateRenderData);

    // Agregar labels {{signature:N}} para cada participante (para usar label:true)
    const signatureTags = contractData.participants
      .map((p: any, index: number) => `<br/><p>Firma de ${p.name || 'Firmante'}: {{signature:${index}}}</p>`)
      .join('');
    renderedHtml += signatureTags;

    // 3) PDF
    const maybePdf = await generatePdfFromHtml(renderedHtml);
    const pdfBuffer = await normalizeToBuffer(maybePdf);
    const base64Pdf = toPdfBase64Strict(pdfBuffer);

    // 4) signProfile con validación de duplicados
    const signProfile = contractData.participants.map((p: any) => ({
      name: p.name,
      email: p.email,
      phone: normalizePhone(p.phone),
      label: true,
    }));

    // Validar emails duplicados
    const emailCounts = new Map<string, number>();
    const duplicateEmails: string[] = [];
    
    signProfile.forEach(signer => {
      if (signer.email) {
        const email = signer.email.toLowerCase().trim();
        const count = (emailCounts.get(email) || 0) + 1;
        emailCounts.set(email, count);
        if (count === 2) {
          duplicateEmails.push(email);
        }
      }
    });

    if (duplicateEmails.length > 0) {
      return NextResponse.json(
        { 
          error: 'Emails duplicados detectados en firmantes', 
          details: `Los siguientes emails están repetidos: ${duplicateEmails.join(', ')}. Cada firmante debe tener un email único.`,
          duplicateEmails 
        },
        { status: 400 }
      );
    }

    // Validar emails vacíos
    const emptyEmails = signProfile.filter(s => !s.email || s.email.trim() === '');
    if (emptyEmails.length > 0) {
      return NextResponse.json(
        { 
          error: 'Firmantes sin email', 
          details: `Se encontraron ${emptyEmails.length} firmante(s) sin email. Todos los firmantes deben tener un email válido.`
        },
        { status: 400 }
      );
    }

    // 5) Flujo simplificado: UPLOAD con PDF (opción C)
    const uploadBody = {
      name: `Contrato: ${contractData.work_name || 'Sin título'}`,
      file: base64Pdf,
      email: ownerEmail,
      notification: true,
      signProfile: signProfile.map((p, index) => ({
        label: true, // auto-colocar firma si está habilitado
        name: p.name,
        email: p.email,
        phone: normalizePhone(p.phone)
      }))
    };

    const uploadResp = await aucoFetch('/document/upload', 'POST', uploadBody, { diagnose: true });

    const documentCode = uploadResp?.code || uploadResp?.document;
    if (!documentCode) {
      return NextResponse.json(
        { error: 'Respuesta inesperada de la API de Auco en /document/upload', details: uploadResp },
        { status: 502 }
      );
    }

    // Guardar las solicitudes de firma en la base de datos
    await saveSignatureRequests(dbClient, contractId, contractData.participants, documentCode);

    // Consultar detalles del documento para obtener los IDs de firmantes (2 caracteres)
    let details: any = null;
    let signers: Array<{ id?: string; name?: string; email?: string; status?: string }> = [];
    let signerIds: string[] = [];
    
    try {
      details = await aucoFetch(`/document/get?code=${documentCode}`, 'GET');
      
      signers = (details?.data?.signProfile || details?.signProfile || []) as Array<{ id?: string; name?: string; email?: string; status?: string }>;
      signerIds = signers.map(s => s?.id).filter(Boolean) as string[];
    } catch (detailsError: any) {
      // Continuar sin los detalles - usar solo el documentCode
    }
    
    const firstSignerId = signerIds[0];
    const sessionCode = firstSignerId ? `${documentCode}${firstSignerId}` : documentCode;

    return NextResponse.json(
      {
        session_code: sessionCode,
        document_code: documentCode,
        signer_ids: signerIds,
        signers,
      },
      { status: 200 }
    );

  } catch (err: any) {
    const msg = err?.message ?? 'Error desconocido';
    const status =
      msg.includes('401') ? 401 :
      msg.startsWith('PDF inválido') || msg.includes('Buffer') ? 400 :
      msg.includes('Contrato no encontrado') ? 404 :
      500;

    console.error('Error al iniciar la sesión de firma de Auco:', msg);
    return NextResponse.json(
      { error: 'No se pudo iniciar el proceso de firma.', details: msg },
      { status }
    );
  } finally {
    // @ts-ignore
    dbClient?.release?.();
  }
}