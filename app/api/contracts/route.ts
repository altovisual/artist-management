import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

export async function GET(request: Request) {
  let client;
  try {
    client = await pool.connect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let query = `
      SELECT
        c.*,
        w.name as work_name,
        t.type as template_type,
        t.version as template_version,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'role', cp.role
          )
        ) as participants
      FROM public.contracts c
      LEFT JOIN public.projects w ON c.project_id = w.id
      LEFT JOIN public.templates t ON c.template_id = t.id
      LEFT JOIN public.contract_participants cp ON c.id = cp.contract_id
      LEFT JOIN public.participants p ON cp.participant_id = p.id
    `;
    const queryParams = [];

    if (userId) {
      query += ` WHERE cp.participant_id IN (SELECT id FROM public.participants WHERE user_id = $1)`;
      queryParams.push(userId);
    }

    query += ` GROUP BY c.id, w.name, t.type, t.version;`;

    const { rows } = await client.query(query, queryParams);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
  }
}

export async function POST(request: Request) {
  let client;
  try {
    client = await pool.connect();
    const body = await request.json();
    
    console.log('📥 Datos recibidos en API:', JSON.stringify(body, null, 2));
    
    const {
      work_id,
      template_id,
      status = 'draft',
      internal_reference,
      signing_location,
      additional_notes,
      artist_name,
      record_label,
      recording_date,
      publisher,
      publisher_percentage,
      publisher_ipi,
      co_publishers,
      publisher_admin,
      participants
    } = body;

    // Validaciones detalladas
    if (!work_id) {
      return NextResponse.json({ error: 'work_id es requerido', details: 'Debe seleccionar una obra musical' }, { status: 400 });
    }
    
    if (!template_id) {
      return NextResponse.json({ error: 'template_id es requerido', details: 'Debe seleccionar una plantilla de contrato' }, { status: 400 });
    }
    
    if (!participants || !Array.isArray(participants)) {
      return NextResponse.json({ error: 'participants debe ser un array', details: 'Formato de participantes inválido' }, { status: 400 });
    }
    
    if (participants.length === 0) {
      return NextResponse.json({ error: 'Debe agregar al menos un participante', details: 'El contrato requiere al menos un firmante' }, { status: 400 });
    }

    // Validar que cada participante tenga los campos requeridos
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.id) {
        return NextResponse.json({ 
          error: `Participante ${i + 1} no tiene ID`, 
          details: 'Cada participante debe tener un ID válido' 
        }, { status: 400 });
      }
      if (!p.role) {
        return NextResponse.json({ 
          error: `Participante ${i + 1} no tiene rol asignado`, 
          details: 'Cada participante debe tener un rol (ARTISTA, PRODUCTOR, etc.)' 
        }, { status: 400 });
      }
      if (p.percentage === undefined || p.percentage === null) {
        return NextResponse.json({ 
          error: `Participante ${i + 1} no tiene porcentaje asignado`, 
          details: 'Cada participante debe tener un porcentaje de participación' 
        }, { status: 400 });
      }
    }
    
    const totalPercentage = participants.reduce((acc, p) => acc + (p.percentage || 0), 0);
    console.log('📊 Total de porcentajes:', totalPercentage);
    
    if (Math.abs(totalPercentage - 100) > 0.001) {
      return NextResponse.json({ 
        error: 'La suma de los porcentajes de los participantes debe ser exactamente 100%.', 
        details: `Actualmente suma: ${totalPercentage}%`,
        hint: 'Ajusta los porcentajes para que sumen exactamente 100%'
      }, { status: 400 });
    }

    console.log('✅ Validaciones pasadas, iniciando transacción...');
    await client.query('BEGIN');

    const contractQuery = `
      INSERT INTO public.contracts (
        project_id, template_id, status,
        internal_reference, signing_location, additional_notes,
        artist_name, record_label, recording_date,
        publisher, publisher_percentage, publisher_ipi, co_publishers, publisher_admin
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;
    const contractValues = [
      work_id, template_id, status,
      internal_reference, signing_location, additional_notes,
      artist_name, record_label, recording_date,
      publisher, publisher_percentage, publisher_ipi, co_publishers, publisher_admin
    ];
    
    console.log('📝 Insertando contrato con valores:', contractValues);
    const contractResult = await client.query(contractQuery, contractValues);
    const newContract = contractResult.rows[0];
    console.log('✅ Contrato creado con ID:', newContract.id);
    
    const participantQuery = 'INSERT INTO public.contract_participants (contract_id, participant_id, role, percentage, pro) VALUES ($1, $2, $3, $4, $5)';
    console.log('👥 Insertando', participants.length, 'participantes...');
    
    for (const participant of participants) {
      if (!participant.id || !participant.role) {
        throw new Error('Each participant must have an id and a role.');
      }
      console.log('  - Participante:', participant.id, participant.role, participant.percentage + '%', participant.pro ? `PRO: ${participant.pro}` : '');
      await client.query(participantQuery, [
        newContract.id, 
        participant.id, 
        participant.role, 
        participant.percentage || null,
        participant.pro || null
      ]);
    }

    console.log('💾 Commit de transacción...');
    await client.query('COMMIT');
    console.log('✅ Transacción completada exitosamente');

    revalidatePath('/management/contracts');
    const refetchQuery = `
      SELECT
        c.*,
        w.name as work_name,
        t.type as template_type,
        t.version as template_version,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
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
      GROUP BY c.id, w.name, t.type, t.version;
    `;
    const { rows } = await client.query(refetchQuery, [newContract.id]);

    return NextResponse.json(rows[0], { status: 201 });

  } catch (error) {
    console.error('❌ Database Error on POST /api/contracts:', error);
    if (client) {
      try {
        await client.query('ROLLBACK');
        console.log('🔄 Transaction rolled back');
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json({ 
      error: 'Failed to create contract', 
      details: errorMessage,
      hint: 'Verifica que todos los campos estén completos y que los porcentajes sumen 100%'
    }, { status: 500 });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
  }
}
