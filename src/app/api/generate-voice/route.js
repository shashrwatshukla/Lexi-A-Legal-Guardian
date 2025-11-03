import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../lib/drafter/geminiClient';

export async function POST(request) {
  try {
    const { text, riskLevel = 'Medium' } = await request.json();

    console.log('🎙️ Voice generation started');
    console.log(`   Text length: ${text.length} chars`);
    console.log(`   Risk level: ${riskLevel}`);

    const startTime = Date.now();

    let cleanedText = text
      .replace(/\*/g, '')
      .replace(/\#/g, '')
      .replace(/\_/g, '')
      .replace(/\~/g, '')
      .replace(/\`/g, '')
      .replace(/```math\s*/g, '')
      .replace(/```/g, '')
      .replace(/\[|\]/g, '')
      .replace(/\{|\}/g, '')
      .trim();

    console.log('✂️ Text cleaned');

    let emotionalInstructions = '';
    
    if (riskLevel === 'High') {
      emotionalInstructions = `Speak with genuine concern and urgency, like warning a close friend about danger.

EMOTIONAL EXPRESSIONS:
- Express shock: "Oh wow...", "Wait, this is concerning..."
- Show worry: "I'm honestly worried about this..."
- Use caution: "Listen carefully..."
- Add pauses: "This... this could be a problem."
- Speak slower when discussing risks

EXAMPLE: "Okay, so... *pause* I've gone through this contract and, honestly, I'm a bit worried. There are some serious red flags here..."`;
    } else if (riskLevel === 'Low') {
      emotionalInstructions = `Speak with enthusiasm and positivity, like sharing good news.

EMOTIONAL EXPRESSIONS:
- Express surprise: "Oh, this is good!", "Nice!"
- Show encouragement: "You're in good shape..."
- Use upbeat words: "So yeah,", "Awesome,"
- Add excitement: "And here's the best part..."

EXAMPLE: "Hey! So I just finished reviewing your contract and, honestly? This looks pretty good!"`;
    } else {
      emotionalInstructions = `Speak professionally but warmly, like a knowledgeable friend.

EMOTIONAL EXPRESSIONS:
- Show thoughtfulness: "Let me walk you through this..."
- Express balance: "There's good and bad here..."
- Use bridges: "Now,", "So,", "Alright,"
- Speak clearly and measured

EXAMPLE: "Alright, so I've reviewed the contract. It's a mixed bag..."`;
    }

    const voicePrompt = `You are Lexi, an empathetic AI legal assistant having a conversation.

${emotionalInstructions}

SPEAKING STYLE:
- Sound conversational, NOT formal
- Use natural speech: "So basically...", "Here's the thing..."
- Include genuine reactions
- Express curiosity, concern, relief, surprise
- Use contractions: "I've", "you're", "it's"
- Think aloud: "Hmm...", "Let me see..."
- Break down complex ideas simply
- Sound engaged and caring

CONTRACT ANALYSIS:
${cleanedText}

RULES:
1. NO asterisks, hashtags, or formatting symbols
2. DO NOT sound like reading a script
3. DO add natural pauses and reactions
4. DO make it conversational
5. DO express appropriate emotions
6. Keep facts accurate

Rewrite as spoken conversation:`;

    console.log('🌐 Enhancing with Gemini...');

    const geminiClient = getGeminiClient();
    
    const response = await geminiClient.generateContent(voicePrompt, {
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 1.3,
        topP: 0.95,
        topK: 50,
        maxOutputTokens: 2048,
      }
    });

    let generatedText = response.text;
    
    console.log(`✅ Enhanced via ${response.source} (${response.isPaid ? 'PAID ✨' : 'FREE 💡'})`);
    console.log(`   Tokens: ${response.tokensUsed}`);

    generatedText = generatedText
      .replace(/\*/g, '')
      .replace(/\#/g, '')
      .replace(/\_/g, '')
      .replace(/```math\s*/g, '')
      .replace(/```/g, '')
      .trim();

    console.log(`📝 Final text: ${generatedText.length} chars`);

    console.log('🎤 Converting to speech...');
    
    const { default: textToSpeech } = await import('@google-cloud/text-to-speech');
const path = require('path');

const credentialsPath = path.join(process.cwd(), 'google-cloud-credentials.json');

const ttsClient = new textToSpeech.TextToSpeechClient({
  keyFilename: credentialsPath,
  projectId: process.env.GOOGLE_CLOUD_PROJECT
});

console.log(`🎤 TTS Client initialized with project: ${process.env.GOOGLE_CLOUD_PROJECT}`);

    const [ttsResponse] = await ttsClient.synthesizeSpeech({
      input: { text: generatedText },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Journey-F',
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: riskLevel === 'High' ? 0.90 : (riskLevel === 'Low' ? 1.08 : 1.0),
        volumeGainDb: 3.0,
        effectsProfileId: ['headphone-class-device'],
      },
    });

    const endTime = Date.now();
    const generationTime = ((endTime - startTime) / 1000).toFixed(2);

    const audioBase64 = ttsResponse.audioContent.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
    
    const audioSizeKB = Math.ceil(audioBase64.length / 1024);
    
    console.log(`✅ Audio generated in ${generationTime}s (${audioSizeKB} KB)`);
    console.log('🎉 Voice generation complete!');

    return NextResponse.json({ 
      success: true,
      audioUrl,
      metadata: {
        wordCount: generatedText.split(/\s+/).length,
        estimatedDuration: Math.ceil((generatedText.split(/\s+/).length / 140) * 60),
        generationTime: parseFloat(generationTime),
        audioSizeKB,
        enhancedByGemini: true,
        geminiSource: response.source,
        usingPaidCredits: response.isPaid,
        tokensUsed: response.tokensUsed,
        emotionalTone: riskLevel,
        originalWordCount: text.split(/\s+/).length,
        ttsProvider: 'google-cloud',
        voice: 'en-US-Journey-F'
      }
    });

  } catch (error) {
    console.error('❌ Voice generation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Voice generation failed',
        details: error.message,
        errorType: error.name
      },
      { status: 500 }
    );
  }
}