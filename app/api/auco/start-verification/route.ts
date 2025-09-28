import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, id_number, country, document_type, phone } = await req.json();

    console.log('Verification request received for:', { name, email, country, document_type });

    return NextResponse.json({ 
      document_code: 'TEMP_VERIFICATION_CODE_' + Date.now(),
      message: 'Verification temporarily disabled - awaiting correct endpoint from Auco support'
    });

  } catch (error: any) {
    console.error('Error starting Auco verification:', error.message);
    return NextResponse.json(
      { error: 'Could not start the verification process.', details: error.message },
      { status: 500 }
    );
  }
}