import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const sessionData = await request.json();
    
    // Save to Firestore
    const docRef = await addDoc(collection(db, 'sharedSessions'), {
      ...sessionData,
      createdAt: serverTimestamp(),
      expiresAt: null, // or set expiration date if needed
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${docRef.id}`;

    return Response.json({ 
      success: true, 
      shareUrl,
      sessionId: docRef.id 
    });
  } catch (error) {
    console.error('Error creating shared session:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}