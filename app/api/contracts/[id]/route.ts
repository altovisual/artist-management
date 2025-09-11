import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  let client;

  try {
    client = await pool.connect();
    const query = `
      SELECT
        c.*,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'role', cp.role
          )
        ) as participants
      FROM public.contracts c
      LEFT JOIN public.contract_participants cp ON c.id = cp.contract_id
      LEFT JOIN public.participants p ON cp.participant_id = p.id
      WHERE c.id = $1
      GROUP BY c.id;
    `;
    const { rows } = await client.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { status, participants } = body;

    await client.query('BEGIN');

    // Update the contract status if provided
    if (status) {
      const updateContractQuery = 'UPDATE public.contracts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
      await client.query(updateContractQuery, [status, id]);
    }

    // Update participants if provided
    if (participants && Array.isArray(participants)) {
      // Delete existing participants for this contract
      const deleteParticipantsQuery = 'DELETE FROM public.contract_participants WHERE contract_id = $1';
      await client.query(deleteParticipantsQuery, [id]);

      // Insert new participants
      const insertParticipantQuery = 'INSERT INTO public.contract_participants (contract_id, participant_id, role) VALUES ($1, $2, $3)';
      for (const participant of participants) {
        if (!participant.id || !participant.role) {
          throw new Error('Each participant must have an id and a role.');
        }
        await client.query(insertParticipantQuery, [id, participant.id, participant.role]);
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
            'role', cp.role
          )
        ) as participants
      FROM public.contracts c
      LEFT JOIN public.contract_participants cp ON c.id = cp.contract_id
      LEFT JOIN public.participants p ON cp.participant_id = p.id
      WHERE c.id = $1
      GROUP BY c.id;
    `;
    const { rows } = await client.query(refetchQuery, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Contract not found after update' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database Error on PATCH /api/contracts/[id]:', error);
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
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
    return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
