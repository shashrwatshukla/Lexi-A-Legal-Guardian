import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function saveAnalysisToFirebase(analysisData, userId, userEmail) {
  try {
    const analysisRef = collection(db, 'analyses');
    
    const docRef = await addDoc(analysisRef, {
      userId: userId,
      userEmail: userEmail,
      documentName: analysisData.metadata?.fileName || 'Unknown',
      documentType: analysisData.documentType,
      riskScore: analysisData.overallRiskScore,
      riskLevel: analysisData.riskLevel,
      summary: analysisData.summary,
      fullAnalysis: analysisData, // Store complete analysis
      voiceSummaryUrl: analysisData.voiceSummaryUrl || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Analysis saved to Firebase with ID:', docRef.id);
    return { success: true, id: docRef.id };
    
  } catch (error) {
    console.error('❌ Firebase save error:', error);
    return { success: false, error: error.message };
  }
}