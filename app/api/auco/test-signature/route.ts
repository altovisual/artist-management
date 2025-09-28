import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('=== TEST ENDPOINT CALLED ===');
    
    const body = await req.json();
    console.log('Request body:', body);
    
    // Test environment variables
    const envCheck = {
      AUCO_OWNER_EMAIL: process.env.AUCO_OWNER_EMAIL ? 'Present' : 'Missing',
      POSTGRES_URL_POOLER: process.env.POSTGRES_URL_POOLER ? 'Present' : 'Missing',
      AUCO_PRK: process.env.AUCO_PRK ? 'Present' : 'Missing',
      AUCO_PUK: process.env.AUCO_PUK ? 'Present' : 'Missing',
    };
    
    console.log('Environment variables:', envCheck);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test endpoint working',
      environment: envCheck,
      body 
    });
    
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      error: 'Test endpoint failed', 
      details: error.message 
    }, { status: 500 });
  }
}
