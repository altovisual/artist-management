import { NextResponse } from 'next/server';

// TODO: It's not clear from the existing code if this is the correct URL.
const AUCO_API_URL = 'https://api.auco.ai/validate';

export async function POST(req: Request) {
  try {
    const { name, email, id_number } = await req.json();

    const aucoApiSecret = process.env.AUCO_API_SECRET;
    if (!aucoApiSecret) {
      throw new Error('AUCO_API_SECRET is not set on the server.');
    }

    const aucoResponse = await fetch(AUCO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aucoApiSecret}`,
      },
      body: JSON.stringify({ name, email, identification: id_number })
    });

    if (!aucoResponse.ok) {
      const errorBody = await aucoResponse.text();
      console.error('Auco API Error:', errorBody);
      throw new Error(`The Auco API responded with an error: ${errorBody}`);
    }

    const { document_code } = await aucoResponse.json();

    return NextResponse.json({ document_code });

  } catch (error: any) {
    console.error('Error starting Auco verification:', error);
    return NextResponse.json(
      { error: 'Could not start the verification process.', details: error.message },
      { status: 500 }
    );
  }
}