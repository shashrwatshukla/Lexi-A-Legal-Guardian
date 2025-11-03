import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  limit 
} from 'firebase/firestore';

/**
 * ✅ GET RECENT ANALYZED DOCUMENTS FROM FIRESTORE
 */
export async function getRecentDocuments(userId, limitCount = 5) {
  try {
    console.log('📥 Fetching recent analyses for user:', userId);
    
    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', userId),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    
    console.log(`📊 Found ${snapshot.size} analyses in Firestore`);
    
    const documents = snapshot.docs.map(doc => {
      const data = doc.data();
      
      const fileName = data.documentName || data.fileName || 'Unknown Document';
      const uploadDate = data.createdAt || data.uploadDate || data.analyzedAt;
      
      return {
        id: doc.id,
        type: 'analysis', // ✅ EXPLICIT TYPE
        fileName: fileName,
        riskLevel: (data.riskLevel || 'unknown').toLowerCase(),
        status: 'analyzed',
        uploadDate: uploadDate?.toDate?.()?.toISOString() || new Date().toISOString(),
        riskScore: data.riskScore || 0,
        summary: data.summary || '',
        source: 'Analysis' // ✅ LABEL
      };
    });

    // Sort by date in JavaScript
    documents.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    console.log(`✅ Loaded ${documents.length} analyses (type: analysis)`);
    return documents;
    
  } catch (error) {
    console.error('❌ Error fetching analyses:', error);
    return [];
  }
}

/**
 * ✅ GET ALL ANALYZED DOCUMENTS FROM FIRESTORE
 */
export async function getAllDocuments(userId) {
  try {
    console.log('📥 Fetching all analyses for user:', userId);
    
    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    
    const documents = snapshot.docs.map(doc => {
      const data = doc.data();
      
      const fileName = data.documentName || data.fileName || 'Unknown Document';
      const uploadDate = data.createdAt || data.uploadDate || data.analyzedAt;
      
      return {
        id: doc.id,
        type: 'analysis', // ✅ EXPLICIT TYPE
        fileName: fileName,
        riskLevel: (data.riskLevel || 'unknown').toLowerCase(),
        status: 'analyzed',
        uploadDate: uploadDate?.toDate?.()?.toISOString() || new Date().toISOString(),
        riskScore: data.riskScore || 0,
        summary: data.summary || '',
        source: 'Analysis' // ✅ LABEL
      };
    });

    documents.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    console.log(`✅ Loaded ${documents.length} total analyses (type: analysis)`);
    return documents;
    
  } catch (error) {
    console.error('❌ Error fetching all analyses:', error);
    return [];
  }
}

/**
 * ✅ GET RECENT DRAFTED DOCUMENTS FROM FIRESTORE (NEW)
 */
export async function getRecentDrafts(userId, limitCount = 5) {
  try {
    console.log('📥 Fetching recent drafts for user:', userId);
    
    const q = query(
      collection(db, 'drafts'),
      where('userId', '==', userId),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    
    console.log(`📊 Found ${snapshot.size} drafts in Firestore`);
    
    const drafts = snapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        type: 'draft', // ✅ EXPLICIT TYPE
        fileName: data.title || 'Untitled Draft',
        status: 'drafted',
        uploadDate: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        wordCount: data.wordCount || 0,
        jurisdiction: data.jurisdiction || 'Not specified',
        source: 'Draft' // ✅ LABEL
      };
    });

    drafts.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    console.log(`✅ Loaded ${drafts.length} drafts (type: draft)`);
    return drafts;
    
  } catch (error) {
    console.error('❌ Error fetching recent drafts:', error);
    return [];
  }
}

/**
 * ✅ GET ALL DRAFTED DOCUMENTS FROM FIRESTORE (NEW)
 */
export async function getAllDrafts(userId) {
  try {
    console.log('📥 Fetching all drafts for user:', userId);
    
    const q = query(
      collection(db, 'drafts'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    
    const drafts = snapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        type: 'draft', // ✅ EXPLICIT TYPE
        fileName: data.title || 'Untitled Draft',
        status: 'drafted',
        uploadDate: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        wordCount: data.wordCount || 0,
        jurisdiction: data.jurisdiction || 'Not specified',
        source: 'Draft' // ✅ LABEL
      };
    });

    drafts.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    console.log(`✅ Loaded ${drafts.length} total drafts (type: draft)`);
    return drafts;
    
  } catch (error) {
    console.error('❌ Error fetching all drafts:', error);
    return [];
  }
}

/**
 * ✅ GET USER STATISTICS (UPDATED - NOW INCLUDES DRAFTS)
 */
export async function getUserStats(userId) {
  try {
    console.log('📊 Fetching user stats for:', userId);
    
    // Get analyses count
    const analysesQuery = query(
      collection(db, 'analyses'),
      where('userId', '==', userId)
    );
    const analysesSnapshot = await getDocs(analysesQuery);
    
    // ✅ Get drafts count
    const draftsQuery = query(
      collection(db, 'drafts'),
      where('userId', '==', userId)
    );
    const draftsSnapshot = await getDocs(draftsQuery);
    
    const stats = {
      totalUploaded: analysesSnapshot.size,
      totalAnalyzed: analysesSnapshot.size,
      totalDrafted: draftsSnapshot.size // ✅ REAL COUNT
    };

    console.log('✅ User stats:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    return {
      totalUploaded: 0,
      totalAnalyzed: 0,
      totalDrafted: 0
    };
  }
}

/**
 * ✅ DELETE ANALYZED DOCUMENT
 */
export async function deleteDocument(documentId) {
  try {
    console.log('🗑️ Deleting analysis document:', documentId);
    
    await deleteDoc(doc(db, 'analyses', documentId));
    
    console.log('✅ Analysis document deleted successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error deleting analysis document:', error);
    throw error;
  }
}