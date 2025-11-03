import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  writeBatch,
  doc
} from 'firebase/firestore';

/**
 * ✅ GET USER PREFERENCES
 */
export async function getUserPreferences(userId) {
  try {
    const q = query(
      collection(db, 'userPreferences'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
    
    return {
      language: 'en',
      notifications: true,
      theme: 'dark'
    };
    
  } catch (error) {
    console.error('Error getting preferences:', error);
    return {
      language: 'en',
      notifications: true,
      theme: 'dark'
    };
  }
}

/**
 * ✅ GET STORAGE USAGE (UPDATED - INCLUDES DRAFTS)
 */
export async function getStorageUsage(userId) {
  try {
    console.log('📊 Calculating storage usage for user:', userId);
    
    // Count analyses
    const analysesQuery = query(
      collection(db, 'analyses'),
      where('userId', '==', userId)
    );
    const analysesSnapshot = await getDocs(analysesQuery);
    
    // ✅ Count drafts
    const draftsQuery = query(
      collection(db, 'drafts'),
      where('userId', '==', userId)
    );
    const draftsSnapshot = await getDocs(draftsQuery);
    
    let totalSize = 0;
    
    // Calculate size from analyses
    analysesSnapshot.forEach(doc => {
      const data = doc.data();
      const docSize = new Blob([JSON.stringify(data)]).size;
      totalSize += docSize;
    });
    
    // ✅ Calculate size from drafts (PDFs are larger!)
    draftsSnapshot.forEach(doc => {
      const data = doc.data();
      // PDF base64 size
      if (data.pdfBase64) {
        totalSize += data.pdfBase64.length;
      }
      // Content size
      if (data.content) {
        totalSize += data.content.length;
      }
    });
    
    const totalCount = analysesSnapshot.size + draftsSnapshot.size;
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Storage usage: ${totalCount} documents, ${sizeInMB} MB`);
    console.log(`   - Analyses: ${analysesSnapshot.size}`);
    console.log(`   - Drafts: ${draftsSnapshot.size}`);
    
    return {
      documentCount: totalCount,
      sizeInMB: parseFloat(sizeInMB),
      analysesCount: analysesSnapshot.size,
      draftsCount: draftsSnapshot.size
    };
    
  } catch (error) {
    console.error('❌ Error calculating storage usage:', error);
    return {
      documentCount: 0,
      sizeInMB: 0,
      analysesCount: 0,
      draftsCount: 0
    };
  }
}

/**
 * ✅ CLEAR CACHE
 */
export async function clearCache() {
  try {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      const keysToKeep = ['dashboardVisited'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      sessionStorage.clear();
    }
    
    console.log('✅ Cache cleared successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    throw error;
  }
}

/**
 * ✅ DELETE ALL DOCUMENTS (UPDATED - INCLUDES DRAFTS)
 */
export async function deleteAllDocuments(userId) {
  try {
    console.log('🗑️ Deleting all documents for user:', userId);
    
    const batch = writeBatch(db);
    
    // Delete all analyses
    const analysesQuery = query(
      collection(db, 'analyses'),
      where('userId', '==', userId)
    );
    const analysesSnapshot = await getDocs(analysesQuery);
    
    analysesSnapshot.docs.forEach(document => {
      batch.delete(doc(db, 'analyses', document.id));
    });
    
    // ✅ Delete all drafts
    const draftsQuery = query(
      collection(db, 'drafts'),
      where('userId', '==', userId)
    );
    const draftsSnapshot = await getDocs(draftsQuery);
    
    draftsSnapshot.docs.forEach(document => {
      batch.delete(doc(db, 'drafts', document.id));
    });
    
    await batch.commit();
    
    console.log(`✅ Deleted ${analysesSnapshot.size} analyses + ${draftsSnapshot.size} drafts`);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error deleting all documents:', error);
    throw error;
  }
}