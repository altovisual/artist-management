import puppeteer from 'puppeteer';

/**
 * Generates a PDF from an HTML string.
 * @param html The HTML content to convert.
 * @returns A Promise that resolves with the PDF buffer.
 */
export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  let browser;
  try {
    console.log('Launching headless browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessary for running in some environments
    });
    const page = await browser.newPage();

    console.log('Setting page content...');
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error);
    throw new Error('Failed to generate PDF from HTML.');
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
}
