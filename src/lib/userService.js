import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// ===== CACHE LAYER =====
const USER_CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedUser = (uid) => {
  const cached = USER_CACHE.get(uid);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    USER_CACHE.delete(uid);
    return null;
  }
  
  return cached.data;
};

const setCachedUser = (uid, data) => {
  USER_CACHE.set(uid, {
    data,
    timestamp: Date.now()
  });
};

const clearUserCache = (uid) => {
  USER_CACHE.delete(uid);
};

// ===== USER DATA MANAGEMENT =====

// Create new user document in Firestore
export const createUserDocument = async (uid, userData) => {
  try {
    const userRef = doc(db, "users", uid);
    
    const userDocument = {
      uid: uid,
      email: userData.email,
      displayName: userData.displayName || userData.name,
      uniqueUsername: userData.uniqueUsername || userData.username,
      gender: userData.gender || null,
      dateOfBirth: userData.dob || userData.dateOfBirth || null,
      region: userData.region || null,
      photoURL: userData.photoURL || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: userData.emailVerified || false,
      authProvider: userData.authProvider || 'email',
      isActive: true,
      lastLogin: new Date().toISOString(),
      usernameChanged: userData.usernameChanged || false,
      profileComplete: userData.profileComplete || false
    };
    
    await setDoc(userRef, userDocument);
    
    // Cache the new user
    setCachedUser(uid, userDocument);
    
    console.log('✅ User document created in Firestore:', uid);
    return userDocument;
  } catch (error) {
    console.error("❌ Error creating user document:", error);
    throw new Error("Failed to create user document");
  }
};

// Get user data from Firestore (✅ OPTIMIZED with caching)
export const getUserDocument = async (uid) => {
  try {
    if (!uid) {
      console.warn('⚠️ getUserDocument called with no UID');
      return null;
    }

    // ✅ Check cache first
    const cached = getCachedUser(uid);
    if (cached) {
      console.log('✅ User document retrieved from cache:', uid);
      return cached;
    }

    // Fetch from Firestore
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      
      // ✅ Cache the result
      setCachedUser(uid, userData);
      
      console.log('✅ User document retrieved from Firestore:', uid);
      return userData;
    } else {
      console.log('⚠️ No user document found for:', uid);
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting user document:", error);
    console.error("❌ Error details:", error.message);
    
    // ✅ Return null instead of throwing (prevents app crash)
    return null;
  }
};

// Update user data in Firestore (✅ OPTIMIZED with cache invalidation)
export const updateUserDocument = async (uid, updates) => {
  try {
    const userRef = doc(db, "users", uid);
    
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(userRef, updatedData);
    
    // ✅ Invalidate cache
    clearUserCache(uid);
    
    console.log('✅ User document updated:', uid);
    return updatedData;
  } catch (error) {
    console.error("❌ Error updating user document:", error);
    throw new Error("Failed to update user document");
  }
};

// Update last login time (✅ OPTIMIZED - non-blocking)
export const updateLastLogin = async (uid) => {
  try {
    if (!uid) {
      console.warn('⚠️ updateLastLogin called with no UID');
      return;
    }

    const userRef = doc(db, "users", uid);
    
    // ✅ Fire and forget (don't wait for response)
    updateDoc(userRef, {
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).then(() => {
      console.log('✅ Last login updated for:', uid);
      clearUserCache(uid); // Invalidate cache
    }).catch((error) => {
      console.error("❌ Error updating last login:", error);
    });
    
  } catch (error) {
    console.error("❌ Error updating last login:", error);
    // ✅ Don't throw - just log (non-critical operation)
  }
};

// Delete user document from Firestore
export const deleteUserDocument = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);
    
    // ✅ Clear cache
    clearUserCache(uid);
    
    console.log('✅ User document deleted:', uid);
    return true;
  } catch (error) {
    console.error("❌ Error deleting user document:", error);
    throw new Error("Failed to delete user document");
  }
};

// Check if username is already taken (✅ OPTIMIZED with caching)
const USERNAME_CACHE = new Map();
const USERNAME_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const isUsernameTaken = async (username) => {
  try {
    if (!username) {
      return false;
    }

    // ✅ Check cache first
    const cacheKey = `username_${username.toLowerCase()}`;
    const cached = USERNAME_CACHE.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < USERNAME_CACHE_DURATION)) {
      console.log('✅ Username check from cache:', username);
      return cached.taken;
    }

    // Query Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uniqueUsername", "==", username));
    const querySnapshot = await getDocs(q);
    
    const isTaken = !querySnapshot.empty;
    
    // ✅ Cache result
    USERNAME_CACHE.set(cacheKey, {
      taken: isTaken,
      timestamp: Date.now()
    });
    
    console.log('✅ Username check from Firestore:', username, isTaken);
    return isTaken;
  } catch (error) {
    console.error("❌ Error checking username:", error);
    // ✅ Return false on error (safer default)
    return false;
  }
};

// Get user by email (✅ OPTIMIZED)
export const getUserByEmail = async (email) => {
  try {
    if (!email) {
      return null;
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      
      // ✅ Cache the user
      if (userData.uid) {
        setCachedUser(userData.uid, userData);
      }
      
      return userData;
    }
    return null;
  } catch (error) {
    console.error("❌ Error getting user by email:", error);
    return null;
  }
};

// Get user by username (✅ OPTIMIZED)
export const getUserByUsername = async (username) => {
  try {
    if (!username) {
      return null;
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uniqueUsername", "==", username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      
      // ✅ Cache the user
      if (userData.uid) {
        setCachedUser(userData.uid, userData);
      }
      
      return userData;
    }
    return null;
  } catch (error) {
    console.error("❌ Error getting user by username:", error);
    return null;
  }
};

// ===== USERNAME UPDATE (ONLY ONCE) =====

// Update username (can only be done once) - ✅ KEEP SAME
export const updateUsername = async (uid, newUsername) => {
  try {
    if (!uid || !newUsername) {
      throw new Error('UID and new username are required');
    }

    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }
    
    const userData = userDoc.data();
    
    // ✅ Check if username was already changed
    if (userData.usernameChanged === true) {
      throw new Error('Username has already been changed once. You cannot change it again.');
    }
    
    // ✅ Check if new username is taken
    const isTaken = await isUsernameTaken(newUsername);
    if (isTaken) {
      throw new Error('This username is already taken. Please choose another one.');
    }
    
    // ✅ Update username and set flag
    await updateDoc(userRef, {
      uniqueUsername: newUsername,
      username: newUsername,
      usernameChanged: true,
      updatedAt: new Date().toISOString()
    });
    
    // ✅ Clear caches
    clearUserCache(uid);
    USERNAME_CACHE.clear(); // Clear username cache
    
    console.log('✅ Username updated successfully:', newUsername);
    return { success: true, username: newUsername };
    
  } catch (error) {
    console.error("❌ Error updating username:", error);
    throw error;
  }
};

// ===== EXPORT CACHE UTILITIES (for manual cache management) =====
export { clearUserCache };