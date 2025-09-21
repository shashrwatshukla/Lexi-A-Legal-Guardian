import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";

// Log all Firebase debug messages to the console
setLogLevel('debug');

let app;
let db;
let auth;

try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  // Check if Firebase has already been initialized
  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  // Get service instances
  auth = getAuth(app);
  db = getFirestore(app);

  // Authenticate the user using the custom token
  if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
    signInWithCustomToken(auth, __initial_auth_token)
      .then(() => {
        console.log("Firebase signed in with custom token.");
      })
      .catch((error) => {
        console.error("Firebase custom token sign-in failed:", error);
        // Fallback to anonymous sign-in if custom token fails
        signInAnonymously(auth)
          .then(() => {
            console.log("Firebase signed in anonymously as fallback.");
          })
          .catch((anonError) => {
            console.error("Firebase anonymous sign-in failed:", anonError);
          });
      });
  } else {
    // If no custom token is available, sign in anonymously
    signInAnonymously(auth)
      .then(() => {
        console.log("Firebase signed in anonymously.");
      })
      .catch((error) => {
        console.error("Firebase anonymous sign-in failed:", error);
      });
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { db, auth };
