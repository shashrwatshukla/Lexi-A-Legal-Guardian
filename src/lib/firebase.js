import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";


setLogLevel('debug');

let app;
let db;
let auth;

try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  
  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  
  auth = getAuth(app);
  db = getFirestore(app);

  
  if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
    signInWithCustomToken(auth, __initial_auth_token)
      .then(() => {
        console.log("Firebase signed in with custom token.");
      })
      .catch((error) => {
        console.error("Firebase custom token sign-in failed:", error);
        
        signInAnonymously(auth)
          .then(() => {
            console.log("Firebase signed in anonymously as fallback.");
          })
          .catch((anonError) => {
            console.error("Firebase anonymous sign-in failed:", anonError);
          });
      });
  } else {
    
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
