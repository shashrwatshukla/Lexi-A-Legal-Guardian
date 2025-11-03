import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../lib/drafter/geminiClient';

export async function POST(request) {
  try {
    const { message, conversationHistory, documentContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'No message provided' },
        { status: 400 }
      );
    }

    console.log('💬 Chatbot query:', message.substring(0, 100));

    const geminiClient = getGeminiClient();

    // Build context
    let fullPrompt = `You are Lexi, a friendly and knowledgeable AI assistant specializing in legal matters.

🎯 YOUR CAPABILITIES:
- Answer ANY question the user asks (legal or non-legal)
- Explain legal concepts in simple language
- Analyze contracts and documents
- Provide general knowledge and help
- Be conversational and helpful

📋 GUIDELINES:
- Answer EVERY question directly and completely
- If it's a legal question, provide detailed legal insight
- If it's a general question (like "What is AI?", "Tell me a joke"), answer it naturally
- Keep responses conversational and friendly
- Use examples when helpful
- If you're uncertain, say so and suggest consulting an expert
- Maximum 3-4 paragraphs unless user asks for more detail

`;

    // Add document context if available
    if (documentContext && documentContext.fileName) {
      fullPrompt += `\n📄 DOCUMENT LOADED:\n`;
      fullPrompt += `File: "${documentContext.fileName}"\n`;
      fullPrompt += `Type: ${documentContext.documentType}\n`;
      fullPrompt += `Risk Level: ${documentContext.riskLevel} (${documentContext.overallRiskScore}/100)\n`;
      fullPrompt += `Summary: ${documentContext.summary}\n`;
      
      if (documentContext.parties && documentContext.parties.length > 0) {
        fullPrompt += `Parties: ${documentContext.parties.join(', ')}\n`;
      }
      
      if (documentContext.mainConcerns && documentContext.mainConcerns.length > 0) {
        fullPrompt += `Main Concerns: ${documentContext.mainConcerns.join('; ')}\n`;
      }
      
      fullPrompt += `\nℹ️ When user asks about "the document", "this contract", or specific clauses, refer to this document.\n`;
      fullPrompt += `But ALSO answer general questions that are unrelated to the document.\n\n`;
    }

    // Add conversation history (last 10 messages for context)
    if (conversationHistory && conversationHistory.length > 0) {
      fullPrompt += `\n💬 RECENT CONVERSATION:\n`;
      const recentMsgs = conversationHistory.slice(-10);
      recentMsgs.forEach(msg => {
        const role = msg.type === 'user' ? 'User' : 'Lexi';
        const text = msg.text.substring(0, 200); // Limit length
        fullPrompt += `${role}: ${text}\n`;
      });
      fullPrompt += `\n`;
    }

    // Add current question
    fullPrompt += `\n❓ USER'S CURRENT QUESTION:\n${message}\n\n`;
    fullPrompt += `💡 YOUR RESPONSE (be helpful and answer the question directly):\n`;

    const response = await geminiClient.generateContent(fullPrompt, {
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    let botResponse = response.text
      .replace(/```[\w]*\n?/g, '')
      .replace(/^["'`]+|["'`]+$/gm, '')
      .trim();

    console.log(`✅ Chatbot via ${response.source} (${response.isPaid ? 'PAID ✨' : 'FREE 💡'})`);
    console.log(`   Tokens: ${response.tokensUsed}`);

    return NextResponse.json({
      success: true,
      response: botResponse,
      metadata: {
        source: response.source,
        isPaid: response.isPaid,
        tokensUsed: response.tokensUsed,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Chatbot error:', error);
    console.error('Full error details:', error.stack);
    
    // Handle rate limiting
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded',
          response: "I'm getting too many requests right now. Please wait about 2 seconds and try again! 😊"
        },
        { status: 429 }
      );
    }
    
    // Handle authentication errors
    if (error.message?.includes('403') || error.message?.includes('authentication')) {
      console.error('🔒 Authentication error - check your credentials');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication failed',
          response: "I'm having trouble connecting. Please contact support if this continues."
        },
        { status: 500 }
      );
    }
    
    // Handle other errors with more detail
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to process your question',
        response: "Oops! I encountered an error. Please try again in a moment."
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Chatbot API is running',
    model: 'gemini-2.0-flash',
    capabilities: [
      'Answer legal questions',
      'Analyze documents',
      'General knowledge questions',
      'Conversational AI'
    ]
  });
}