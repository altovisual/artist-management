import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, id_number, country, document_type, phone } = await req.json();

    const ownerEmail = process.env.AUCO_OWNER_EMAIL;
    const aucoApiBase = process.env.AUCO_API_BASE; // The one WITHOUT /ext
    const aucoPrk = process.env.AUCO_PRK; // The private key for POST requests

    if (!ownerEmail || !aucoApiBase || !aucoPrk) {
      let missing = [];
      if (!ownerEmail) missing.push('AUCO_OWNER_EMAIL');
      if (!aucoApiBase) missing.push('AUCO_API_BASE');
      if (!aucoPrk) missing.push('AUCO_PRK');
      throw new Error(`Server configuration error. Missing environment variables: ${missing.join(', ')}`);
    }

    const body = {
      email: ownerEmail,
      platform: "web",
      name,
      phone,
      country,
      type: document_type,
      identification: id_number,
      userEmail: email
    };

    const aucoResponse = await fetch(`${aucoApiBase}/veriface`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': aucoPrk, // Send the private key directly, no "Bearer"
      },
      body: JSON.stringify(body)
    });

    if (!aucoResponse.ok) {
      const errorBody = await aucoResponse.text();
      console.error('Auco API Error:', errorBody);
      throw new Error(`The Auco API responded with an error: ${errorBody}`);
    }

    const responseData = await aucoResponse.json();

    if (!responseData.code) {
        throw new Error(`Unexpected response from Auco /veriface endpoint: ${JSON.stringify(responseData)}`);
    }

    return NextResponse.json({ document_code: responseData.code });

  } catch (error: any) {
    console.error('Error starting Auco verification:', error.message);
    return NextResponse.json(
      { error: 'Could not start the verification process.', details: error.message },
      { status: 500 }
    );
  }
}