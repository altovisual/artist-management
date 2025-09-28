// app/api/auco/sync-documents/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { aucoFetch } from '@/app/api/_lib/auco';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

// Endpoint para sincronizar documentos específicos desde Auco
export async function POST(req: Request) {
  let dbClient;
  
  try {
    console.log('=== SYNC AUCO DOCUMENTS ===');
    
    const body = await req.json();
    const { documentCodes } = body;
    
    // Si no se proporcionan códigos específicos, sincronizar los existentes en BD
    let codesToSync: string[] = [];
    
    // Conectar a la base de datos
    dbClient = await pool.connect();
    
    if (documentCodes && Array.isArray(documentCodes)) {
      codesToSync = documentCodes;
      console.log(`Syncing specific documents: ${codesToSync.join(', ')}`);
    } else {
      // Obtener códigos existentes de nuestra BD
      const existingDocsQuery = `
        SELECT DISTINCT signature_request_id 
        FROM public.signatures 
        WHERE signature_request_id IS NOT NULL 
        AND signature_request_id != '';
      `;
      
      const existingDocs = await dbClient.query(existingDocsQuery);
      codesToSync = existingDocs.rows.map(row => row.signature_request_id);
      console.log(`Found ${codesToSync.length} existing documents in our DB to sync`);
    }
    
    const documents = [];
    
    // Verificar el estado de cada documento en Auco
    for (const documentCode of codesToSync) {
      try {
        console.log(`Checking document: ${documentCode}`);
        
        const docDetails: any = await aucoFetch(`/document/get?code=${documentCode}`, 'GET');
        if (docDetails) {
          documents.push({
            code: documentCode,
            name: docDetails.data?.name || docDetails.name || `Documento ${documentCode}`,
            status: docDetails.data?.status || docDetails.status || 'pending',
            created_at: docDetails.data?.created_at || docDetails.created_at,
            document_url: docDetails.data?.document_url || docDetails.document_url,
            signProfile: docDetails.data?.signProfile || docDetails.signProfile || []
          });
        }
      } catch (docError: any) {
        console.log(`Document ${documentCode} not found in Auco or error:`, docError.message);
        continue;
      }
    }
    
    console.log(`Found ${documents.length} documents to sync`);
    
    let syncedCount = 0;
    let updatedCount = 0;
    
    // 2. Procesar cada documento
    for (const doc of documents) {
      try {
        const documentCode = doc.code || doc.id;
        if (!documentCode) continue;
        
        console.log(`Processing document: ${documentCode}`);
        
        // Obtener detalles del documento
        const details: any = await aucoFetch(`/document/get?code=${documentCode}`, 'GET');
        const signers = details?.data?.signProfile || details?.signProfile || [];
        
        // 3. Buscar si ya existe en nuestra BD
        const existingQuery = `
          SELECT id FROM public.signatures 
          WHERE signature_request_id = $1 
          LIMIT 1;
        `;
        const existingResult = await dbClient.query(existingQuery, [documentCode]);
        
        // 4. Procesar cada firmante
        for (const signer of signers) {
          if (!signer.email) continue;
          
          const signerStatus = mapAucoStatusToOurs(signer.status || doc.status);
          
          if (existingResult.rows.length > 0) {
            // Actualizar registro existente con datos completos
            const updateQuery = `
              UPDATE public.signatures 
              SET 
                status = $2,
                document_url = $3,
                document_name = $4,
                creator_email = $5,
                signer_name = $6,
                signer_phone = $7,
                signature_platform = $8,
                signature_location = $9,
                reading_time = $10,
                signed_at = $11,
                updated_at = NOW(),
                completed_at = CASE 
                  WHEN $2 = 'completed' AND completed_at IS NULL THEN NOW() 
                  ELSE completed_at 
                END
              WHERE signature_request_id = $1 AND signer_email = $12;
            `;
            
            await dbClient.query(updateQuery, [
              documentCode,
              signerStatus,
              doc.document_url || details?.document_url,
              doc.name || details?.name,
              doc.creator_email || details?.creator_email || process.env.AUCO_OWNER_EMAIL,
              signer.name,
              signer.phone,
              signer.platform || 'Email',
              signer.location || signer.address,
              signer.reading_time,
              signer.signed_at || (signerStatus === 'completed' ? new Date().toISOString() : null),
              signer.email.toLowerCase().trim()
            ]);
            
            updatedCount++;
            console.log(`Updated signer: ${signer.email} -> ${signerStatus}`);
          } else {
            // Crear nuevo registro con datos completos
            const insertQuery = `
              INSERT INTO public.signatures (
                contract_id, 
                signer_email, 
                signature_request_id, 
                status,
                document_url,
                document_name,
                creator_email,
                signer_name,
                signer_phone,
                signature_platform,
                signature_location,
                reading_time,
                signed_at,
                created_at,
                completed_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
              ON CONFLICT (signature_request_id, signer_email) 
              DO UPDATE SET 
                status = EXCLUDED.status,
                document_url = EXCLUDED.document_url,
                document_name = EXCLUDED.document_name,
                creator_email = EXCLUDED.creator_email,
                signer_name = EXCLUDED.signer_name,
                signer_phone = EXCLUDED.signer_phone,
                signature_platform = EXCLUDED.signature_platform,
                signature_location = EXCLUDED.signature_location,
                reading_time = EXCLUDED.reading_time,
                signed_at = EXCLUDED.signed_at,
                updated_at = NOW();
            `;
            
            // Intentar extraer contract_id del nombre del documento
            const contractId = extractContractIdFromName(doc.name || '');
            
            await dbClient.query(insertQuery, [
              contractId || '0', // ID genérico si no se puede extraer
              signer.email.toLowerCase().trim(),
              documentCode,
              signerStatus,
              doc.document_url || details?.document_url,
              doc.name || details?.name,
              doc.creator_email || details?.creator_email || process.env.AUCO_OWNER_EMAIL,
              signer.name,
              signer.phone,
              signer.platform || 'Email',
              signer.location || signer.address,
              signer.reading_time,
              signer.signed_at || (signerStatus === 'completed' ? new Date().toISOString() : null),
              doc.created_at ? new Date(doc.created_at) : new Date(),
              signerStatus === 'completed' ? new Date() : null
            ]);
            
            syncedCount++;
            console.log(`Synced new signer: ${signer.email} -> ${signerStatus}`);
          }
        }
        
      } catch (docError: any) {
        console.error(`Error processing document ${doc.code}:`, docError.message);
        continue; // Continuar con el siguiente documento
      }
    }
    
    console.log(`Sync completed: ${syncedCount} new, ${updatedCount} updated`);
    
    return NextResponse.json({
      success: true,
      message: 'Sincronización completada',
      stats: {
        total_documents: documents.length,
        synced_new: syncedCount,
        updated_existing: updatedCount
      }
    });
    
  } catch (error: any) {
    console.error('Error syncing Auco documents:', error);
    return NextResponse.json(
      { error: 'Error sincronizando documentos de Auco', details: error.message },
      { status: 500 }
    );
  } finally {
    dbClient?.release();
  }
}

// Mapear estados de Auco a nuestros estados
function mapAucoStatusToOurs(aucoStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'pending',
    'sent': 'sent',
    'signed': 'completed',
    'completed': 'completed',
    'finished': 'completed',
    'rejected': 'rejected',
    'cancelled': 'rejected',
    'expired': 'expired'
  };
  
  return statusMap[aucoStatus?.toLowerCase()] || 'pending';
}

// Extraer ID del contrato desde el nombre del documento
function extractContractIdFromName(name: string): string | null {
  // Buscar patrones como "Contrato: nombre" o "#123"
  const patterns = [
    /contrato[:\s]+(.+)/i,
    /#(\d+)/,
    /contract[:\s]+(.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) {
      return match[1]?.trim();
    }
  }
  
  return null;
}

// Endpoint GET para verificar el estado
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/auco/sync-documents',
    description: 'Sincroniza documentos existentes desde Auco a la base de datos local',
    method: 'POST',
    usage: 'Ejecutar para importar documentos que ya existen en Auco'
  });
}
