'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { signInAnonymously } from 'firebase/auth';

export default function TestFirestore() {
  const [logs, setLogs] = useState([]);
  const [authUser, setAuthUser] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  useEffect(() => {
    addLog('🔍 Page loaded, checking Firebase...', 'info');
    
    // Check environment variables
    const envVars = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    addLog('📋 Environment Variables:', 'info');
    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        addLog(`  ✅ ${key}: ${value.substring(0, 20)}...`, 'success');
      } else {
        addLog(`  ❌ ${key}: MISSING`, 'error');
      }
    });

    // Check Firebase instances
    addLog('🔥 Checking Firebase instances...', 'info');
    addLog(`  db: ${db ? '✅ Initialized' : '❌ Not initialized'}`, db ? 'success' : 'error');
    addLog(`  auth: ${auth ? '✅ Initialized' : '❌ Not initialized'}`, auth ? 'success' : 'error');

    // Check auth state
    const unsubscribe = auth.onAuthStateChanged(user => {
      setAuthUser(user);
      if (user) {
        addLog(`👤 Logged in as: ${user.uid}`, 'success');
      } else {
        addLog('👤 Not logged in (anonymous mode needed)', 'warning');
      }
    });

    return () => unsubscribe();
  }, []);

  const testAnonymousLogin = async () => {
    addLog('🔐 Attempting anonymous login...', 'info');
    try {
      const result = await signInAnonymously(auth);
      addLog(`✅ Anonymous login successful: ${result.user.uid}`, 'success');
      setAuthUser(result.user);
    } catch (err) {
      addLog(`❌ Anonymous login failed: ${err.code} - ${err.message}`, 'error');
      console.error('Full error:', err);
    }
  };

  const testFirestoreWrite = async () => {
    addLog('📝 Testing Firestore write...', 'info');
    
    if (!authUser) {
      addLog('⚠️ Not authenticated. Click "Login Anonymously" first', 'warning');
      return;
    }

    try {
      const testRef = doc(db, 'test', 'test-doc-' + Date.now());
      addLog(`📍 Writing to: test/test-doc-${Date.now()}`, 'info');
      
      const data = {
        message: 'Hello Firestore!',
        timestamp: new Date().toISOString(),
        userId: authUser.uid
      };
      
      addLog('📦 Data to write: ' + JSON.stringify(data), 'info');
      
      await setDoc(testRef, data);
      
      addLog('✅ Write successful!', 'success');
    } catch (err) {
      addLog(`❌ Write failed: ${err.code}`, 'error');
      addLog(`❌ Error message: ${err.message}`, 'error');
      console.error('Full error:', err);
    }
  };

  const testFirestoreRead = async () => {
    addLog('📖 Testing Firestore read...', 'info');
    
    try {
      const testRef = doc(db, 'test', 'test-doc');
      addLog('📍 Reading from: test/test-doc', 'info');
      
      const snap = await getDoc(testRef);
      
      if (snap.exists()) {
        addLog('✅ Read successful!', 'success');
        addLog('📦 Data: ' + JSON.stringify(snap.data()), 'success');
      } else {
        addLog('⚠️ Document does not exist', 'warning');
      }
    } catch (err) {
      addLog(`❌ Read failed: ${err.code}`, 'error');
      addLog(`❌ Error message: ${err.message}`, 'error');
      console.error('Full error:', err);
    }
  };

  const testNetworkConnection = async () => {
    addLog('🌐 Testing network connection to Firebase...', 'info');
    
    try {
      const response = await fetch('https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg');
      if (response.ok) {
        addLog('✅ Can reach Firebase CDN', 'success');
      } else {
        addLog('❌ Firebase CDN unreachable', 'error');
      }
    } catch (err) {
      addLog(`❌ Network error: ${err.message}`, 'error');
    }

    try {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/test/connection-test`;
      
      addLog(`🌐 Testing Firestore API: ${firestoreUrl}`, 'info');
      
      const response = await fetch(firestoreUrl);
      addLog(`📡 Firestore API response: ${response.status} ${response.statusText}`, response.ok ? 'success' : 'warning');
    } catch (err) {
      addLog(`❌ Firestore API error: ${err.message}`, 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔥 Firebase Firestore Diagnostic Tool</h1>
        
        {/* Auth Status */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
          {authUser ? (
            <p className="text-green-400">✅ Logged in as: {authUser.uid}</p>
          ) : (
            <p className="text-yellow-400">⚠️ Not authenticated</p>
          )}
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={testAnonymousLogin}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            1️⃣ Login Anonymously
          </button>
          
          <button
            onClick={testNetworkConnection}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
          >
            2️⃣ Test Network
          </button>
          
          <button
            onClick={testFirestoreWrite}
            disabled={!authUser}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            3️⃣ Test Write
          </button>
          
          <button
            onClick={testFirestoreRead}
            className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold"
          >
            4️⃣ Test Read
          </button>
        </div>

        {/* Clear Logs */}
        <button
          onClick={clearLogs}
          className="mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Clear Logs
        </button>

        {/* Logs Display */}
        <div className="bg-black rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Click a button to start testing.</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'warning' ? 'text-yellow-400' :
                  'text-gray-300'
                }`}
              >
                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">📋 Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "1️⃣ Login Anonymously" first</li>
            <li>Click "2️⃣ Test Network" to verify connection</li>
            <li>Click "3️⃣ Test Write" to try writing to Firestore</li>
            <li>Click "4️⃣ Test Read" to try reading from Firestore</li>
            <li>Copy ALL logs and send to developer</li>
          </ol>
        </div>
      </div>
    </div>
  );
}