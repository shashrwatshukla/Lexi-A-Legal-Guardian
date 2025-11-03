import { db } from '../../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request, { params }) {
  try {
    const { sessionId } = params;
    
    const docRef = doc(db, 'sharedSessions', sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return Response.json({ 
        success: false, 
        error: 'Session not found' 
      }, { status: 404 });
    }

    return Response.json({ 
      success: true, 
      data: docSnap.data() 
    });
  } catch (error) {
    console.error('Error fetching shared session:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}