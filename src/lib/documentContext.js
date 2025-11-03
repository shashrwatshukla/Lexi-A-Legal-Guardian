// Store analysis in both memory and sessionStorage for persistence
let currentAnalysis = null;
let currentFileName = null;

const STORAGE_KEY = 'current_document_analysis';
const FILENAME_KEY = 'current_document_filename';

export const setDocumentAnalysis = (analysis, fileName) => {
  currentAnalysis = analysis;
  currentFileName = fileName;
  
  // Also store in sessionStorage for persistence across navigation
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(analysis));
      sessionStorage.setItem(FILENAME_KEY, fileName);
      console.log('✅ Analysis stored in context and sessionStorage');
    } catch (error) {
      console.error('❌ Failed to store analysis:', error);
    }
  }
};

export const getDocumentAnalysis = () => {
  // First try memory
  if (currentAnalysis && currentFileName) {
    return { analysis: currentAnalysis, fileName: currentFileName };
  }
  
  // Then try sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const storedFileName = sessionStorage.getItem(FILENAME_KEY);
      if (stored) {
        currentAnalysis = JSON.parse(stored);
        currentFileName = storedFileName;
        console.log('✅ Analysis retrieved from sessionStorage');
        return { analysis: currentAnalysis, fileName: currentFileName };
      }
    } catch (error) {
      console.error('❌ Failed to retrieve analysis:', error);
    }
  }
  
  return { analysis: null, fileName: null };
};

export const clearDocumentAnalysis = () => {
  currentAnalysis = null;
  currentFileName = null;
  
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(FILENAME_KEY);
    sessionStorage.removeItem('detailedSummary');
    console.log('✅ Analysis cleared from context and sessionStorage');
  }
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