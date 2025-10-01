/**
 * Generates a PDF from an HTML string using PDFShift API
 * @param html The HTML content to convert.
 * @returns A Promise that resolves with the PDF buffer.
 */
export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  try {
    console.log('Generating PDF with PDFShift...');
    
    const apiKey = process.env.PDFSHIFT_API_KEY;
    
    if (!apiKey) {
      console.warn('PDFSHIFT_API_KEY not found, using fallback method');
      return generatePdfFallback(html);
    }

    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`
      },
      body: JSON.stringify({
        source: html,
        format: 'A4',
        margin: '20px',
        print_background: true
      })
    });

    if (!response.ok) {
      throw new Error(`PDFShift error: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.log('Trying fallback method...');
    return generatePdfFallback(html);
  }
}

/**
 * Fallback method using a simple HTML to PDF conversion
 */
async function generatePdfFallback(html: string): Promise<Buffer> {
  try {
    // Use html-pdf-node as fallback (lightweight alternative)
    const htmlPdf = require('html-pdf-node');
    
    const options = { 
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    };
    
    const file = { content: html };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    return Buffer.from(pdfBuffer);
  } catch (fallbackError) {
    console.error('Fallback PDF generation also failed:', fallbackError);
    throw new Error('Failed to generate PDF from HTML. Please check your configuration.');
  }
}
