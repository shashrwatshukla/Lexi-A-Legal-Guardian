import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
  deleteUser
} from "firebase/auth";
import { auth } from "./firebase";
import { 
  createUserDocument, 
  getUserDocument, 
  updateLastLogin, 
  deleteUserDocument,
  isUsernameTaken 
} from "./userService";

// ===== ERROR MESSAGES =====
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/weak-password':
      return 'Password is too weak (min 6 characters).';
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled.';
    case 'auth/popup-blocked':
      return 'Please allow popups for this site.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};

// ===== EMAIL/PASSWORD LOGIN (✅ NO 2FA) =====
export const loginEmail = async ({ email, password }) => {
  try {
    console.log(`[AUTH] Login attempt: ${email}`);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // ✅ Check email verification
    if (!user.emailVerified) {
      console.log(`[AUTH] Email not verified for ${email}`);
      await signOut(auth);
      throw new Error('Please verify your email before logging in. Check your inbox (and spam folder).');
    }
    
    // ✅ Update last login
    await updateLastLogin(user.uid);
    
    console.log(`[AUTH] ✅ Login successful: ${user.uid}`);
    return user;

  } catch (error) {
    console.error("[AUTH] ❌ Login error:", error);
    
    if (error.message.includes('verify your email')) {
      throw error;
    }
    
    throw new Error(getErrorMessage(error.code));
  }
};

// ===== EMAIL/PASSWORD SIGNUP (✅ NO 2FA) =====
export const signUpEmail = async ({ username, email, password, uniqueUsername, gender, dob, region }) => {
  let createdUser = null;
  
  try {
    console.log(`[AUTH] Signup attempt: ${email}`);
    
    // ✅ Check username availability
    const usernameTaken = await isUsernameTaken(uniqueUsername);
    if (usernameTaken) {
      throw new Error('This username is already taken.');
    }
    
    // ✅ Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    createdUser = userCredential.user;
    
    // ✅ Update display name
    await updateProfile(createdUser, { displayName: username });
    
    // ✅ Create Firestore document
    const userData = {
      email,
      displayName: username,
      name: username,
      uniqueUsername,
      username: uniqueUsername,
      gender,
      dob,
      dateOfBirth: dob,
      region,
      emailVerified: false,
      authProvider: 'email',
      usernameChanged: false,
      profileComplete: true
    };
    
    await createUserDocument(createdUser.uid, userData);
    
    // ✅ Send verification email
    await sendEmailVerification(createdUser, {
      url: `${window.location.origin}/auth`,
      handleCodeInApp: false,
    });
    
    // ✅ Sign out (force email verification)
    await signOut(auth);
    
    console.log(`[AUTH] ✅ Signup successful: ${createdUser.uid}`);
    
    return { 
      success: true, 
      message: 'Account created! Check your email to verify.',
      uid: createdUser.uid 
    };
    
  } catch (error) {
    console.error("[AUTH] ❌ Signup error:", error);
    
    // ✅ Cleanup on error
    if (createdUser) {
      await deleteUser(createdUser).catch(err => console.error('Cleanup error:', err));
    }
    
    if (error.message.includes('username is already taken')) {
      throw error;
    }
    
    throw new Error(getErrorMessage(error.code) || error.message);
  }
};

// ===== GOOGLE SIGN-IN (✅ FIXED) =====
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ 
      prompt: 'select_account',
      // ✅ Fix: Add these parameters
      access_type: 'online',
    });
    
    console.log("[AUTH] Opening Google sign-in...");
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log(`[AUTH] ✅ Google sign-in successful: ${user.uid}`);
    
    // ✅ Check if user exists in Firestore
    const userDoc = await getUserDocument(user.uid);
    
    if (!userDoc) {
      console.log("[AUTH] New Google user - creating document");
      
      // ✅ Generate unique username
      const emailUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomId = user.uid.substring(0, 6);
      const generatedUsername = `${emailUsername}_${randomId}`;
      
      const userData = {
        email: user.email,
        displayName: user.displayName || 'Google User',
        name: user.displayName || 'Google User',
        uniqueUsername: generatedUsername,
        username: generatedUsername,
        photoURL: user.photoURL || null,
        emailVerified: true, // ✅ Google users are pre-verified
        authProvider: 'google',
        profileComplete: false,
      };
      
      await createUserDocument(user.uid, userData);
      console.log(`[AUTH] ✅ Google user document created`);
    } else {
      await updateLastLogin(user.uid);
      console.log("[AUTH] ✅ Existing Google user");
    }
    
    return user;
    
  } catch (error) {
    console.error("[AUTH] ❌ Google sign-in error:", error);
    
    // ✅ Better error handling for popup issues
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    }
    
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by your browser. Please allow popups and try again.');
    }
    
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Another sign-in is in progress. Please wait.');
    }
    
    throw new Error(getErrorMessage(error.code));
  }
};

// ===== PASSWORD RESET =====
export const sendReset = async (email) => {
  try {
    console.log(`[AUTH] Sending password reset to: ${email}`);
    
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/auth`,
      handleCodeInApp: false,
    });
    
    console.log(`[AUTH] ✅ Password reset email sent`);
    return true;
    
  } catch (error) {
    console.error("[AUTH] ❌ Password reset error:", error);
    throw new Error(getErrorMessage(error.code));
  }
};

// ===== RESEND VERIFICATION EMAIL =====
export const resendVerificationEmail = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user is currently signed in.');
  }
  
  if (user.emailVerified) {
    throw new Error('This email is already verified.');
  }

  try {
    console.log(`[AUTH] Resending verification to: ${user.email}`);
    
    await sendEmailVerification(user, {
      url: `${window.location.origin}/auth`,
      handleCodeInApp: false,
    });
    
    console.log(`[AUTH] ✅ Verification email resent`);
    return true;
    
  } catch (error) {
    console.error("[AUTH] ❌ Resend error:", error);
    throw new Error(getErrorMessage(error.code));
  }
};

// ===== LOGOUT =====
export const logout = async () => {
  try {
    console.log("[AUTH] Logging out...");
    await signOut(auth);
    console.log("[AUTH] ✅ Logged out");
    return true;
  } catch (error) {
    console.error("[AUTH] ❌ Logout error:", error);
    throw new Error("Logout failed.");
  }
};

// ===== DELETE ACCOUNT =====
export const deleteAccount = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No user logged in.');
  }
  
  try {
    console.log(`[AUTH] Deleting account: ${user.uid}`);
    
    await deleteUserDocument(user.uid);
    await deleteUser(user);
    
    console.log(`[AUTH] ✅ Account deleted`);
    return true;
    
  } catch (error) {
    console.error("[AUTH] ❌ Delete error:", error);
    throw new Error(getErrorMessage(error.code) || "Failed to delete account.");
  }
};

// ===== SESSION CHECK =====
export const isSessionValid = () => {
  const user = auth.currentUser;
  return user !== null && user.emailVerified;
};

// ===== GET CURRENT USER =====
export const getCurrentUser = async () => {
  const user = auth.currentUser;
  
  if (!user) return null;
  
  try {
    const userDoc = await getUserDocument(user.uid);
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      isAuthenticated: true,
      ...userDoc 
    };
  } catch (error) {
    console.error("[AUTH] Error getting user:", error);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      isAuthenticated: true,
    };
  }
};