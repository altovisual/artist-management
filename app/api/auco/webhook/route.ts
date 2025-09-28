// app/api/auco/webhook/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

// Webhook para recibir notificaciones de Auco cuando se completen las firmas
export async function POST(req: Request) {
  let dbClient;
  
  try {
    console.log('=== AUCO WEBHOOK RECEIVED ===');
    
    const body = await req.json();
    console.log('Webhook payload:', JSON.stringify(body, null, 2));

    // Validar que viene de Auco
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.AUCO_PRK}`;
    
    if (authHeader !== expectedAuth) {
      console.log('ERROR: Invalid authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Webhook authenticated successfully');

    // Extraer información del webhook
    const { 
      document_code, 
      status, 
      signers, 
      event_type,
      completed_at,
      document_url 
    } = body;

    if (!document_code) {
      console.log('ERROR: Missing document_code in webhook');
      return NextResponse.json({ error: 'document_code requerido' }, { status: 400 });
    }

    console.log(`Webhook event: ${event_type} for document ${document_code} with status ${status}`);

    // Conectar a la base de datos
    dbClient = await pool.connect();

    // Actualizar el estado de las firmas en nuestra base de datos
    if (event_type === 'document.completed' || status === 'completed') {
      console.log('Document completed, updating signatures status...');
      
      const updateQuery = `
        UPDATE public.signatures 
        SET 
          status = 'completed',
          completed_at = NOW(),
          document_url = $2
        WHERE signature_request_id = $1
        RETURNING *;
      `;
      
      const result = await dbClient.query(updateQuery, [document_code, document_url]);
      console.log('Updated signatures:', result.rows.length);

      // Opcional: Notificar a los administradores
      if (result.rows.length > 0) {
        const contractId = result.rows[0].contract_id;
        console.log(`Contract ${contractId} signatures completed!`);
        
        // Aquí podrías enviar emails, notificaciones push, etc.
        // await sendCompletionNotification(contractId, document_url);
      }
    }

    // Actualizar estados individuales de firmantes si vienen en el payload
    if (signers && Array.isArray(signers)) {
      for (const signer of signers) {
        if (signer.email && signer.status) {
          const updateSignerQuery = `
            UPDATE public.signatures 
            SET 
              status = $3,
              updated_at = NOW()
            WHERE signature_request_id = $1 AND signer_email = $2;
          `;
          
          await dbClient.query(updateSignerQuery, [
            document_code, 
            signer.email.toLowerCase().trim(), 
            signer.status
          ]);
          
          console.log(`Updated signer ${signer.email} status to ${signer.status}`);
        }
      }
    }

    // Responder a Auco que recibimos el webhook correctamente
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook procesado correctamente',
      document_code,
      event_type,
      processed_at: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error processing Auco webhook:', error);
    
    return NextResponse.json(
      { 
        error: 'Error procesando webhook de Auco', 
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    dbClient?.release();
  }
}

// Endpoint GET para verificar que el webhook está activo
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    webhook_url: '/api/auco/webhook',
    supported_events: [
      'document.completed',
      'document.signed',
      'document.rejected',
      'signer.completed'
    ],
    timestamp: new Date().toISOString()
  });
}
