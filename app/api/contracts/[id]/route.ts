import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  let client;

  try {
    client = await pool.connect();
    const query = `
      SELECT
        c.*,
        json_build_object(
          'id', w.id,
          'name', w.name,
          'type', w.type,
          'status', w.status,
          'release_date', w.release_date,
          'description', w.description,
          'isrc', w.isrc,
          'upc', w.upc,
          'genre', w.genre,
          'duration', w.duration,
          'alternative_title', w.alternative_title, -- Added
          'iswc', w.iswc -- Added
        ) as work,
        json_build_object(
          'id', t.id,
          'type', t.type,
          'language', t.language,
          'template_html', t.template_html,
          'version', t.version,
          'jurisdiction', t.jurisdiction
        ) as template,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'email', p.email,
            'type', p.type,
            'id_number', p.id_number,
            'address', p.address,
            'country', p.country,
            'phone', p.phone,
            'bank_info', p.bank_info,
            'artistic_name', p.artistic_name, -- Added
            'management_entity', p.management_entity, -- Added
            'ipi', p.ipi, -- Added
            'role', cp.role,
            'percentage', cp.percentage -- Added
          )
        ) as participants
      FROM public.contracts c
      LEFT JOIN public.projects w ON c.work_id = w.id
      LEFT JOIN public.templates t ON c.template_id = t.id
      LEFT JOIN public.contract_participants cp ON c.id = cp.contract_id
      LEFT JOIN public.participants p ON cp.participant_id = p.id
      WHERE c.id = $1
      GROUP BY c.id, w.id, t.id;
    `;
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch contract', details: errorMessage }, { status: 500 });
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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  let client;

  try {
    client = await pool.connect();
    const body = await request.json();
    const {
      status,
      internal_reference,
      signing_location,
      additional_notes,
      publisher,
      publisher_percentage,
      co_publishers,
      publisher_admin,
      participants
    } = body;

    await client.query('BEGIN');

    // Update the contract fields if provided
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (status !== undefined) { updateFields.push(`status = ${paramIndex++}`); updateValues.push(status); }
    if (internal_reference !== undefined) { updateFields.push(`internal_reference = ${paramIndex++}`); updateValues.push(internal_reference); }
    if (signing_location !== undefined) { updateFields.push(`signing_location = ${paramIndex++}`); updateValues.push(signing_location); }
    if (additional_notes !== undefined) { updateFields.push(`additional_notes = ${paramIndex++}`); updateValues.push(additional_notes); }
    if (publisher !== undefined) { updateFields.push(`publisher = ${paramIndex++}`); updateValues.push(publisher); }
    if (publisher_percentage !== undefined) { updateFields.push(`publisher_percentage = ${paramIndex++}`); updateValues.push(publisher_percentage); }
    if (co_publishers !== undefined) { updateFields.push(`co_publishers = ${paramIndex++}`); updateValues.push(co_publishers); }
    if (publisher_admin !== undefined) { updateFields.push(`publisher_admin = ${paramIndex++}`); updateValues.push(publisher_admin); }

    if (updateFields.length > 0) {
      const updateContractQuery = `
        UPDATE public.contracts
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = ${paramIndex}
        RETURNING *;
      `;
      updateValues.push(id);
      await client.query(updateContractQuery, updateValues);
    }

    // Update participants if provided
    if (participants && Array.isArray(participants)) {
      // Delete existing participants for this contract
      const deleteParticipantsQuery = 'DELETE FROM public.contract_participants WHERE contract_id = $1';
      await client.query(deleteParticipantsQuery, [id]);

      // Insert new participants
      const insertParticipantQuery = 'INSERT INTO public.contract_participants (contract_id, participant_id, role, percentage) VALUES ($1, $2, $3, $4)';
      for (const participant of participants) {
        if (!participant.id || !participant.role) {
          throw new Error('Each participant must have an id and a role.');
        }
        await client.query(insertParticipantQuery, [id, participant.id, participant.role, participant.percentage || null]);
      }
    }

    await client.query('COMMIT');

    // Refetch the updated contract with its participants to return it in the response
    const refetchQuery = `
      SELECT
        c.*,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'email', p.email,
            'type', p.type,
            'id_number', p.id_number,
            'address', p.address,
            'country', p.country,
            'phone', p.phone,
            'bank_info', p.bank_info,
            'artistic_name', p.artistic_name,
            'management_entity', p.management_entity,
            'ipi', p.ipi,
            'role', cp.role,
            'percentage', cp.percentage
          )
        ) as participants
      FROM public.contracts c
      LEFT JOIN public.projects w ON c.work_id = w.id
      LEFT JOIN public.templates t ON c.template_id = t.id
      LEFT JOIN public.contract_participants cp ON c.id = cp.contract_id
      LEFT JOIN public.participants p ON cp.participant_id = p.id
      WHERE c.id = $1
      GROUP BY c.id, w.id, t.id;
    `;
    const { rows } = await client.query(refetchQuery, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Contract not found after update' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Database Error on PATCH /api/contracts/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update contract', details: errorMessage }, { status: 500 });
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

export async function DELETE(request: Request, context: any) {
  const { id } = context.params;
  let client;

  try {
    client = await pool.connect();
    const query = 'DELETE FROM public.contracts WHERE id = $1 RETURNING *';
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error on DELETE:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete contract', details: errorMessage }, { status: 500 });
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