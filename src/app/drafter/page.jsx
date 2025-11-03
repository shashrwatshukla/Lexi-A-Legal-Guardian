'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getDraftById } from '../../lib/draftService';
import PixelTrail from '../../components/ui/PixelTrail';
import { generatePDFWithTemplate, downloadPDF } from '../../lib/pdfGenerator';
import RegionSelector from "./RegionSelector";

export default function DrafterPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [draft, setDraft] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [showFormatWarning, setShowFormatWarning] = useState(false);
  
  // View mode states
  const [viewMode, setViewMode] = useState(false);
  const [viewingDraftId, setViewingDraftId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const iframeRef = useRef(null);

  // CHECK AUTHENTICATION
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        console.log('✅ User authenticated:', user.email);
      } else {
        console.log('❌ No user, redirecting to auth');
        router.push('/auth');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // CHECK FOR VIEW MODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewDraftId = params.get('view');
    
    if (viewDraftId) {
      console.log('👁️ View mode activated for draft:', viewDraftId);
      setViewMode(true);
      setViewingDraftId(viewDraftId);
      loadSavedDraft(viewDraftId);
    }
  }, []);

  // ✅ SHOW POPUP ONLY FOR NEWLY GENERATED DRAFTS (NOT SAVED ONES)
  useEffect(() => {
    if (!viewMode && draft && pdfPreviewUrl && !loading && !loadingPreview) {
      // Show popup after draft is generated (500ms delay for smooth transition)
      const timer = setTimeout(() => {
        setShowFormatWarning(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [viewMode, draft, pdfPreviewUrl, loading, loadingPreview]);

// ✅ LOAD SAVED DRAFT - CONVERT BASE64 TO PDF
const loadSavedDraft = async (draftId) => {
  setLoading(true);
  setLoadingPreview(true);
  
  try {
    console.log('📥 Loading draft from Firestore:', draftId);
    
    const draftData = await getDraftById(draftId);
    
    console.log('✅ Draft loaded from Firestore');
    console.log('📊 Has PDF base64:', !!draftData.pdfBase64);
    console.log('📊 PDF base64 size:', draftData.pdfBase64 ? `${(draftData.pdfBase64.length / 1024).toFixed(2)} KB` : 'N/A');
    
    setDraft(draftData.content);
    setDocumentTitle(draftData.title);
    
    // ✅ CONVERT BASE64 TO PDF BLOB
    if (draftData.pdfBase64 && draftData.pdfBase64.length > 0) {
      try {
        console.log('🔄 Converting base64 to PDF blob...');
        
        // Convert base64 to binary
        const binaryString = atob(draftData.pdfBase64);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        console.log('✅ PDF converted successfully');
        console.log('📄 PDF bytes:', bytes.length, 'bytes');
        
        // Store bytes for download
        setPdfBytes(bytes);
        
        // Create blob URL for iframe
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        setPdfPreviewUrl(url);
        
        console.log('🎉 PDF PREVIEW READY - EXACT SAVED PDF');
        
        setLoadingPreview(false);
        
      } catch (conversionError) {
        console.error('❌ PDF conversion error:', conversionError);
        alert('⚠️ Failed to convert PDF.\n\nError: ' + conversionError.message);
        setLoadingPreview(false);
      }
      
    } else {
      console.error('❌ NO PDF DATA IN FIRESTORE!');
      alert('⚠️ No PDF found for this draft.\n\nPlease create a new draft.');
      setLoadingPreview(false);
    }
    
  } catch (error) {
    console.error('❌ Error loading draft:', error);
    alert('Failed to load draft.\n\nError: ' + error.message);
    router.push('/dashboard');
  } finally {
    setLoading(false);
  }
};

  // Detect device type
  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [prompt]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        setPrompt(prev => prev + finalTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Only generate PDF for NEW drafts (not in view mode)
  useEffect(() => {
    if (draft && !pdfPreviewUrl && !viewMode && !viewingDraftId) {
      console.log('🔄 Generating PDF preview for NEW draft...');
      generatePDFPreview();
    }
  }, [draft, pdfPreviewUrl, viewMode, viewingDraftId]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleInputChange = (e) => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setPrompt(e.target.value);
  };

  const extractDocumentTitle = (generatedText) => {
    const lines = generatedText.split('\n');
    const firstLine = lines[0]?.trim();
    
    if (firstLine && (firstLine === firstLine.toUpperCase() || 
        firstLine.includes('AGREEMENT') || 
        firstLine.includes('CONTRACT'))) {
      return firstLine;
    }
    
    return 'LEGAL DOCUMENT';
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a document description');
      return;
    }

    if (!window.selectedJurisdiction) {
      alert('⚠️ Please select a region before generating the document.\n\nThe legal requirements vary by jurisdiction, so we need to know which region\'s laws to follow.');
      return;
    }

    if (!currentUser) {
      alert('⚠️ Please login to save drafts.\n\nYou need to be logged in to save your generated documents.');
      router.push('/auth');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setLoading(true);
    setLoadingPreview(true);
    
    try {
      console.log('🚀 Generating draft for user:', currentUser.uid);
      
      const response = await fetch('/api/draft-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'plain-language',
          formData: {
            prompt: prompt,
            jurisdiction: window.selectedJurisdiction
          },
          userId: currentUser.uid
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setDraft(data.draft);
        setDocumentTitle(extractDocumentTitle(data.draft));
        
        // ✅ USE PDF URL FROM RESPONSE
        if (data.pdfUrl) {
          setPdfPreviewUrl(data.pdfUrl);
          setLoadingPreview(false);
        }
        
        console.log('✅ Draft generated and saved with ID:', data.draftId);
        console.log('📎 PDF URL:', data.pdfUrl);
        
        // ✅ REMOVED SUCCESS ALERT - POPUP WILL SHOW INSTEAD
        
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
        setLoadingPreview(false);
      }
    } catch (error) {
      console.error('❌ Generation failed:', error);
      alert('Failed to generate document. Please try again.');
      setLoadingPreview(false);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFPreview = async () => {
    try {
      console.log('📄 Generating PDF preview...');
      const bytes = await generatePDFWithTemplate(draft, documentTitle, 'Legal Document');
      setPdfBytes(bytes);
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPdfPreviewUrl(url);
      setLoadingPreview(false);
      console.log('✅ PDF preview generated');
    } catch (error) {
      console.error('❌ PDF Preview Error:', error);
      alert('Failed to generate PDF preview: ' + error.message);
      setLoadingPreview(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      if (viewMode && pdfBytes) {
        // ✅ USE STORED BYTES FOR VIEW MODE
        const filename = `${documentTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        downloadPDF(pdfBytes, filename);
        console.log('✅ Downloaded from stored bytes');
      } else if (viewMode && pdfPreviewUrl) {
        // ✅ FALLBACK: DIRECT DOWNLOAD FROM STORAGE URL
        const link = document.createElement('a');
        link.href = pdfPreviewUrl;
        link.download = `${documentTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Downloaded from Storage URL');
      } else {
        // For newly created drafts
        let bytes = pdfBytes;
        
        if (!bytes) {
          console.log('🔄 Regenerating PDF for download...');
          bytes = await generatePDFWithTemplate(draft, documentTitle, 'Legal Document');
          setPdfBytes(bytes);
        }
        
        const filename = `${documentTitle.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
        downloadPDF(bytes, filename);
        
        console.log('✅ PDF downloaded:', filename);
      }
    } catch (error) {
      console.error('❌ PDF Download Error:', error);
      alert('Failed to download PDF: ' + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    if (pdfPreviewUrl && iframeRef.current) {
      try {
        iframeRef.current.contentWindow.print();
      } catch (error) {
        const printWindow = window.open(pdfPreviewUrl);
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      }
    } else {
      alert('PDF is still loading. Please wait a moment.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow-x: hidden;
        }

        .flip-container-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 5;
          pointer-events: none;
          width: 100%;
          padding-top: 85px;
          text-align: center;
        }

        .lexi-title {
          font-size: 100px;
          font-weight: 900;
          color: #000000;
          margin: 0 0 8px 0;
          letter-spacing: 8px;
          font-family: 'Roboto', sans-serif;
        }

        .flip-wrapper {
          height: 70px;
          overflow: hidden;
          margin: 0 auto 8px;
          display: inline-block;
        }

        .flip-inner {
          display: block;
        }

        .flip-item {
          display: block;
          height: 70px;
        }

        .flip-text {
          color: #fff;
          padding: 8px 22px;
          height: 60px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 44px;
          font-weight: 700;
          text-transform: uppercase;
          line-height: 1;
          white-space: nowrap;
          font-family: 'Roboto', sans-serif;
        }

        .flip-inner {
          animation: flipShow 8s linear infinite;
        }

        .flip-text.color-1 {
          background: #4ec7f3;
        }
        
        .flip-text.color-2 {
          background: #42c58a;
        }
        
        .flip-text.color-3 {
          background: #f39c12;
        }
        
        .flip-text.color-4 {
          background: #DC143C;
        }

        @keyframes flipShow {
          0% { transform: translateY(0); }
          20% { transform: translateY(0); }
          25% { transform: translateY(-70px); }
          45% { transform: translateY(-70px); }
          50% { transform: translateY(-140px); }
          70% { transform: translateY(-140px); }
          75% { transform: translateY(-210px); }
          95% { transform: translateY(-210px); }
          100% { transform: translateY(-280px); }
        }

        .subtitle-text {
          font-size: 24px;
          color: #666666;
          text-align: center;
          font-weight: 500;
          margin: 0;
          font-family: 'Roboto', sans-serif;
        }

        .input-container {
          transition: all 0.3s ease;
        }

        .input-container.active {
          border-color: #42c58a !important;
          box-shadow: 0 0 0 3px rgba(66, 197, 138, 0.1), 0 0 20px rgba(66, 197, 138, 0.3) !important;
        }

        textarea:-webkit-autofill,
        textarea:-webkit-autofill:hover,
        textarea:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px white inset !important;
          box-shadow: 0 0 0px 1000px white inset !important;
          -webkit-text-fill-color: #1f2937 !important;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        @keyframes waveform {
          0%, 100% { height: 20px; }
          50% { height: 50px; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @media (max-width: 768px) {
          .flip-container-wrapper {
            padding-top: 80px !important;
          }
          .lexi-title {
            font-size: 60px;
            letter-spacing: 5px;
            margin: 0 0 6px 0;
          }
          .flip-wrapper {
            height: 50px;
            margin: 0 auto 6px;
          }
          .flip-item {
            height: 50px;
          }
          .flip-text {
            font-size: 28px;
            padding: 5px 16px;
            height: 42px;
          }
          @keyframes flipShow {
            0% { transform: translateY(0); }
            20% { transform: translateY(0); }
            25% { transform: translateY(-50px); }
            45% { transform: translateY(-50px); }
            50% { transform: translateY(-100px); }
            70% { transform: translateY(-100px); }
            75% { transform: translateY(-150px); }
            95% { transform: translateY(-150px); }
            100% { transform: translateY(-200px); }
          }
          .subtitle-text {
            font-size: 18px;
          }
        }
      `}</style>

      {isDesktop && <PixelTrail />}

      {/* ✅ FORMAT WARNING POPUP - ONLY FOR NEWLY GENERATED DRAFTS */}
      {showFormatWarning && !viewMode && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[99999]"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setShowFormatWarning(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md mx-4 relative"
            style={{ 
              animation: 'slideDown 0.4s ease-out',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowFormatWarning(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              ✅ Document Generated!
            </h3>

            {/* Message */}
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 mb-6">
              <p className="text-gray-800 text-sm leading-relaxed text-center mb-3">
                <strong className="text-amber-900">Important:</strong> The document content in Recent Documents may not display with proper formatting.
              </p>
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                For the best viewing experience with correct formatting, please <strong className="text-amber-900">download the PDF</strong> directly.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowFormatWarning(false);
                  handleDownloadPDF();
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Download PDF Now
              </button>
              
              <button
                onClick={() => setShowFormatWarning(false)}
                className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200"
              >
                Continue to Preview
              </button>
            </div>

            {/* Info Text */}
            <p className="text-xs text-gray-500 text-center mt-4">
              💡 Tip: Always download the PDF for accurate formatting
            </p>
          </div>
        </div>
      )}
      
      <div className="fixed top-6 left-6 z-[9999]" style={{ pointerEvents: 'auto' }}>
        <button 
          onClick={() => router.push(viewMode ? '/dashboard' : '/home')}
          className="group bg-white hover:bg-gray-900 text-gray-700 hover:text-white border-2 border-gray-300 hover:border-gray-900 transition-all duration-300 flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-xl shadow-lg hover:shadow-xl text-sm md:text-base font-semibold"
        >
          <svg 
            className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">
            {viewMode ? 'Back to Dashboard' : 'Back to Analyzer'}
          </span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      {isListening && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ 
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md mx-4 text-center"
            style={{ animation: 'modalFadeIn 0.3s ease-out' }}
          >
            <div className="relative mb-6">
              <div 
                className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
                style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
              >
                <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div 
                className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 mx-auto bg-red-500 rounded-full opacity-20"
                style={{ animation: 'ripple 1.5s ease-out infinite' }}
              ></div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Listening...</h3>
            <p className="text-gray-600 mb-6 text-sm md:text-base">Start speaking to describe your document</p>
            <div className="flex items-center justify-center gap-1 mb-8 h-12">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 md:w-1.5 bg-red-500 rounded-full"
                  style={{
                    animation: `waveform 1s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                    height: '20px'
                  }}
                ></div>
              ))}
            </div>
            <button
              onClick={toggleListening}
              className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              Stop Recording
            </button>
            <p className="text-xs text-gray-400 mt-4">Speak clearly and describe the type of legal document you need</p>
          </div>
        </div>
      )}

      {!draft && !viewMode && (
        <>
          <div className="flip-container-wrapper">
            <div style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1000, marginBottom: isDesktop ? '0' : '15px' }}>
              <RegionSelector onSelect={(jurisdiction) => {
                window.selectedJurisdiction = jurisdiction;
              }} />
            </div>
            <div className="lexi-title">LEXI</div>
            <div className="flip-wrapper">
              <div className="flip-inner">
                <div className="flip-item"><div className="flip-text color-1">Drafting. Done.</div></div>
                <div className="flip-item"><div className="flip-text color-2">Risk. Controlled.</div></div>
                <div className="flip-item"><div className="flip-text color-3">Compliance. Built‑in.</div></div>
                <div className="flip-item"><div className="flip-text color-4">Approvals. Accelerated.</div></div>
                <div className="flip-item"><div className="flip-text color-1">Drafting. Done.</div></div>
              </div>
            </div>
            <div className="subtitle-text">Faster contracts, full control.</div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pb-6 md:pb-8 pt-8 md:pt-12" style={{ pointerEvents: 'none', zIndex: 10 }}>
            <div className="max-w-3xl mx-auto px-4 md:px-8" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}>
              <div className="relative">
                <div 
                  className={`input-container bg-white rounded-full border-2 border-gray-300 shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center px-4 md:px-6 py-3 md:py-4 gap-2 md:gap-3 ${
                    (isFocused || prompt.trim().length > 0) ? 'active' : ''
                  }`}
                  style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto', minHeight: '56px' }}
                >
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Describe your document here..."
                    rows={1}
                    disabled={isListening}
                    className="flex-1 resize-none outline-none text-gray-900 placeholder-gray-400 bg-transparent text-sm md:text-base leading-6 max-h-[200px] overflow-y-auto focus:outline-none focus:ring-0"
                    style={{ 
                      minHeight: '28px', 
                      scrollbarWidth: 'thin', 
                      scrollbarColor: '#d1d5db transparent', 
                      paddingTop: '2px',
                      border: 'none'
                    }}
                  />
                  <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <button
                      onClick={toggleListening}
                      disabled={loading || prompt.trim().length > 0}
                      className={`p-2 md:p-2.5 rounded-full transition-all duration-200 ${
                        isListening ? 'bg-red-500 text-white animate-pulse' : prompt.trim().length > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isListening ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={loading || !prompt.trim() || isListening}
                      className={`p-2 md:p-2.5 rounded-full transition-all duration-200 ${
                        prompt.trim() && !loading && !isListening ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {loading ? (
                        <svg className="w-5 h-5 md:w-6 md:h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2 md:mt-3">Press Enter to generate • Shift + Enter for new line</p>
              </div>
            </div>
          </div>
        </>
      )}

{(draft || viewMode) && (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
        
        <div className="xl:col-span-9 space-y-3 sm:space-y-4">
          
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                      {viewMode ? 'Saved Document' : 'Generated Document'}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {documentTitle}
                    </p>
                  </div>
                </div>
              </div>
              
              {!viewMode && (
                <button
                  onClick={() => {
                    setDraft('');
                    setPrompt('');
                    setPdfBytes(null);
                    if (pdfPreviewUrl) {
                      URL.revokeObjectURL(pdfPreviewUrl);
                    }
                    setPdfPreviewUrl(null);
                    setDocumentTitle('');
                    setShowFormatWarning(false);
                  }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  <span className="hidden sm:inline">New Document</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {loadingPreview ? (
              <div className="flex items-center justify-center h-[450px] lg:h-[700px] bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 w-12 h-12 sm:w-14 sm:h-14 border-3 border-transparent border-t-pink-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                  </div>
                  <p className="text-gray-700 font-semibold text-sm sm:text-base mb-1">
                    {viewMode ? '📥 Loading saved document...' : '🔄 Generating PDF...'}
                  </p>
                  <p className="text-gray-500 text-xs">Please wait</p>
                </div>
              </div>
            ) : pdfPreviewUrl ? (
              <div className="relative">
                <iframe
                  ref={iframeRef}
                  src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full h-[450px] lg:h-[700px] border-0"
                  title="PDF Preview"
                  style={{ display: 'block' }}
                />
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200 p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900 mb-0.5">PDF not displaying?</p>
                      <button
                        onClick={handleDownloadPDF}
                        className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 text-xs font-semibold transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Download instead
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[450px] lg:h-[700px] bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center px-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <p className="text-gray-900 font-semibold text-sm mb-1">Failed to load preview</p>
                  <p className="text-gray-600 text-xs mb-3">Could not display PDF in browser</p>
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all text-xs"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              Document Statistics
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="text-center p-2.5 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <p className="text-[10px] sm:text-xs text-blue-700 font-semibold mb-0.5">Words</p>
                <p className="text-xl sm:text-2xl font-black text-blue-900">{draft.split(/\s+/).length}</p>
              </div>
              <div className="text-center p-2.5 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <p className="text-[10px] sm:text-xs text-purple-700 font-semibold mb-0.5">Characters</p>
                <p className="text-xl sm:text-2xl font-black text-purple-900">{draft.length}</p>
              </div>
              <div className="text-center p-2.5 sm:p-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                <p className="text-[10px] sm:text-xs text-pink-700 font-semibold mb-0.5">Est. Pages</p>
                <p className="text-xl sm:text-2xl font-black text-pink-900">{Math.ceil(draft.split(/\s+/).length / 250)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 sm:p-4 sticky top-4">
            
            <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-gray-200">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Export Options</h3>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF || loadingPreview}
              className="w-full px-3 sm:px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2 mb-2 text-xs sm:text-sm"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              disabled={loadingPreview || !pdfPreviewUrl}
              className="w-full px-3 sm:px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-900 disabled:text-gray-400 font-semibold rounded-lg shadow hover:shadow-md disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              <span>Print</span>
            </button>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Document Info
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded">
                  <span className="text-gray-600 font-medium">Format:</span>
                  <span className="text-gray-900 font-bold">PDF</span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Ready
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded">
                  <span className="text-gray-600 font-medium">Source:</span>
                  <span className="text-gray-900 font-bold">{viewMode ? 'Saved' : 'Generated'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-l-3 border-yellow-500 rounded-lg p-2.5">
              <div className="flex gap-2">
                <svg className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="text-yellow-900 text-[10px] sm:text-xs font-bold mb-0.5">⚖️ Legal Review Required</p>
                  <p className="text-yellow-800 text-[10px] leading-snug">
                    This AI-generated document must be reviewed by a qualified attorney before use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </>
  );
}