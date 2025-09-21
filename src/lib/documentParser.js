// src/lib/documentParser.js
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    if (file.type === 'application/pdf') {
      // Parse PDF using pdf-parse
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdf(buffer);
      
      // Check if we got meaningful text
      if (!data.text || data.text.trim().length < 50) {
        throw new Error('Could not extract text from PDF. The file might be image-based or corrupted.');
      }
      
      // Clean up the text
      let cleanedText = data.text
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[^\x20-\x7E\n\r]/g, '') // Remove non-printable characters
        .trim();
      
      console.log('PDF parsed successfully. Text length:', cleanedText.length);
      console.log('First 500 chars:', cleanedText.substring(0, 500));
      
      return cleanedText;
      
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Parse DOCX using mammoth
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      
      if (!result.value || result.value.trim().length < 50) {
        throw new Error('Could not extract text from DOCX file.');
      }
      
      // Clean up the text
      let cleanedText = result.value
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      console.log('DOCX parsed successfully. Text length:', cleanedText.length);
      console.log('First 500 chars:', cleanedText.substring(0, 500));
      
      return cleanedText;
      
    } else if (file.type === 'text/plain') {
      // Parse TXT
      const text = new TextDecoder().decode(arrayBuffer);
      return text;
      
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

// Helper function to check if extracted text is meaningful
export function isTextMeaningful(text) {
  if (!text || text.length < 50) return false;
  
  // Check if text has too many special characters (likely corrupted)
  const specialCharRatio = (text.match(/[^a-zA-Z0-9\s.,;:!?'"()-]/g) || []).length / text.length;
  if (specialCharRatio > 0.3) return false;
  
  // Check if text has reasonable word structure
  const words = text.split(/\s+/);
  const avgWordLength = text.replace(/\s+/g, '').length / words.length;
  if (avgWordLength < 2 || avgWordLength > 20) return false;
  
  return true;
}

// Helper function to clean and prepare text for analysis
export function cleanTextForAnalysis(text) {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Remove page numbers and headers/footers patterns
  cleaned = cleaned.replace(/Page \d+ of \d+/gi, '');
  cleaned = cleaned.replace(/^\d+$/gm, ''); // Remove standalone numbers (likely page numbers)
  
  // Remove excessive line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned;
}