import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: Request) {
  try {
    const { html } = await request.json();

    if (!html) {
      console.error('PDF Generation Error: HTML content is missing.');
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    console.log('PDF Generation: Received HTML content (first 500 chars):', html.substring(0, 500));

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Important for running in many environments
    });
    const page = await browser.newPage();
    
    // Set content and wait for it to be fully loaded
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Crucial for including background colors/images
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    // Create a blob from the PDF buffer
    const nodeBuffer = Buffer.from(pdfBuffer);
    const blob = new Blob([nodeBuffer], { type: 'application/pdf' });

    // Return the PDF with correct headers
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="contract.pdf"'
      },
    });

  } catch (error: any) {
    console.error('Error generating PDF:', error.message, error.stack);
    return NextResponse.json({ error: 'Failed to generate PDF', details: error.message }, { status: 500 });
  }
}