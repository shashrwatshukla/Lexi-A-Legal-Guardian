import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../lib/drafter/geminiClient';
import { saveDraft } from '../../../lib/draftService';
import { generatePDFWithTemplate } from '../../../lib/pdfGenerator';

export async function POST(request) {
  try {
    const { mode, formData, userId } = await request.json();

    // CHECK AUTHENTICATION
    if (!userId) {
      console.error('❌ No userId provided');
      return NextResponse.json(
        { success: false, error: 'User not authenticated. Please login.' },
        { status: 401 }
      );
    }

    if (!formData?.prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting draft generation for user:', userId);

    const geminiClient = getGeminiClient();

    const systemPrompt = `You are an expert legal document drafter. Generate a complete, professionally formatted legal document.

CRITICAL FORMATTING INSTRUCTIONS - FOLLOW EXACTLY:

1. DOCUMENT TITLE:
   - First line MUST be the document type in ALL CAPS (e.g., "NON-DISCLOSURE AGREEMENT")
   - NO quotation marks around the title
   - Leave ONE blank line after title

2. MAJOR SECTION HEADINGS (use for main sections):
   - Format: "1. SECTION NAME IN ALL CAPS" (e.g., "1. DEFINITIONS", "2. OBLIGATIONS")
   - Must start with a number followed by period and space
   - Section name in ALL CAPS
   - Leave ONE blank line before each major heading
   - Leave ONE blank line after each major heading

3. SUB-HEADINGS (use for subsections):
   - Format: "1.1 Subsection Name" or "2.1 Specific Topic"
   - Use title case (first letter capitalized)
   - Leave ONE blank line before each sub-heading

4. BODY TEXT (regular paragraphs):
   - Write in complete sentences
   - Each paragraph should be 2-4 sentences
   - Leave ONE blank line between paragraphs
   - NO quotation marks at the start of paragraphs
   - Use proper legal language

5. RECITALS (if applicable):
   - Start with "RECITALS" as a major heading
   - Each recital starts with "WHEREAS" in the same line

6. SIGNATURE BLOCKS:
   - End with "IN WITNESS WHEREOF" section
   - Include spaces for signatures

NOW GENERATE THE DOCUMENT FOLLOWING THIS EXACT FORMAT.`;

    const userPrompt = `DRAFTING REQUEST: ${formData.prompt}

JURISDICTION: ${formData.jurisdiction || 'US Federal'}

Generate a complete legal document following the formatting rules exactly. Do NOT use quotation marks anywhere in the document except within actual quoted text.`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    console.log('🤖 Calling Gemini API...');

    const response = await geminiClient.generateContent(fullPrompt, {
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });

    let draft = response.text;
    console.log(`✅ Draft generated via ${response.source} (${response.isPaid ? 'PAID ✨' : 'FREE 💡'})`);
    console.log(`   Tokens used: ${response.tokensUsed}`);

    // Clean draft text
    draft = draft
      .replace(/```[\w]*\n?/g, '')
      .replace(/^["'`]+|["'`]+$/gm, '')
      .replace(/\*\*/g, '')
      .replace(/##\s/g, '')
      .trim();

    // Extract document title
    const lines = draft.split('\n');
    const documentTitle = lines[0]?.trim() || 'LEGAL DOCUMENT';

    console.log('📄 Document title:', documentTitle);
    console.log('📝 Generating PDF...');

    // Generate PDF
    const pdfBytes = await generatePDFWithTemplate(draft, documentTitle, 'Legal Document');
    
    console.log('✅ PDF generated:', (pdfBytes.length / 1024).toFixed(2), 'KB');
    console.log('💾 Saving to Firestore with base64...');

    // ✅ SAVE TO FIRESTORE (WITH BASE64 PDF)
    const savedDraft = await saveDraft(userId, {
      content: draft,
      title: documentTitle,
      pdfBytes: pdfBytes, // Will be converted to base64
      jurisdiction: formData.jurisdiction || 'Not specified'
    });

    console.log(`✅ Draft saved successfully with ID: ${savedDraft.id}`);

    return NextResponse.json({
      success: true,
      draft: draft,
      draftId: savedDraft.id,
      metadata: {
        model: 'gemini-2.0-flash',
        source: response.source,
        isPaid: response.isPaid,
        tokensUsed: response.tokensUsed,
        timestamp: new Date().toISOString(),
        jurisdiction: formData.jurisdiction || 'Not specified'
      }
    });

  } catch (error) {
    console.error('❌ Draft generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}