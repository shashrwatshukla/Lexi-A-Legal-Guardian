import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../lib/drafter/geminiClient';

async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        if (i === maxRetries - 1) throw error;
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retrying in ${delay}ms... (attempt ${i + 2}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

export async function POST(request) {
  console.log('=== Detailed Summary API Called ===');
  
  try {
    const { text, documentType } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json({
        success: false,
        error: 'Text too short or missing'
      }, { status: 400 });
    }

    console.log(`📄 Processing ${text.length} characters for detailed summary...`);

    const geminiClient = getGeminiClient();

        const prompt = `You are a professional legal document explainer for 5th-grade students. Your job is to create an EXTREMELY DETAILED, COMPREHENSIVE, LINE-BY-LINE summary that explains EVERY SINGLE PART of this document in simple language.

🎯 YOUR MISSION:
Transform this legal document into the MOST DETAILED, easy-to-understand summary possible. Imagine you're explaining it to a curious 10-year-old who asks "what does that mean?" after EVERY sentence.

📋 STRICT RULES:

1. ✅ EXPLAIN ABSOLUTELY EVERYTHING
   - Read the ENTIRE document from start to finish
   - Do NOT skip, summarize, or condense ANY section
   - Explain EVERY clause, EVERY sentence, EVERY term
   - If the document has 50 paragraphs, your summary should explain all 50

2. ✅ BE EXTREMELY DETAILED
   - For EACH sentence in the original, write 2-4 sentences explaining it
   - Break down complex ideas into multiple simple steps
   - Add real-world examples to clarify meaning
   - Use analogies that a child would understand

3. ✅ REPLACE ALL LEGAL JARGON - NO EXCEPTIONS
   - "abstained" → "chose not to vote yes or no, stayed neutral"
   - "pursuant to" → "according to" or "following the rules of"
   - "indemnify" → "pay for any damage or losses caused"
   - "notwithstanding" → "even though" or "despite"
   - "hereinafter" → "from now on in this document, we will call it"
   - "party of the first part" → "the first person or company mentioned"
   - "whereas" → "because" or "since"
   - "thereof" → "of that thing"
   - "aforementioned" → "mentioned earlier" or "talked about before"
   - "henceforth" → "from this point forward"
   - "covenant" → "promise" or "agreement to do something"
   - "consideration" → "payment or something valuable exchanged"
   - "force majeure" → "unexpected events no one can control (like natural disasters)"
   - "in perpetuity" → "forever, with no end date"
   - "liable" → "responsible for" or "has to pay for"
   - "null and void" → "canceled, no longer valid, doesn't count anymore"
   - "remuneration" → "payment" or "money earned"
   - "rescind" → "cancel" or "take back"
   - "severability" → "if one part is invalid, the rest still works"
   - "waive" → "give up a right" or "choose not to use a right you have"

4. ✅ EXPLAIN LIKE STORYTELLING
   - Use "you" and "they" instead of legal terms
   - Start each explanation with context: "This section is about..."
   - End with impact: "This means that in real life..."
   - Connect ideas: "Because of what we just read, this next part says..."

5. ✅ NEVER USE ASTERISKS OR MARKDOWN
   - Do NOT use ** for bold
   - Do NOT use * at all
   - Use bullet points with • symbol only when listing items
   - Write in plain text with CAPITAL LETTERS for emphasis if needed

6. ✅ STRUCTURE - FOLLOW THIS EXACTLY:

WHAT THIS DOCUMENT IS ABOUT
[3-5 detailed paragraphs explaining the complete purpose, who it affects, and why it exists]

THE PEOPLE OR COMPANIES INVOLVED
[Detailed explanation of each party - who they are, their role, what they're responsible for]

---

SECTION 1: [CLEAR HEADING DESCRIBING WHAT THIS SECTION COVERS]

[First paragraph of original document explained in detail]
This section talks about [topic]. Let me break this down:

The document says [paraphrase original]. This means [simple explanation]. In other words, [even simpler version]. For example, imagine [real-world example].

[Continue for EVERY paragraph in this section]

---

SECTION 2: [NEXT HEADING]

[Same detailed treatment for every part]

---

[Continue for ALL sections - don't skip anything]

---

IMPORTANT DATES AND DEADLINES

• [Date 1 with full context]: What happens - [Explain in 2-3 sentences why this matters and what you should do]
• [Date 2 with full context]: What happens - [Detailed explanation]
[List ALL dates mentioned in the document]

---

MONEY, PAYMENTS, AND COSTS

[Extremely detailed breakdown of every financial term]
- Who pays what
- When they pay
- What happens if they don't pay
- Any fees, penalties, or refunds
[Explain EVERY financial clause in the document]

---

WHAT HAPPENS IF THINGS GO WRONG

[Detailed explanation of consequences, penalties, disputes, termination]
[Cover EVERY "what if" scenario in the document]

---

YOUR RIGHTS AND RESPONSIBILITIES

[Break down every right and every obligation]
[Explain what you MUST do vs what you CAN do]

---

LEGAL JARGON EXPLAINED

• TERM 1: Simple definition in one sentence
• TERM 2: Simple definition in one sentence
[List EVERY complex word found in the document]

---

KEY THINGS TO REMEMBER

• [Most critical point 1 - explained in detail with why it matters]
• [Most critical point 2 - explained in detail with why it matters]
• [Most critical point 3 - explained in detail with why it matters]
• [Continue for at least 8-10 key points]

---

7. ✅ LEVEL OF DETAIL EXAMPLE:

ORIGINAL: "India abstained its vote in UN"

YOUR DETAILED EXPLANATION:
"This sentence is telling us about a decision that the country of India made during a United Nations meeting. Let me explain each part:

First, what is the United Nations? The United Nations, which people usually call the UN for short, is like a big club where countries from all around the world come together. They meet to talk about important world problems and try to make decisions together about how to solve them.

Now, what does it mean that India 'abstained its vote'? When there's a meeting and people need to make a decision, they usually vote. Voting means you choose yes or no. But there's a third option called abstaining. When you abstain, you're choosing NOT to say yes and NOT to say no. You're staying neutral, which means you're not picking a side.

Think of it like this: Imagine your friends are voting on whether to play soccer or basketball. If you abstain, you're saying 'I'm not going to help decide - you all choose without me.' You're sitting on the fence, not picking either sport.

So India decided to stay neutral. They didn't vote for the idea, and they didn't vote against it. They chose to let other countries make the decision without India's input. Countries might abstain for different reasons - maybe they need more time to think, maybe they don't want to upset other countries, or maybe they simply don't have a strong opinion either way.

In this particular UN meeting, India made this choice to abstain, which means their vote didn't count as a yes or a no - it was recorded as neutral."

THIS IS THE LEVEL OF DETAIL I EXPECT FOR EVERY PART OF THE DOCUMENT.

---

NOW EXPLAIN THIS COMPLETE DOCUMENT IN EXTREME DETAIL:

${text}

---

REMEMBER: 
- Explain EVERY section, EVERY clause, EVERY sentence
- Do NOT skip or summarize
- Write as if explaining to someone who knows NOTHING about legal documents
- Your explanation should be 3-5 times LONGER than the original document
- NO asterisks (*) - use • for bullets only

START YOUR EXTREMELY DETAILED EXPLANATION NOW (begin with "WHAT THIS DOCUMENT IS ABOUT"):`;

    console.log('🤖 Calling Gemini API for detailed summary...');
    
    const response = await retryWithBackoff(async () => {
      return await geminiClient.generateContent(prompt, {
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
        }
      });
    });

    let aiResponse = response.text;

    console.log('✅ Received detailed summary:', aiResponse.length, 'chars');
    console.log(`   Via ${response.source} (${response.isPaid ? 'PAID ✨' : 'FREE 💡'})`);
    console.log(`   Tokens: ${response.tokensUsed}`);

    // Clean up any meta-commentary
    let detailedSummary = aiResponse
      .replace(/^(Here is|Here's|Below is).*?\n/i, '')
      .replace(/^(Detailed|Complete|Full) (Summary|Explanation):?\s*\n/i, '')
      .replace(/^---+\s*\n/gm, '')
      .trim();

    // Validation
    const inputLength = text.length;
    const outputLength = detailedSummary.length;
    const expansionRatio = outputLength / inputLength;

    console.log(`📊 Summary Stats:`);
    console.log(`   Input: ${inputLength} chars`);
    console.log(`   Output: ${outputLength} chars`);
    console.log(`   Expansion: ${(expansionRatio * 100).toFixed(0)}%`);

    // A detailed summary should be LONGER than original (expanded explanation)
    if (expansionRatio < 0.8) {
      console.warn('⚠️ Summary seems too short, might not be detailed enough');
    }

    if (!detailedSummary || detailedSummary.length < 200) {
      throw new Error('AI did not generate valid detailed summary');
    }

    return NextResponse.json({
      success: true,
      detailedSummary: detailedSummary,
      originalLength: inputLength,
      summaryLength: outputLength,
      expansionRatio: Math.round(expansionRatio * 100),
      metadata: {
        aiSource: response.source,
        usingPaidCredits: response.isPaid,
        tokensUsed: response.tokensUsed,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.message?.includes('503')) {
      return NextResponse.json({
        success: false,
        error: 'AI service busy. Please wait 10 seconds and try again.',
        retryable: true
      }, { status: 503 });
    } else if (error.message?.includes('quota')) {
      return NextResponse.json({
        success: false,
        error: 'API quota exceeded. Please try again later.',
        retryable: false
      }, { status: 429 });
    } else {
      return NextResponse.json({
        success: false,
        error: error.message || 'Summary generation failed',
        retryable: true
      }, { status: 500 });
    }
  }
}

export async function GET() {
  const geminiClient = getGeminiClient();
  const stats = geminiClient.getStats();
  
  return NextResponse.json({ 
    message: 'Detailed Summary API',
    status: 'active',
    configured: stats.configured,
    model: 'gemini-2.0-flash'
  });
}