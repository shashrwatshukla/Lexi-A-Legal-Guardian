import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../lib/drafter/geminiClient';

async function convertDocxToText(arrayBuffer) {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let binaryString = '';
    const chunkSize = 0x8000; 
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const docXmlStart = binaryString.indexOf('word/document.xml');
    if (docXmlStart !== -1) {
      const xmlContentStart = binaryString.indexOf('<?xml', docXmlStart);
      if (xmlContentStart !== -1) {
        const xmlContentEnd = binaryString.indexOf('</w:document>', xmlContentStart);
        if (xmlContentEnd !== -1) {
          const xmlContent = binaryString.substring(xmlContentStart, xmlContentEnd + 13);
          
          const textMatches = [];
          const wtPattern = /<w:t[^>]*>([^<]*)<\/w:t>/g;
          let match;
          while ((match = wtPattern.exec(xmlContent)) !== null) {
            if (match[1]) {
              textMatches.push(match[1]);
            }
          }
          
          if (textMatches.length > 0) {
            let text = textMatches.join(' ');
            
            text = text
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&apos;/g, "'")
              .replace(/&#x([0-9A-F]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
              .replace(/&#([0-9]+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
              .replace(/\s+/g, ' ')
              .trim();
            
            console.log('DOCX text extracted, length:', text.length);
            return text;
          }
        }
      }
    }
    
    const textMatches = [];
    const wtPattern = /<w:t[^>]*>([^<]+)<\/w:t>/g;
    let match;
    while ((match = wtPattern.exec(binaryString)) !== null) {
      if (match[1] && match[1].trim()) {
        textMatches.push(match[1]);
      }
    }
    
    if (textMatches.length > 0) {
      let text = textMatches.join(' ');
      text = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
      
      return text;
    }
    
    return null;
  } catch (error) {
    console.error('DOCX conversion error:', error);
    return null;
  }
}

async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        if (i === maxRetries - 1) throw error;
        
        const delay = initialDelay * Math.pow(2, i);
        console.log(`API overloaded, retrying in ${delay}ms... (${i + 2}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

export async function POST(request) {
  console.log('=== Document Analysis Started ===');
  
  try {
    const headers = { 'Content-Type': 'application/json' };
    const geminiClient = getGeminiClient();

    let formData;
    try {
      formData = await request.formData();
    } catch (e) {
      console.error('FormData parsing error:', e);
      return NextResponse.json({
        success: false,
        error: 'Invalid form data'
      }, { headers });
    }

    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file uploaded'
      }, { headers });
    }

    console.log(`File received: ${file.name} (${file.size} bytes, ${file.type})`);

    try {
      let documentText = '';
      
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          file.name.toLowerCase().endsWith('.docx')) {
        
        console.log('Processing DOCX file...');
        
        const arrayBuffer = await file.arrayBuffer();
        const extractedText = await convertDocxToText(arrayBuffer);
        
        if (extractedText && extractedText.length > 30) {
          console.log('Successfully extracted text from DOCX');
          documentText = extractedText;
          
          const analysisText = documentText.length > 30000 
            ? documentText.substring(0, 30000) + '\n\n[Truncated for analysis only]'
            : documentText;

          const prompt = `Analyze this legal document and provide a comprehensive structured analysis.

Document content:
${analysisText}

Provide your analysis in EXACTLY this JSON format (ensure valid JSON):
{
  "summary": "[2-3 sentence summary of the document's purpose and main points]",
  "overallRiskScore": [number between 0-100, where 0 is safest and 100 is highest risk],
  "riskLevel": "[Low/Medium/High based on overallRiskScore]",
  "documentType": "[Contract/Agreement/Terms of Service/Privacy Policy/Other]",
  "parties": ["[Party 1 name]", "[Party 2 name]"],
  "effectiveDate": "[Date if found, or 'Not specified']",
  "expirationDate": "[Date if found, or 'Not specified']",
  "flaggedClauses": [
    {
      "id": 1,
      "title": "[Clause title]",
      "severity": "[critical/warning/safe]",
      "category": "[Payment/Termination/Liability/IP/Privacy/Other]",
      "description": "[Brief description of the issue]",
      "fullText": "[Relevant excerpt from document, max 200 chars]",
      "location": "[Section/Page reference if available]",
      "recommendation": "[Specific advice for this clause]",
      "negotiable": [true/false]
    }
  ],
  "obligations": [
    {
      "party": "[Party name]",
      "obligation": "[Description]",
      "dueDate": "[Date or 'Ongoing']",
      "frequency": "[One-time/Monthly/Annual/As needed]"
    }
  ],
  "keyDates": [
    {
      "date": "[Date]",
      "event": "[Description of what happens]",
      "type": "[Deadline/Renewal/Payment/Review]"
    }
  ],
  "riskCategories": {
    "financial": [0-100],
    "legal": [0-100],
    "operational": [0-100],
    "reputational": [0-100],
    "compliance": [0-100]
  },
  "positiveProvisions": [
    {
      "title": "[Provision title]",
      "benefit": "[How this protects you]",
      "location": "[Section reference]"
    }
  ],
  "missingClauses": [
    {
      "clause": "[What's missing]",
      "importance": "[Why it matters]",
      "suggestion": "[What to add]"
    }
  ],
  "industryComparison": {
    "contractLength": "[Shorter/Average/Longer than industry standard]",
    "complexity": "[Below/At/Above industry standard]",
    "fairness": "[More favorable/Balanced/Less favorable]"
  },
  "actionItems": [
    {
      "priority": "[High/Medium/Low]",
      "action": "[Specific action to take]",
            "reason": "[Why this is important]"
    }
  ],
  "negotiationPoints": [
    "[Specific clause or term that should be negotiated]"
  ],
  "finalVerdict": {
    "recommendation": "[Sign as-is/Negotiate first/Seek legal counsel/Avoid]",
    "confidence": [0-100],
    "mainConcerns": ["[Top concern 1]", "[Top concern 2]", "[Top concern 3]"]
  }
}

IMPORTANT: 
1. Ensure the response is valid JSON that can be parsed
2. Use proper escaping for quotes in text fields
3. Provide at least 3-5 flagged clauses with varying severity levels
4. Include realistic dates and obligations
5. Fill all arrays with relevant data, don't leave them empty`;

          const response = await retryWithBackoff(async () => {
            return await geminiClient.generateContent(prompt, {
              model: 'gemini-2.0-flash',
              generationConfig: {
                temperature: 0.3,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 8192,
              }
            });
          });
          
          const aiResponse = response.text;
          console.log(`✅ Analysis via ${response.source} (${response.isPaid ? 'PAID ✨' : 'FREE 💡'})`);
          console.log(`   Tokens: ${response.tokensUsed}`);

          let analysisData;
          try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              analysisData = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('No JSON found in response');
            }
          } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            console.log('AI Response:', aiResponse.substring(0, 500) + '...');
            
            let summary = "Document analysis completed.";
            let riskScore = "Medium";
            let riskyClauses = [];
            let recommendations = "Please review the analysis carefully.";

            const lines = aiResponse.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();
              
              if (line.startsWith('SUMMARY:')) {
                summary = line.substring(8).trim();
                while (i + 1 < lines.length && !lines[i + 1].trim().includes(':')) {
                  i++;
                  summary += ' ' + lines[i].trim();
                }
              } else if (line.startsWith('RISK:')) {
                const riskValue = line.substring(5).trim();
                if (['Low', 'Medium', 'High', 'Unknown'].includes(riskValue)) {
                  riskScore = riskValue;
                }
              } else if (line.startsWith('CONCERNS:')) {
                const concernsText = line.substring(9).trim();
                let fullConcerns = concernsText;
                while (i + 1 < lines.length && !lines[i + 1].trim().includes(':')) {
                  i++;
                  fullConcerns += ' ' + lines[i].trim();
                }
                
                if (fullConcerns && fullConcerns.toLowerCase() !== 'none' && fullConcerns.toLowerCase() !== 'none identified') {
                  const items = fullConcerns.split(';').filter(c => c.trim());
                  riskyClauses = items.map((item, index) => ({
                    id: index + 1,
                    title: `Concern ${index + 1}`,
                    severity: 'warning',
                    category: 'General',
                    description: item.trim(),
                    fullText: item.trim().substring(0, 200),
                    location: 'Document',
                    recommendation: 'Review this clause carefully',
                    negotiable: true
                  }));
                }
              } else if (line.startsWith('ADVICE:')) {
                recommendations = line.substring(7).trim();
                while (i + 1 < lines.length && !lines[i + 1].trim().includes(':')) {
                  i++;
                  recommendations += ' ' + lines[i].trim();
                }
              }
            }

            analysisData = {
              summary: summary,
              overallRiskScore: riskScore === 'High' ? 75 : riskScore === 'Medium' ? 50 : 25,
              riskLevel: riskScore,
              documentType: 'Document',
              parties: ['Party A', 'Party B'],
              effectiveDate: 'Not specified',
              expirationDate: 'Not specified',
              flaggedClauses: riskyClauses,
              obligations: [],
              keyDates: [],
              riskCategories: {
                financial: 50,
                legal: 50,
                operational: 50,
                reputational: 50,
                compliance: 50
              },
              positiveProvisions: [],
              missingClauses: [],
              industryComparison: {
                contractLength: 'Average',
                complexity: 'At industry standard',
                fairness: 'Balanced'
              },
              actionItems: [{
                priority: 'High',
                action: recommendations,
                reason: 'Based on document analysis'
              }],
              negotiationPoints: [],
              finalVerdict: {
                recommendation: 'Seek legal counsel',
                confidence: 70,
                mainConcerns: riskyClauses.slice(0, 3).map(c => c.description)
              }
            };
          }

          analysisData = {
            summary: analysisData.summary || "Document analysis completed.",
            overallRiskScore: analysisData.overallRiskScore || 50,
            riskLevel: analysisData.riskLevel || "Medium",
            documentType: analysisData.documentType || "Document",
            parties: analysisData.parties || ['Party A', 'Party B'],
            effectiveDate: analysisData.effectiveDate || 'Not specified',
            expirationDate: analysisData.expirationDate || 'Not specified',
            flaggedClauses: analysisData.flaggedClauses || [],
            obligations: analysisData.obligations || [],
            keyDates: analysisData.keyDates || [],
            riskCategories: analysisData.riskCategories || {
              financial: 50,
              legal: 50,
              operational: 50,
              reputational: 50,
              compliance: 50
            },
            positiveProvisions: analysisData.positiveProvisions || [],
            missingClauses: analysisData.missingClauses || [],
            industryComparison: analysisData.industryComparison || {
              contractLength: 'Average',
              complexity: 'At industry standard',
              fairness: 'Balanced'
            },
            actionItems: analysisData.actionItems || [],
            negotiationPoints: analysisData.negotiationPoints || [],
            finalVerdict: analysisData.finalVerdict || {
              recommendation: 'Review carefully',
              confidence: 70,
              mainConcerns: []
            }
          };

          analysisData.flaggedClauses = analysisData.flaggedClauses.map((clause, index) => ({
            ...clause,
            id: clause.id || index + 1
          }));

          const wordCount = documentText ? documentText.split(/\s+/).length : 1000;
          const readingTime = Math.ceil(wordCount / 200);

          analysisData.metadata = {
            fileName: file.name,
            fileSize: file.size,
            analyzedAt: new Date().toISOString(),
            wordCount: wordCount,
            estimatedReadTime: `${readingTime} min`,
            pageCount: Math.ceil(wordCount / 500),
            documentText: documentText || '',
            fullDocument: true,
            aiSource: response.source,
            usingPaidCredits: response.isPaid,
            tokensUsed: response.tokensUsed
          };

          return NextResponse.json({
            success: true,
            analysis: analysisData,
            insights: {
              summary: analysisData.summary,
              riskScore: analysisData.riskLevel,
              riskyClauses: analysisData.flaggedClauses,
              recommendations: analysisData.actionItems.map(item => item.action).join(' '),
              disclaimer: "This is an AI-powered analysis tool. Always consult with a legal professional for important documents."
            }
          }, { headers });
          
        } else {
          console.log('DOCX extraction failed');
          
          return NextResponse.json({
            success: false,
            error: 'Unable to extract text from Word document. Please convert to PDF format and try again.'
          }, { headers });
        }
        
      } else {
        // Processing PDFs and other files with inline data
        console.log('Processing file with Gemini...');
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString('base64');

        const prompt = `Analyze this legal document and provide a comprehensive structured analysis.

Provide your analysis in EXACTLY this JSON format (ensure valid JSON):
{
  "summary": "[2-3 sentence summary of the document's purpose and main points]",
  "overallRiskScore": [number between 0-100, where 0 is safest and 100 is highest risk],
  "riskLevel": "[Low/Medium/High based on overallRiskScore]",
  "documentType": "[Contract/Agreement/Terms of Service/Privacy Policy/Other]",
  "parties": ["[Party 1 name]", "[Party 2 name]"],
  "effectiveDate": "[Date if found, or 'Not specified']",
  "expirationDate": "[Date if found, or 'Not specified']",
  "flaggedClauses": [
    {
      "id": 1,
      "title": "[Clause title]",
      "severity": "[critical/warning/safe]",
      "category": "[Payment/Termination/Liability/IP/Privacy/Other]",
      "description": "[Brief description of the issue]",
      "fullText": "[Relevant excerpt from document, max 200 chars]",
      "location": "[Section/Page reference if available]",
      "recommendation": "[Specific advice for this clause]",
      "negotiable": [true/false]
    }
  ],
  "obligations": [
    {
      "party": "[Party name]",
      "obligation": "[Description]",
      "dueDate": "[Date or 'Ongoing']",
      "frequency": "[One-time/Monthly/Annual/As needed]"
    }
  ],
  "keyDates": [
    {
      "date": "[Date]",
      "event": "[Description of what happens]",
      "type": "[Deadline/Renewal/Payment/Review]"
    }
  ],
  "riskCategories": {
    "financial": [0-100],
    "legal": [0-100],
    "operational": [0-100],
    "reputational": [0-100],
    "compliance": [0-100]
  },
  "positiveProvisions": [
    {
      "title": "[Provision title]",
      "benefit": "[How this protects you]",
      "location": "[Section reference]"
    }
  ],
  "missingClauses": [
    {
      "clause": "[What's missing]",
      "importance": "[Why it matters]",
      "suggestion": "[What to add]"
    }
  ],
  "industryComparison": {
    "contractLength": "[Shorter/Average/Longer than industry standard]",
    "complexity": "[Below/At/Above industry standard]",
    "fairness": "[More favorable/Balanced/Less favorable]"
  },
  "actionItems": [
    {
      "priority": "[High/Medium/Low]",
      "action": "[Specific action to take]",
      "reason": "[Why this is important]"
    }
  ],
  "negotiationPoints": [
    "[Specific clause or term that should be negotiated]"
  ],
  "finalVerdict": {
    "recommendation": "[Sign as-is/Negotiate first/Seek legal counsel/Avoid]",
    "confidence": [0-100],
    "mainConcerns": ["[Top concern 1]", "[Top concern 2]", "[Top concern 3]"]
  }
}

IMPORTANT: 
1. Ensure the response is valid JSON that can be parsed
2. Use proper escaping for quotes in text fields
3. Provide at least 3-5 flagged clauses with varying severity levels
4. Include realistic dates and obligations
5. Fill all arrays with relevant data, don't leave them empty`;

        // Create the file part for Vertex AI
        const filePart = {
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        };

        const response = await retryWithBackoff(async () => {
          // Pass as array with text prompt first, then file data
          return await geminiClient.generateContent([prompt, filePart], {
            model: 'gemini-2.0-flash',
            generationConfig: {
              temperature: 0.3,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 8192,
            }
          });
        });

        const aiResponse = response.text;
        console.log(`✅ Analysis via ${response.source} (${response.isPaid ? 'PAID ✨' : 'FREE 💡'})`);
        console.log(`   Tokens: ${response.tokensUsed}`);

        let analysisData;
        try {
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          analysisData = {
            summary: "Document analysis completed.",
            overallRiskScore: 50,
            riskLevel: "Medium",
            documentType: "Document",
            parties: ['Party A', 'Party B'],
            effectiveDate: 'Not specified',
            expirationDate: 'Not specified',
            flaggedClauses: [],
            obligations: [],
            keyDates: [],
            riskCategories: {
              financial: 50,
              legal: 50,
              operational: 50,
              reputational: 50,
              compliance: 50
            },
            positiveProvisions: [],
            missingClauses: [],
            industryComparison: {
              contractLength: 'Average',
              complexity: 'At industry standard',
              fairness: 'Balanced'
            },
            actionItems: [],
            negotiationPoints: [],
            finalVerdict: {
              recommendation: 'Review carefully',
              confidence: 70,
              mainConcerns: []
            }
          };
        }

        analysisData.metadata = {
          fileName: file.name,
          fileSize: file.size,
          analyzedAt: new Date().toISOString(),
          aiSource: response.source,
          usingPaidCredits: response.isPaid,
          tokensUsed: response.tokensUsed
        };

        return NextResponse.json({
          success: true,
          analysis: analysisData,
          insights: {
            summary: analysisData.summary,
            riskScore: analysisData.riskLevel,
            riskyClauses: analysisData.flaggedClauses,
            recommendations: analysisData.actionItems.map(item => item.action).join(' '),
            disclaimer: "AI-powered analysis. Consult legal professional."
          }
        }, { headers });
      }

    } catch (aiError) {
      console.error('Gemini API error:', aiError);
      
      if (aiError.message?.includes('404') || aiError.message?.includes('not found')) {
        return NextResponse.json({
          success: false,
                    error: 'AI model temporarily unavailable. Please try again later.',
          retryable: true
        }, { headers });
      } else if (aiError.message?.includes('503') || aiError.message?.includes('overloaded')) {
        return NextResponse.json({
          success: false,
          error: 'AI service experiencing high demand. Please try again in a few moments.',
          retryable: true
        }, { headers });
      } else if (aiError.message?.includes('API key') || aiError.message?.includes('credentials')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid API credentials configuration.'
        }, { headers });
      } else if (aiError.message?.includes('quota')) {
        return NextResponse.json({
          success: false,
          error: 'API quota exceeded. Please try again later.'
        }, { headers });
      } else if (aiError.message?.includes('INVALID_ARGUMENT') || aiError.message?.includes('400')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid request format. Please try a different file or contact support.'
        }, { headers });
      } else {
        return NextResponse.json({
          success: false,
          error: `Analysis failed: ${aiError.message || 'Unknown error'}`
        }, { headers });
      }
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      success: false,
      error: `Server error: ${error.message}`
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}

export async function GET() {
  const geminiClient = getGeminiClient();
  const stats = geminiClient.getStats();
  
  return NextResponse.json({ 
    status: 'running',
    timestamp: new Date().toISOString(),
    configuration: stats.configured,
    usage: {
      totalCalls: stats.total,
      paidCalls: stats.paidCalls,
      freeCalls: stats.freeCalls,
      paidPercentage: `${stats.paidPercentage}%`,
      errors: stats.errors,
      lastError: stats.lastError,
      totalTokens: stats.totalTokens,
      estimatedCost: stats.estimatedCostUSD,
      creditsRemaining: stats.creditsRemaining
    },
    supportedFormats: ['PDF', 'TXT', 'DOCX', 'Images (JPG, PNG)']
  }, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
}