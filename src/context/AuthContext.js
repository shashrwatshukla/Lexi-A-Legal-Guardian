"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase'; // Make sure this path is correct

// 1. Create the AuthContext
const AuthContext = createContext();

// 2. Create the AuthProvider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is the official Firebase listener that always knows the auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // This will be the user object or null
      setLoading(false);
    });

    // Cleanup subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  const value = {
    user, // The user object from Firebase (or null if not logged in)
    loading, // A flag to know if the auth state is still being checked
  };

  // We wait until the initial auth check is done before rendering children
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Create a custom hook for easy access
export const useAuth = () => {
  return useContext(AuthContext);
};