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
 * ✅ GET RECENT DOCUMENTS FROM FIRESTORE (WITHOUT orderBy)
 */
export async function getRecentDocuments(userId, limitCount = 5) {
  try {
    console.log('📥 Fetching recent documents for user:', userId);
    
    // 🔥 REMOVED orderBy to avoid index requirement
    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', userId),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    
    console.log(`📊 Found ${snapshot.size} documents in Firestore`);
    
    const documents = snapshot.docs.map(doc => {
      const data = doc.data();
      
      const fileName = data.documentName || data.fileName || 'Unknown Document';
      const uploadDate = data.createdAt || data.uploadDate || data.analyzedAt;
      
      console.log('📄 Processing document:', {
        id: doc.id,
        fileName: fileName,
        riskLevel: data.riskLevel
      });
      
      return {
        id: doc.id,
        fileName: fileName,
        riskLevel: (data.riskLevel || 'unknown').toLowerCase(),
        status: 'analyzed',
        uploadDate: uploadDate?.toDate?.()?.toISOString() || new Date().toISOString(),
        riskScore: data.riskScore || 0,
        summary: data.summary || ''
      };
    });

    // 🔥 Sort by date in JavaScript (after fetching)
    documents.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    console.log(`✅ Loaded ${documents.length} recent documents`);
    return documents;
    
  } catch (error) {
    console.error('❌ Error fetching recent documents:', error);
    return [];
  }
}

/**
 * ✅ GET ALL DOCUMENTS FROM FIRESTORE (WITHOUT orderBy)
 */
export async function getAllDocuments(userId) {
  try {
    console.log('📥 Fetching all documents for user:', userId);
    
    // 🔥 REMOVED orderBy
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
        fileName: fileName,
        riskLevel: (data.riskLevel || 'unknown').toLowerCase(),
        status: 'analyzed',
        uploadDate: uploadDate?.toDate?.()?.toISOString() || new Date().toISOString(),
        riskScore: data.riskScore || 0,
        summary: data.summary || ''
      };
    });

    // 🔥 Sort in JavaScript
    documents.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    console.log(`✅ Loaded ${documents.length} total documents`);
    return documents;
    
  } catch (error) {
    console.error('❌ Error fetching all documents:', error);
    return [];
  }
}

/**
 * ✅ GET USER STATISTICS
 */
export async function getUserStats(userId) {
  try {
    console.log('📊 Fetching user stats for:', userId);
    
    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    
    const stats = {
      totalUploaded: snapshot.size,
      totalAnalyzed: snapshot.size,
      totalDrafted: 0
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
 * ✅ DELETE DOCUMENT
 */
export async function deleteDocument(documentId) {
  try {
    console.log('🗑️ Deleting document:', documentId);
    
    await deleteDoc(doc(db, 'analyses', documentId));
    
    console.log('✅ Document deleted successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    throw error;
  }
}