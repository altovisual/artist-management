import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a connection pool to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query('SELECT * FROM public.projects');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch works' }, { status: 500 });
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
      name,
      type,
      artist_id,
      status = 'planning',
      release_date,
      description,
      isrc,
      upc,
      genre,
      duration,
      alternative_title, // New field
      iswc,              // New field
      participant_ids
    } = body;

    // Basic validation, now including artist_id
    if (!name || !type || !artist_id) {
      return NextResponse.json({ error: 'Name, type, and artist_id are required fields.' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. Insert the work into the projects table
    const projectQuery = `
      INSERT INTO public.projects (
        name, type, artist_id, status, release_date, description, isrc, upc, genre, duration,
        alternative_title, iswc
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const projectValues = [
      name, type, artist_id, status, release_date, description, isrc, upc, genre, duration,
      alternative_title, iswc
    ];
    const projectResult = await client.query(projectQuery, projectValues);
    const newWork = projectResult.rows[0];

    // 2. Insert author/owner relationships into the join table
    if (participant_ids && participant_ids.length > 0) {
      const participantQuery = 'INSERT INTO public.work_participants (project_id, participant_id) VALUES ($1, $2)';
      for (const participantId of participant_ids) {
        await client.query(participantQuery, [newWork.id, participantId]);
      }
    }

    await client.query('COMMIT');

    return NextResponse.json(newWork, { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database Error on POST /api/works:', error);
    return NextResponse.json({ error: 'Failed to create work' }, { status: 500 });
  } finally {
    client.release();
  }
}
