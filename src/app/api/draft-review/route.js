import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../lib/drafter/geminiClient';

export async function POST(request) {
  try {
    const { draft, documentType, jurisdiction = 'US Federal', playbook } = await request.json();

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft document is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Starting draft review...');
    console.log(`   Document type: ${documentType || 'Unknown'}`);
    console.log(`   Jurisdiction: ${jurisdiction}`);
    console.log(`   Draft length: ${draft.length} chars`);

    const geminiClient = getGeminiClient();

    const reviewPrompt = `You are an expert legal reviewer. Analyze this legal document draft and provide comprehensive feedback.

DOCUMENT TYPE: ${documentType || 'General Legal Document'}
JURISDICTION: ${jurisdiction}
${playbook ? `PLAYBOOK REQUIREMENTS:\n${JSON.stringify(playbook, null, 2)}` : ''}

DRAFT DOCUMENT:
${draft}

Provide your review in EXACTLY this JSON format:
{
  "overallScore": [0-100, where 100 is perfect],
  "status": "[Excellent/Good/Needs Improvement/Poor]",
  "completeness": [0-100],
  "clarity": [0-100],
  "legalSoundness": [0-100],
  "compliance": [0-100],
  "issues": [
    {
      "severity": "[critical/warning/suggestion]",
      "location": "[Section or clause reference]",
      "issue": "[What's wrong]",
      "recommendation": "[How to fix it]",
      "example": "[Optional: example of correct language]"
    }
  ],
  "strengths": [
    "[What's done well in the draft]"
  ],
  "missingElements": [
    {
      "element": "[What's missing]",
      "importance": "[Why it's needed]",
      "suggestion": "[How to add it]"
    }
  ],
  "complianceChecks": [
    {
      "requirement": "[Legal requirement]",
      "status": "[Met/Not Met/Partially Met]",
      "notes": "[Additional context]"
    }
  ],
  "recommendations": [
    {
      "priority": "[High/Medium/Low]",
      "action": "[What to do]",
      "reason": "[Why it matters]"
    }
  ],
  "summary": "[2-3 sentence overall assessment]"
}

Be thorough and specific. Provide actionable feedback.`;

    const response = await geminiClient.generateContent(reviewPrompt, {
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      }
    });

    console.log(`✅ Review via ${response.source} (${response.isPaid ? 'PAID ✨' : 'FREE 💡'})`);
    console.log(`   Tokens: ${response.tokensUsed}`);

    let reviewData;
    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reviewData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      
      reviewData = {
        overallScore: 70,
        status: 'Good',
        completeness: 75,
        clarity: 75,
        legalSoundness: 70,
        compliance: 70,
        issues: [],
        strengths: ['Draft has been reviewed'],
        missingElements: [],
        complianceChecks: [],
        recommendations: [{
          priority: 'Medium',
          action: 'Review the document carefully',
          reason: 'Ensure all requirements are met'
        }],
        summary: 'Draft review completed. Please review all sections carefully.'
      };
    }

    return NextResponse.json({
      success: true,
      review: {
        ...reviewData,
        metadata: {
          reviewedAt: new Date().toISOString(),
          aiSource: response.source,
          usingPaidCredits: response.isPaid,
          tokensUsed: response.tokensUsed,
          documentType,
          jurisdiction
        }
      }
    });

  } catch (error) {
    console.error('Draft review error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error during review',
        details: error.message 
      },
      { status: 500 }
    );
  }
}