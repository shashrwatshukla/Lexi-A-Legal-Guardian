import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

/**
 * ✅ SAVE DRAFT TO FIRESTORE (WITH BASE64 PDF)
 * @param {string} userId - User's UID
 * @param {object} draftData - { content, title, pdfBytes, jurisdiction }
 * @returns {object} - { success: true, id: docId }
 */
export async function saveDraft(userId, draftData) {
  try {
    console.log('💾 Saving draft to Firestore for user:', userId);
    
    // ✅ Convert PDF bytes to base64
    const pdfBase64 = btoa(String.fromCharCode(...draftData.pdfBytes));
    
    console.log('📊 PDF size:', (pdfBase64.length / 1024).toFixed(2), 'KB');
    
    // ⚠️ Firestore has 1MB limit per field
    if (pdfBase64.length > 1000000) {
      console.warn('⚠️ PDF is larger than 1MB - it may fail to save');
      // We'll save it anyway and let Firestore handle it
    }
    
    const draftRef = collection(db, 'drafts');
    
    const draftDocument = {
      userId: userId,
      title: draftData.title || 'Untitled Draft',
      content: draftData.content,
      pdfBase64: pdfBase64, // ✅ BASE64 PDF
      jurisdiction: draftData.jurisdiction || 'Not specified',
      wordCount: draftData.content.split(/\s+/).length,
      characterCount: draftData.content.length,
      estimatedPages: Math.ceil(draftData.content.split(/\s+/).length / 250),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'draft',
      type: 'draft'
    };
    
    const docRef = await addDoc(draftRef, draftDocument);
    
    console.log('✅ Draft saved successfully with ID:', docRef.id);
    
    return { success: true, id: docRef.id };
    
  } catch (error) {
    console.error('❌ Error saving draft:', error);
    throw new Error('Failed to save draft: ' + error.message);
  }
}

/**
 * ✅ GET DRAFT BY ID
 * @param {string} draftId - Draft document ID
 * @returns {object} - Draft data with id
 */
export async function getDraftById(draftId) {
  try {
    console.log('📥 Fetching draft:', draftId);
    
    const draftRef = doc(db, 'drafts', draftId);
    const draftSnap = await getDoc(draftRef);
    
    if (!draftSnap.exists()) {
      throw new Error('Draft not found in Firestore');
    }
    
    const data = draftSnap.data();
    
    console.log('✅ Draft retrieved:', {
      id: draftSnap.id,
      title: data.title,
      type: data.type,
      hasPdfBase64: !!data.pdfBase64
    });
    
    return {
      id: draftSnap.id,
      ...data
    };
    
  } catch (error) {
    console.error('❌ Error fetching draft:', error);
    throw error;
  }
}

/**
 * ✅ DELETE DRAFT FROM FIRESTORE
 * @param {string} draftId - Draft document ID
 * @returns {object} - { success: true }
 */
export async function deleteDraft(draftId) {
  try {
    console.log('🗑️ Deleting draft:', draftId);
    
    const draftRef = doc(db, 'drafts', draftId);
    await deleteDoc(draftRef);
    
    console.log('✅ Draft deleted successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error deleting draft:', error);
    throw new Error('Failed to delete draft: ' + error.message);
  }
}