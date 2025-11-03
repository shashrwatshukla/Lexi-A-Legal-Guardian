/**
 * Session Sharing Logic - Firebase Firestore Version
 * Auto-detects environment (localhost or production)
 */

import { db } from './firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';

/**
 * Creates a shareable session and returns the URL
 * @param {Object} analysisData - Complete analysis data to share
 * @returns {Promise<string>} - Shareable URL
 */
export async function createShareableSession(analysisData) {
  console.log('📤 createShareableSession called');
  console.log('📤 Input data:', analysisData);
  
  try {
    if (!analysisData) {
      console.log('❌ No analysis data provided');
      throw new Error('No analysis data provided');
    }
    
    console.log('✅ Analysis data validated');
    console.log('✅ Document name:', analysisData.documentName);

    // ✅ MODIFIED: Added detailedSummary to session snapshot
    const sessionSnapshot = {
      timestamp: new Date().toISOString(),
      documentName: analysisData.documentName || 'Untitled Document',
      analysisResults: analysisData.analysisResults || {},
      riskScore: analysisData.riskScore || 0,
      summary: analysisData.summary || '',
      detailedSummary: typeof window !== 'undefined' ? (sessionStorage.getItem('detailedSummary') || '') : '', // ← NEW: Store detailed summary
      voiceSummaryUrl: analysisData.voiceSummaryUrl || null,
      chatHistory: analysisData.chatHistory || [],
      actionItems: analysisData.actionItems || [],
      obligations: analysisData.obligations || [],
      clauses: analysisData.clauses || [],
      risks: analysisData.risks || [],
      positives: analysisData.positives || [],
      createdBy: analysisData.userId || 'anonymous',
      userEmail: analysisData.userEmail || null,
      isReadOnly: true,
      version: '1.0',
      // ✅ NEW: Store metadata for better compatibility
      metadata: {
        fileName: analysisData.documentName || 'Untitled Document',
        documentType: analysisData.documentType || 'legal',
        uploadDate: analysisData.uploadDate || new Date().toISOString()
      }
    };

    console.log('📦 Session snapshot prepared:', {
      documentName: sessionSnapshot.documentName,
      riskScore: sessionSnapshot.riskScore,
      timestamp: sessionSnapshot.timestamp,
      hasDetailedSummary: !!sessionSnapshot.detailedSummary // ← NEW: Log if detailed summary exists
    });
    
    console.log('🔥 DB instance:', db);
    console.log('🔥 Attempting to save to Firestore collection: sharedSessions');

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'sharedSessions'), sessionSnapshot);
    
    console.log('✅ Saved to Firestore successfully!');
    console.log('✅ Document ID:', docRef.id);
    console.log('✅ Document reference:', docRef);

    // Create shareable URL - Auto-detect environment
    let baseUrl;
    
    if (typeof window !== 'undefined') {
      // Client-side: Always use current domain
      baseUrl = window.location.origin;
      console.log('🌐 Client-side detected, using window.location.origin:', baseUrl);
    } else {
      // Server-side: Detect from environment or use fallback
      const isDev = process.env.NODE_ENV === 'development';
      baseUrl = isDev ? 'http://localhost:3001' : 'https://asklexi.vercel.app';
      console.log('🌐 Server-side detected, environment:', process.env.NODE_ENV);
      console.log('🌐 Using base URL:', baseUrl);
    }
    
    const shareUrl = `${baseUrl}/share/${docRef.id}`;
    
    console.log('🔗 Final Share URL created:', shareUrl);
    
    return shareUrl;

  } catch (error) {
    console.error('❌ Error in createShareableSession:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error code:', error.code);
    throw new Error(`Failed to create share link: ${error.message}`);
  }
}

/**
 * Retrieves a shared session by ID
 * @param {string} sessionId - Session ID to retrieve
 * @returns {Promise<Object|null>} - Session data or null
 */
export async function getSharedSession(sessionId) {
  console.log('📥 getSharedSession called for ID:', sessionId);
  
  try {
    console.log('🔥 Creating document reference...');
    const docRef = doc(db, 'sharedSessions', sessionId);
    
    console.log('🔥 Fetching document...');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log('❌ Session not found:', sessionId);
      return null;
    }

    console.log('✅ Session found!');
    const data = docSnap.data();
    console.log('✅ Session data:', {
      documentName: data.documentName,
      timestamp: data.timestamp,
      riskScore: data.riskScore,
      hasDetailedSummary: !!data.detailedSummary // ← NEW: Log if detailed summary exists
    });
    
    return data;

  } catch (error) {
    console.error('❌ Error retrieving shared session:', error);
    console.error('❌ Error details:', error.message);
    return null;
  }
}

/**
 * Generates a unique session ID
 * @returns {string} - Unique ID
 */
function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  const randomStr2 = Math.random().toString(36).substring(2, 15);
  
  return `${timestamp}-${randomStr}${randomStr2}`;
}

/**
 * Validates if a session ID format is correct
 * @param {string} sessionId - Session ID to validate
 * @returns {boolean}
 */
export function isValidSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  
  // Firestore document IDs can contain alphanumeric, hyphens, underscores
  const pattern = /^[a-zA-Z0-9_-]+$/;
  return pattern.test(sessionId);
}

/**
 * Get share URL from session ID
 * Auto-detects environment
 * @param {string} sessionId 
 * @returns {string}
 */
export function getShareUrl(sessionId) {
  let baseUrl;
  
  if (typeof window !== 'undefined') {
    baseUrl = window.location.origin;
  } else {
    const isDev = process.env.NODE_ENV === 'development';
    baseUrl = isDev ? 'http://localhost:3001' : 'https://asklexi.vercel.app';
  }
  
  return `${baseUrl}/share/${sessionId}`;
}

// Debug: Log when module loads
console.log('📚 shareSession.js module loaded');
console.log('📚 DB instance available:', !!db);
console.log('📚 Environment:', process.env.NODE_ENV);