
import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeLegalDocument(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    
    const prompt = `
You are a legal document analyzer. Analyze the following legal document and provide insights in JSON format.

Document Text:
"""
${text}
"""

Provide a detailed analysis with the following structure:
{
  "documentType": "identify the type of legal document (e.g., rental agreement, employment contract, terms of service, etc.)",
  "summary": "provide a clear, plain-language summary of what this document is about in 2-3 sentences",
  "keyTerms": [
    {
      "term": "important legal term",
      "explanation": "simple explanation of what this means"
    }
  ],
  "mainObligations": [
    "list the main obligations or responsibilities for each party"
  ],
  "riskScore": "assess overall risk level as Low, Medium, or High",
  "riskyClauses": [
    {
      "clause": "quote the concerning clause",
      "reason": "explain why this might be problematic",
      "suggestion": "provide a suggestion for improvement or what to watch out for"
    }
  ],
  "importantDates": [
    "list any important dates or deadlines mentioned"
  ],
  "financialTerms": [
    "list any fees, penalties, or financial obligations"
  ],
  "terminationClauses": "explain how the agreement can be ended",
  "recommendations": [
    "provide practical recommendations for the user"
  ],
  "legalJargonExplained": [
    {
      "jargon": "complex legal term found",
      "meaning": "simple explanation"
    }
  ]
}

Important: 
- Use simple, everyday language in explanations
- Highlight anything that could be unfavorable to an individual
- Focus on practical implications
- Be thorough but concise
- Return ONLY valid JSON, no additional text
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    
    let cleanedResponse = responseText;
    
    
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '');
    cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    cleanedResponse = cleanedResponse.trim();
    
    
    const analysis = JSON.parse(cleanedResponse);
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing document:', error);
    
    
    return {
      documentType: "Unable to determine",
      summary: "Error analyzing document. The AI service encountered an issue.",
      keyTerms: [],
      mainObligations: ["Analysis failed - please try again"],
      riskScore: "Unknown",
      riskyClauses: [],
      importantDates: [],
      financialTerms: [],
      terminationClauses: "Unable to analyze",
      recommendations: ["Please try uploading the document again or contact support"],
      legalJargonExplained: [],
      error: error.message
    };
  }
}


export function identifyCommonRisks(text) {
  const risks = [];
  
  const riskyPatterns = [
    {
      pattern: /automatic renewal|auto-renewal|automatically renew/gi,
      risk: "Automatic renewal clause",
      explanation: "This contract may renew automatically without your explicit consent"
    },
    {
      pattern: /waive|waiver of|waiving/gi,
      risk: "Rights waiver",
      explanation: "You may be giving up certain legal rights"
    },
    {
      pattern: /arbitration|binding arbitration/gi,
      risk: "Mandatory arbitration",
      explanation: "You may be required to resolve disputes through arbitration instead of court"
    },
    {
      pattern: /indemnify|indemnification|hold harmless/gi,
      risk: "Indemnification clause",
      explanation: "You may be responsible for legal costs or damages"
    },
    {
      pattern: /liquidated damages|penalty/gi,
      risk: "Penalty clause",
      explanation: "Specific penalties for breach of contract are defined"
    },
    {
      pattern: /non-compete|non compete|noncompete/gi,
      risk: "Non-compete clause",
      explanation: "Restrictions on your ability to work in similar roles or industries"
    },
    {
      pattern: /confidential|non-disclosure|nda/gi,
      risk: "Confidentiality requirements",
      explanation: "Obligations to keep certain information secret"
    }
  ];
  
  riskyPatterns.forEach(({ pattern, risk, explanation }) => {
    if (pattern.test(text)) {
      risks.push({ risk, explanation });
    }
  });
  
  return risks;
}