import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { db, auth } from './firebase';

// ===== USER PREFERENCES =====

export async function getUserPreferences(uid) {
  if (!uid) return {};
  try {
    const ref = doc(db, 'userPreferences', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      console.log('✅ User preferences loaded');
      return snap.data();
    }
    return {};
  } catch (err) {
    console.error('❌ getUserPreferences error:', err);
    return {};
  }
}

export async function updateUserPreferences(uid, prefs = {}) {
  if (!uid) throw new Error('Missing uid');
  try {
    const ref = doc(db, 'userPreferences', uid);
    await setDoc(ref, prefs, { merge: true });
    console.log('✅ User preferences updated');
    return true;
  } catch (err) {
    console.error('❌ updateUserPreferences error:', err);
    throw new Error('Failed to update preferences');
  }
}

// ===== PASSWORD MANAGEMENT =====

export async function changePassword(currentPassword, newPassword) {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No user logged in');
    }

    // Reauthenticate
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
    
    console.log('✅ Password changed successfully');
    return true;
  } catch (error) {
    console.error('❌ Change password error:', error);
    
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('New password is too weak (min 6 characters)');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('Please log out and log in again before changing password');
    }
    
    throw new Error('Failed to change password');
  }
}

// ===== ACCOUNT DELETION =====

export async function deleteAccount(password) {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No user logged in');
    }

    // Reauthenticate
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    const uid = user.uid;
    
    // Delete user document
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
    console.log('✅ User document deleted');
    
    // Delete preferences
    const prefsRef = doc(db, 'userPreferences', uid);
    await deleteDoc(prefsRef);
    console.log('✅ User preferences deleted');
    
    // Delete analyses
    const analysesRef = collection(db, 'analyses');
    const q = query(analysesRef, where('userId', '==', uid));
    const snapshot = await getDocs(q);
    
    const deletePromises = [];
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, 'analyses', docSnap.id)));
    });
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${deletePromises.length} analyses`);
    
    // Delete Firebase Auth user
    await deleteUser(user);
    console.log('✅ Firebase Auth user deleted');
    
    return true;
  } catch (error) {
    console.error('❌ Delete account error:', error);
    
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('Please log out and log in again before deleting');
    }
    
    throw new Error('Failed to delete account');
  }
}

// ===== DATA EXPORT =====

export async function exportUserData(uid) {
  try {
    if (!uid) throw new Error('No user ID provided');

    // Get user data
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    // Get preferences
    const prefsRef = doc(db, 'userPreferences', uid);
    const prefsSnap = await getDoc(prefsRef);
    const prefsData = prefsSnap.exists() ? prefsSnap.data() : {};

    // Get analyses
    const analysesRef = collection(db, 'analyses');
    const q = query(analysesRef, where('userId', '==', uid));
    const analysesSnap = await getDocs(q);
    const analyses = [];
    analysesSnap.forEach((doc) => {
      analyses.push({ id: doc.id, ...doc.data() });
    });

    // Combine data
    const exportData = {
      user: userData,
      preferences: prefsData,
      analyses: analyses,
      exportDate: new Date().toISOString(),
      totalAnalyses: analyses.length
    };

    // Create download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `lexi-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ Data exported successfully');
    return true;
  } catch (error) {
    console.error('❌ Export data error:', error);
    throw new Error('Failed to export data');
  }
}

// ===== STORAGE MANAGEMENT =====

export async function getStorageUsage(uid) {
  try {
    if (!uid) throw new Error('No user ID provided');

    console.log('💾 Calculating storage for user:', uid);

    const analysesRef = collection(db, 'analyses');
    const q = query(analysesRef, where('userId', '==', uid));
    const snapshot = await getDocs(q);
    
    console.log(`📊 Found ${snapshot.size} documents`);
    
    let documentCount = 0;
    let totalSize = 0;
    
    snapshot.forEach((doc) => {
      documentCount++;
      const data = doc.data();
      const analysisData = data.fullAnalysis || data.analysis || data;
      const dataStr = JSON.stringify(analysisData);
      const size = new Blob([dataStr]).size;
      totalSize += size;
    });

    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

    console.log(`✅ Storage: ${documentCount} docs, ${sizeInMB} MB`);
    
    return {
      documentCount,
      sizeInMB: parseFloat(sizeInMB),
      sizeInBytes: totalSize
    };
  } catch (error) {
    console.error('❌ Get storage error:', error);
    return {
      documentCount: 0,
      sizeInMB: 0,
      sizeInBytes: 0
    };
  }
}

export async function clearCache() {
  try {
    if (typeof window === 'undefined') return false;

    sessionStorage.clear();
    
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('lexi_') || key.startsWith('dashboard_') || key.startsWith('docs_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    console.log('✅ Cache cleared');
    return true;
  } catch (error) {
    console.error('❌ Clear cache error:', error);
    throw new Error('Failed to clear cache');
  }
}

export async function deleteAllDocuments(uid) {
  try {
    if (!uid) throw new Error('No user ID provided');

    const analysesRef = collection(db, 'analyses');
    const q = query(analysesRef, where('userId', '==', uid));
    const snapshot = await getDocs(q);
    
    const deletePromises = [];
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, 'analyses', docSnap.id)));
    });
    
    await Promise.all(deletePromises);
    await clearCache();

    console.log(`✅ Deleted ${deletePromises.length} analyses`);
    return true;
  } catch (error) {
    console.error('❌ Delete all documents error:', error);
    throw new Error('Failed to delete documents');
  }
}