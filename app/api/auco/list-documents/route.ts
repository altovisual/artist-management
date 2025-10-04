// app/api/auco/list-documents/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { aucoFetch } from '@/app/api/_lib/auco';

export async function GET() {
  try {
    console.log('=== LISTING AUCO DOCUMENTS ===');
    
    // Obtener lista de documentos desde Auco
    const response: any = await aucoFetch('/document/list', 'GET');
    
    console.log('Auco API Response:', response);
    
    // La respuesta puede venir en diferentes formatos
    const documents = response?.data || response || [];
    
    if (!Array.isArray(documents)) {
      console.error('Unexpected response format:', response);
      return NextResponse.json({
        success: false,
        documents: [],
        message: 'Formato de respuesta inesperado de Auco'
      });
    }
    
    console.log(`Found ${documents.length} documents in Auco`);
    
    return NextResponse.json({
      success: true,
      documents: documents,
      total: documents.length
    });
    
  } catch (error: any) {
    console.error('Error listing Auco documents:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al listar documentos de Auco', 
        details: error.message,
        documents: []
      },
      { status: 500 }
    );
  }
}
