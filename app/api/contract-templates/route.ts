import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get contract templates from database
    const { data: templates, error } = await supabase
      .from('contract_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      // Return mock data if database query fails
      return NextResponse.json([
        {
          id: '1',
          name: 'Contrato de Management',
          description: 'Contrato de gestión y representación artística',
          type: 'management',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Contrato de Producción',
          description: 'Contrato de producción musical',
          type: 'production',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Contrato de Distribución',
          description: 'Contrato de distribución digital y física',
          type: 'distribution',
          created_at: new Date().toISOString()
        }
      ]);
    }

    // If no templates in database, return mock data
    if (!templates || templates.length === 0) {
      return NextResponse.json([
        {
          id: '1',
          name: 'Contrato de Management',
          description: 'Contrato de gestión y representación artística',
          type: 'management',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Contrato de Producción',
          description: 'Contrato de producción musical',
          type: 'production',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Contrato de Distribución',
          description: 'Contrato de distribución digital y física',
          type: 'distribution',
          created_at: new Date().toISOString()
        }
      ]);
    }

    return NextResponse.json(templates);
  } catch (error: any) {
    console.error('Error in contract-templates API:', error);
    // Return mock data on error
    return NextResponse.json([
      {
        id: '1',
        name: 'Contrato de Management',
        description: 'Contrato de gestión y representación artística',
        type: 'management',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Contrato de Producción',
        description: 'Contrato de producción musical',
        type: 'production',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Contrato de Distribución',
        description: 'Contrato de distribución digital y física',
        type: 'distribution',
        created_at: new Date().toISOString()
      }
    ]);
  }
}
