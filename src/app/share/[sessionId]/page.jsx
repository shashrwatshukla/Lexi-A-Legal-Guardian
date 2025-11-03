"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSharedSession } from '../../../lib/shareSession';
import SharedAnalysisView from '../../../components/share/SharedAnalysisView';

export default function SharedSessionPage() {
  const params = useParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionId = params.sessionId;
        
        if (!sessionId) {
          setError('Invalid session ID');
          setLoading(false);
          return;
        }

        const data = await getSharedSession(sessionId);
        
        if (!data) {
          setError('Session not found or expired');
          setLoading(false);
          return;
        }

        setSessionData(data);
        
        // ✅ NEW: Store detailedSummary in sessionStorage for /detailed-summary page
        if (data.detailedSummary) {
          sessionStorage.setItem('detailedSummary', data.detailedSummary);
          console.log('✅ Detailed summary loaded into sessionStorage');
        }
        
        // ✅ NEW: Also store analysis data for /detailed-summary page
        if (data) {
          const analysisForStorage = {
            metadata: data.metadata,
            analysisResults: data.analysisResults,
            summary: data.summary,
            flaggedClauses: data.flaggedClauses,
            riskScore: data.riskScore,
            documentType: data.documentType
          };
          sessionStorage.setItem('current_document_analysis', JSON.stringify(analysisForStorage));
          console.log('✅ Analysis data loaded into sessionStorage');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading session:', err);
        setError('Failed to load session');
        setLoading(false);
      }
    };

    loadSession();
  }, [params.sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 text-xl">Loading shared analysis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">⚠️ {error}</h1>
          <p className="text-gray-400 mb-6">This shared link may be invalid or expired.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <SharedAnalysisView sessionData={sessionData} />;
}