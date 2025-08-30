import axios from 'axios';
import pdfParse from 'pdf-parse';

interface PageData {
  index: number;
  title: string | null;
  text: string;
  numbers: string[];
}

/**
 * Downloads a PDF from a URL and parses it into text
 * @param url The URL of the PDF to download
 * @returns Parsed PDF data with text extracted per page
 */
export async function downloadAndParsePdf(url: string): Promise<PageData[]> {
  try {
    // Download the PDF file
    console.log(`Downloading PDF from ${url}`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
      headers: {
        'Accept': 'application/pdf'
      }
    });

    // Check if the response is a PDF
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error('The URL did not return a PDF file');
    }

    // Parse the PDF
    const pdfBuffer = Buffer.from(response.data);
    const pdfData = await pdfParse(pdfBuffer);

    // Process the PDF text into pages
    return processPdfText(pdfData);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('PDF download timed out');
      }
      if (error.response) {
        throw new Error(`Failed to download PDF: HTTP ${error.response.status}`);
      }
      throw new Error(`Failed to download PDF: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Processes raw PDF text into structured page data
 * @param pdfData The raw PDF data from pdf-parse
 * @returns Array of page data with extracted information
 */
function processPdfText(pdfData: pdfParse.Result): PageData[] {
  // Split the text into pages (pdf-parse already separates pages with form feed character)
  const pages = pdfData.text.split('\f').filter(page => page.trim().length > 0);

  return pages.map((pageText, index) => {
    // Extract potential title (first line or prominent text)
    const lines = pageText.split('\n').filter(line => line.trim().length > 0);
    const potentialTitle = lines.length > 0 ? lines[0].trim() : null;

    // Extract numbers (simple regex for now)
    const numberRegex = /\b\d+([.,]\d+)?%?\b/g;
    const numbers = pageText.match(numberRegex) || [];

    return {
      index: index + 1, // 1-based index for pages
      title: potentialTitle,
      text: pageText.trim(),
      numbers: numbers
    };
  });
}