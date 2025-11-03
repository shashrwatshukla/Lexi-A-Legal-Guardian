import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generatePDFWithTemplate(documentText, documentTitle, documentType) {
  try {
    const pdfDoc = await PDFDocument.create();
    
    // Load template
    const response = await fetch('/media/Templates-page.png');
    if (!response.ok) throw new Error('Template not found');
    const templateBytes = await response.arrayBuffer();
    const templateImage = await pdfDoc.embedPng(templateBytes);
    
    const { width: pageWidth, height: pageHeight } = templateImage.scale(1);
    
    // Fonts
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // ===========================================
    // CRITICAL SETTINGS - DO NOT CHANGE
    // ===========================================
    
    // FOOTER SAFE ZONE - 130px from bottom - NEVER ENTER
    const FOOTER_SAFE_ZONE = 130;
    
    // Margins
    const MARGIN_LEFT = 70;
    const MARGIN_RIGHT = 70;
    const MARGIN_TOP = 180;  // Space for logo
    const MARGIN_BOTTOM = FOOTER_SAFE_ZONE + 50; // Footer + extra safety
    
    // Available space for content
    const USABLE_WIDTH = pageWidth - MARGIN_LEFT - MARGIN_RIGHT;
    const USABLE_HEIGHT = pageHeight - MARGIN_TOP - MARGIN_BOTTOM;
    
    // FONT SIZES - MATCHING YOUR FOOTER
    const SIZE_TITLE = 55;           // Footer "LEXI" text size
    const SIZE_BODY = 28;            // Footer small text size
    const SIZE_MAJOR_HEADING = 35;   // 1.5 × body text (20 × 1.5 = 30)
    const SIZE_SUB_HEADING = 28;     // *NEW: Same as body, but will be bold*
    
    // Line heights
    const LINE_HEIGHT_BODY = 28;     // 20 + 8px spacing
    const LINE_HEIGHT_HEADING = 40;  // 30 + 10px spacing
    
    const textColor = rgb(0.21, 0.21, 0.21);
    
    // Clean text
    const cleanText = documentText
      .replace(/^["']+|["']+$/gm, '')
      .replace(/\\/g, '')
      .replace(/#+\s/g, '')
      .trim();
    
    // Parse document
    const blocks = [];
    const lines = cleanText.split('\n').filter(l => l.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Title (first line, all caps)
      if (i === 0 && line === line.toUpperCase() && line.length > 10 && !/^\d/.test(line)) {
        blocks.push({ type: 'title', text: line });
        continue;
      }
      
      // Major heading (numbered caps: "1. DEFINITIONS")
      if (/^\d+\.\s+[A-Z\s]{5,}$/.test(line)) {
        blocks.push({ type: 'heading', text: line });
        continue;
      }
      
      // *NEW: Sub-heading detection (e.g., "2.1 Non-Disclosure")*
      if (/^\d+\.\d+\s+[A-Z]/.test(line)) {
        blocks.push({ type: 'subheading', text: line });
        continue;
      }
      
      // Body text
      blocks.push({ type: 'body', text: line });
    }
    
    // Calculate pages
    const pages = [];
    let currentPage = [];
    let currentY = 0;
    
    for (const block of blocks) {
      let blockHeight = 0;
      
      if (block.type === 'title') {
        blockHeight = SIZE_TITLE + 40;  // Increased spacing
      } else if (block.type === 'heading') {
        blockHeight = SIZE_MAJOR_HEADING + 70;  // *INCREASED: More space after major sections*
      } else if (block.type === 'subheading') {
        blockHeight = SIZE_SUB_HEADING + 35;  // Space for sub-headings
      } else {
        const lines = wrapText(block.text, USABLE_WIDTH, SIZE_BODY, regularFont);
        blockHeight = lines.length * LINE_HEIGHT_BODY + 20;  // Increased paragraph spacing
      }
      
      // CHECK: Will this fit without entering footer zone?
      if (currentY + blockHeight > USABLE_HEIGHT) {
        if (currentPage.length > 0) {
          pages.push([...currentPage]);
          currentPage = [];
          currentY = 0;
        }
      }
      
      currentPage.push(block);
      currentY += blockHeight;
    }
    
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    
    // Render pages
    const totalPages = pages.length;
    
    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      
      // Draw template
      page.drawImage(templateImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
      
      // ===========================================
      // *CHANGED: PAGE NUMBER - TOP RIGHT*
      // ===========================================
      const pageText = `Page ${pageNum + 1} of ${totalPages}`;
      const pageTextWidth = regularFont.widthOfTextAtSize(pageText, 20);
      
      page.drawText(pageText, {
        x: pageWidth - MARGIN_RIGHT - pageTextWidth,  // *RIGHT ALIGNED*
        y: pageHeight - 30,
        size: 20,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Start content position
      let yPos = pageHeight - MARGIN_TOP;
      
      // Draw blocks
      for (const block of pages[pageNum]) {
        if (block.type === 'title') {
          // 28px, BOLD, CENTERED
          const titleWidth = boldFont.widthOfTextAtSize(block.text, SIZE_TITLE);
          const titleX = (pageWidth - titleWidth) / 2;
          
          page.drawText(block.text, {
            x: titleX,
            y: yPos,
            size: SIZE_TITLE,
            font: boldFont,
            color: textColor,
          });
          
          yPos -= SIZE_TITLE + 40;  // Increased spacing
          
        } else if (block.type === 'heading') {
          // 30px, BOLD, LEFT
          yPos -= 30; // *INCREASED: Extra space before major sections*
          
          page.drawText(block.text, {
            x: MARGIN_LEFT,
            y: yPos,
            size: SIZE_MAJOR_HEADING,
            font: boldFont,
            color: textColor,
          });
          
          yPos -= SIZE_MAJOR_HEADING + 40;  // *INCREASED: More space after*
          
        } else if (block.type === 'subheading') {
          // *NEW: Sub-headings (bold, same size as body)*
          yPos -= 10; // Small space before
          
          page.drawText(block.text, {
            x: MARGIN_LEFT,
            y: yPos,
            size: SIZE_SUB_HEADING,
            font: boldFont,  // *BOLD*
            color: textColor,
          });
          
          yPos -= SIZE_SUB_HEADING + 25;
          
        } else {
          // 20px, REGULAR, JUSTIFIED
          const lines = wrapText(block.text, USABLE_WIDTH, SIZE_BODY, regularFont);
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isLast = i === lines.length - 1;
            
            if (isLast || line.split(' ').length < 3) {
              // Last line - left align
              page.drawText(line, {
                x: MARGIN_LEFT,
                y: yPos,
                size: SIZE_BODY,
                font: regularFont,
                color: textColor,
              });
            } else {
              // JUSTIFIED
              const words = line.split(' ');
              const wordWidths = words.map(w => regularFont.widthOfTextAtSize(w, SIZE_BODY));
              const totalWordWidth = wordWidths.reduce((a, b) => a + b, 0);
              const spaceWidth = (USABLE_WIDTH - totalWordWidth) / (words.length - 1);
              
              let xPos = MARGIN_LEFT;
              for (let j = 0; j < words.length; j++) {
                page.drawText(words[j], {
                  x: xPos,
                  y: yPos,
                  size: SIZE_BODY,
                  font: regularFont,
                  color: textColor,
                });
                xPos += wordWidths[j] + (j < words.length - 1 ? spaceWidth : 0);
              }
            }
            
            yPos -= LINE_HEIGHT_BODY;
          }
          
          yPos -= 20; // *INCREASED: Paragraph spacing*
        }
        
        // SAFETY CHECK: Are we entering footer zone?
        const currentBottom = pageHeight - yPos;
        const footerStart = MARGIN_BOTTOM;
        
        if (currentBottom >= pageHeight - footerStart) {
          console.warn('Content approaching footer zone - stopping');
          break;
        }
      }
    }
    
    return await pdfDoc.save();
    
  } catch (error) {
    console.error('PDF Error:', error);
    throw error;
  }
}

function wrapText(text, maxWidth, fontSize, font) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  
  if (line) lines.push(line);
  return lines;
}

export function createPDFBlobUrl(pdfBytes) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

export function downloadPDF(pdfBytes, filename) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}