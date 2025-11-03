import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../lib/drafter/geminiClient';

export async function POST(request) {
  try {
    const { category, jurisdiction, searchQuery } = await request.json();

    const geminiClient = getGeminiClient();

    const prompt = `Generate legal clause templates for the following:

Category: ${category || 'General'}
Jurisdiction: ${jurisdiction || 'US Federal'}
Search Query: ${searchQuery || 'Standard clauses'}

Provide 5-10 professionally drafted clause templates in JSON format:
{
  "clauses": [
    {
      "id": "[unique-id]",
      "title": "[Clause Title]",
      "category": "[Category]",
      "text": "[Complete clause text]",
      "description": "[What this clause does]",
      "whenToUse": "[When to include this clause]",
      "riskLevel": "[Low/Medium/High]",
      "customizable": true
    }
  ]
}`;

    const response = await geminiClient.generateContent(prompt, {
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.5,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      }
    });

    console.log(`✅ Clauses via ${response.source} (${response.isPaid ? 'PAID ✨' : 'FREE 💡'})`);

    let clauseData;
    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        clauseData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON in response');
      }
    } catch (parseError) {
      clauseData = {
        clauses: []
      };
    }

    return NextResponse.json({
      success: true,
      ...clauseData,
      metadata: {
        source: response.source,
        isPaid: response.isPaid,
        tokensUsed: response.tokensUsed
      }
    });

  } catch (error) {
    console.error('Clause library error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}