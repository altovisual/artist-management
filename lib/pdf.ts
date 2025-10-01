/**
 * Generates a PDF from an HTML string using PDFShift API or jsPDF as fallback
 * @param html The HTML content to convert.
 * @returns A Promise that resolves with the PDF buffer.
 */
export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  const apiKey = process.env.PDFSHIFT_API_KEY;
  
  // Try PDFShift first if API key is available
  if (apiKey) {
    try {
      console.log('Generating PDF with PDFShift...');
      
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
        const errorText = await response.text();
        console.error(`PDFShift error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`PDFShift error: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('PDF generated successfully with PDFShift');
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error with PDFShift, trying fallback:', error);
      // Continue to fallback
    }
  }

  // Fallback: Use simple HTML to text conversion with jsPDF
  console.log('Using jsPDF fallback method...');
  return generatePdfFallback(html);
}

/**
 * Fallback method using jsPDF (client-side library that works in Node.js)
 */
function generatePdfFallback(html: string): Buffer {
  try {
    const { jsPDF } = require('jspdf');
    
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Strip HTML tags and get plain text
    const plainText = html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Add text to PDF
    const lines = doc.splitTextToSize(plainText, 180);
    doc.text(lines, 15, 15);

    // Get PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('PDF generated with jsPDF fallback');
    return pdfBuffer;
  } catch (fallbackError) {
    console.error('Fallback PDF generation failed:', fallbackError);
    throw new Error('Failed to generate PDF. Please configure PDFSHIFT_API_KEY in your environment variables.');
  }
}
