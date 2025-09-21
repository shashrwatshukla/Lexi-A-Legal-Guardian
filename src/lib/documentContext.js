
let currentAnalysis = null;
let currentFileName = null;

export const setDocumentAnalysis = (analysis, fileName) => {
  currentAnalysis = analysis;
  currentFileName = fileName;
};

export const getDocumentAnalysis = () => {
  return { analysis: currentAnalysis, fileName: currentFileName };
};

export const clearDocumentAnalysis = () => {
  currentAnalysis = null;
  currentFileName = null;
};


export const generateSuggestedQuestions = (analysis) => {
  if (!analysis) return [];
  
  const questions = [];
  
  
  if (analysis.riskLevel === 'High') {
    questions.push("What are the most critical risks in this document?");
    questions.push("Which clauses should I negotiate immediately?");
  } else if (analysis.riskLevel === 'Medium') {
    questions.push("What are the main concerns in this document?");
    questions.push("Are there any clauses I should pay attention to?");
  }
  
  
  if (analysis.flaggedClauses && analysis.flaggedClauses.length > 0) {
    const topClause = analysis.flaggedClauses[0];
    questions.push(`Can you explain the "${topClause.title}" clause in detail?`);
    questions.push("What are the potential consequences of the risky clauses?");
  }
  
  
  if (analysis.obligations && analysis.obligations.length > 0) {
    questions.push("What are my key obligations and when are they due?");
    questions.push("What happens if I don't meet the deadlines?");
  }
  
  
  if (analysis.missingClauses && analysis.missingClauses.length > 0) {
    questions.push("What important protections are missing from this contract?");
  }
  
  
  if (analysis.documentType) {
    questions.push(`What should I know about this ${analysis.documentType}?`);
  }
  
  
  questions.push("Should I sign this document as-is?");
  questions.push("Give me a simple summary of what I'm agreeing to");
  questions.push("What are the payment terms mentioned?");
  
  return questions.slice(0, 6); 
};