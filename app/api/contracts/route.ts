import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
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
      GROUP BY c.id;
    `;
    const { rows } = await client.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { work_id, template_id, status = 'draft', participants } = body;

    if (!work_id || !template_id || !participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json({ error: 'work_id, template_id, and a non-empty array of participants are required.' }, { status: 400 });
    }

    await client.query('BEGIN');

    const contractQuery = `
      INSERT INTO public.contracts (work_id, template_id, status)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const contractValues = [work_id, template_id, status];
    const contractResult = await client.query(contractQuery, contractValues);
    const newContract = contractResult.rows[0];

    const participantQuery = 'INSERT INTO public.contract_participants (contract_id, participant_id, role) VALUES ($1, $2, $3)';
    for (const participant of participants) {
      if (!participant.id || !participant.role) {
        throw new Error('Each participant must have an id and a role.');
      }
      await client.query(participantQuery, [newContract.id, participant.id, participant.role]);
    }

    await client.query('COMMIT');

    // Refetch the created contract with its participants to return it in the response
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
    const { rows } = await client.query(refetchQuery, [newContract.id]);


    return NextResponse.json(rows[0], { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database Error on POST /api/contracts:', error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  } finally {
    client.release();
  }
}
