import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
    `;
    const queryParams = [];

    if (userId) {
      query += ` WHERE cp.participant_id IN (SELECT id FROM public.participants WHERE user_id = $1)`;
      queryParams.push(userId);
    }

    query += ` GROUP BY c.id;`;

    const { rows } = await client.query(query, queryParams);
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
    const {
      work_id,
      template_id,
      status = 'draft',
      internal_reference, // New field
      signing_location,   // New field
      additional_notes,   // New field
      publisher,          // New field
      publisher_percentage, // New field
      co_publishers,      // New field
      publisher_admin,    // New field
      participants
    } = body;

    if (!work_id || !template_id || !participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json({ error: 'work_id, template_id, and a non-empty array of participants are required.' }, { status: 400 });
    }

    await client.query('BEGIN');

    const contractQuery = `
      INSERT INTO public.contracts (
        work_id, template_id, status,
        internal_reference, signing_location, additional_notes,
        publisher, publisher_percentage, co_publishers, publisher_admin
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const contractValues = [
      work_id, template_id, status,
      internal_reference, signing_location, additional_notes,
      publisher, publisher_percentage, co_publishers, publisher_admin
    ];
    const contractResult = await client.query(contractQuery, contractValues);
    const newContract = contractResult.rows[0];

    const participantQuery = 'INSERT INTO public.contract_participants (contract_id, participant_id, role, percentage) VALUES ($1, $2, $3, $4)';
    for (const participant of participants) {
      if (!participant.id || !participant.role) {
        throw new Error('Each participant must have an id and a role.');
      }
      await client.query(participantQuery, [newContract.id, participant.id, participant.role, participant.percentage || null]);
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
            'role', cp.role,
            'percentage', cp.percentage
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
