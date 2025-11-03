'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PixelTrail from '../../components/ui/PixelTrail';
import { generatePDFWithTemplate, createPDFBlobUrl, downloadPDF } from '../../lib/pdfGenerator';
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
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

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
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
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

  // Generate PDF preview automatically when draft is ready
  useEffect(() => {
    if (draft && !pdfPreviewUrl) {
      generatePDFPreview();
    }
  }, [draft]);

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

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setLoading(true);
    setLoadingPreview(true);
    
    try {
      const response = await fetch('/api/draft-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'plain-language',
          formData: {
            prompt: prompt,
            jurisdiction: window.selectedJurisdiction
          },
          userId: 'guest-user'
        })
      });

      const data = await response.json();
      if (data.success) {
        setDraft(data.draft);
        setDocumentTitle(extractDocumentTitle(data.draft));
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
        setLoadingPreview(false);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate document');
      setLoadingPreview(false);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFPreview = async () => {
    try {
      const bytes = await generatePDFWithTemplate(draft, documentTitle, 'Legal Document');
      setPdfBytes(bytes);
      
      const blobUrl = createPDFBlobUrl(bytes);
      setPdfPreviewUrl(blobUrl);
      setLoadingPreview(false);
    } catch (error) {
      console.error('PDF Preview Error:', error);
      alert('Failed to generate PDF preview: ' + error.message);
      setLoadingPreview(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      let bytes = pdfBytes;
      
      if (!bytes) {
        bytes = await generatePDFWithTemplate(draft, documentTitle, 'Legal Document');
        setPdfBytes(bytes);
      }
      
      const filename = `legal-document-${Date.now()}.pdf`;
      downloadPDF(bytes, filename);
    } catch (error) {
      console.error('PDF Download Error:', error);
      alert('Failed to download PDF: ' + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    if (pdfPreviewUrl) {
      const printWindow = window.open(pdfPreviewUrl);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
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
          0% {
            transform: translateY(0);
          }
          20% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-70px);
          }
          45% {
            transform: translateY(-70px);
          }
          50% {
            transform: translateY(-140px);
          }
          70% {
            transform: translateY(-140px);
          }
          75% {
            transform: translateY(-210px);
          }
          95% {
            transform: translateY(-210px);
          }
          100% {
            transform: translateY(-280px);
          }
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

        /* Microphone Modal Animations */
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes waveform {
          0%, 100% {
            height: 20px;
          }
          50% {
            height: 50px;
          }
        }

        /* MOBILE RESPONSIVE STYLES */
        @media (max-width: 768px) {
          .flip-container-wrapper {
            padding-top: 25px;
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
            0% {
              transform: translateY(0);
            }
            20% {
              transform: translateY(0);
            }
            25% {
              transform: translateY(-50px);
            }
            45% {
              transform: translateY(-50px);
            }
            50% {
              transform: translateY(-100px);
            }
            70% {
              transform: translateY(-100px);
            }
            75% {
              transform: translateY(-150px);
            }
            95% {
              transform: translateY(-150px);
            }
            100% {
              transform: translateY(-200px);
            }
          }
          
          .subtitle-text {
            font-size: 18px;
          }
        }
      `}</style>

      {/* PixelTrail - Desktop only for performance */}
      {isDesktop && <PixelTrail />}
      
      {/* Back Button - Top Left */}
      <div 
        className="fixed top-6 left-6 z-[999]" 
        style={{ pointerEvents: 'auto' }}
      >
        <button 
          onClick={() => router.push('/')}
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
          <span className="hidden sm:inline">Back to Analyzer</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      {/* ✅ MICROPHONE MODAL - FIXED TO RENDER OUTSIDE ALL CONTAINERS */}
      {isListening && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ 
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 0,
            padding: 0
          }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md mx-4 text-center"
            style={{
              animation: 'modalFadeIn 0.3s ease-out',
              position: 'relative',
              zIndex: 1000000
            }}
          >
            {/* Animated Microphone Icon */}
            <div className="relative mb-6">
              <div 
                className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              >
                <svg 
                  className="w-12 h-12 md:w-16 md:h-16 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              
              {/* Ripple Effect */}
              <div 
                className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 mx-auto bg-red-500 rounded-full opacity-20"
                style={{
                  animation: 'ripple 1.5s ease-out infinite'
                }}
              ></div>
            </div>

            {/* Text */}
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Listening...
            </h3>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Start speaking to describe your document
            </p>

            {/* Waveform Animation */}
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

            {/* Stop Button */}
            <button
              onClick={toggleListening}
              className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              Stop Recording
            </button>

            {/* Tip */}
            <p className="text-xs text-gray-400 mt-4">
              Speak clearly and describe the type of legal document you need
            </p>
          </div>
        </div>
      )}

      {!draft ? (
        <>
          {/* Animated Header */}
          <div className="flip-container-wrapper">
            <div style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1000 }}>
              <RegionSelector onSelect={(jurisdiction) => {
                console.log('Selected jurisdiction:', jurisdiction);
                window.selectedJurisdiction = jurisdiction;
              }} />
            </div>
            <div className="lexi-title">
              LEXI
            </div>
            
            <div className="flip-wrapper">
              <div className="flip-inner">
                <div className="flip-item"><div className="flip-text color-1">Drafting. Done.</div></div>
                <div className="flip-item"><div className="flip-text color-2">Risk. Controlled.</div></div>
                <div className="flip-item"><div className="flip-text color-3">Compliance. Built‑in.</div></div>
                <div className="flip-item"><div className="flip-text color-4">Approvals. Accelerated.</div></div>
                <div className="flip-item"><div className="flip-text color-1">Drafting. Done.</div></div>
              </div>
            </div>
            
            <div className="subtitle-text">
              Faster contracts, full control.
            </div>
          </div>

          {/* Input Box - Bottom - MOBILE RESPONSIVE */}
          <div 
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pb-6 md:pb-8 pt-8 md:pt-12"
            style={{ pointerEvents: 'none', zIndex: 10 }}
          >
            <div 
              className="max-w-3xl mx-auto px-4 md:px-8"
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}
            >
              <div className="relative">
                <div 
                  className={`input-container bg-white rounded-full border-2 border-gray-300 shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center px-4 md:px-6 py-3 md:py-4 gap-2 md:gap-3 ${
                    (isFocused || prompt.trim().length > 0) ? 'active' : ''
                  }`}
                  style={{ 
                    position: 'relative', 
                    zIndex: 100,
                    pointerEvents: 'auto',
                    minHeight: '56px'
                  }}
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
                    className="flex-1 resize-none outline-none text-gray-900 placeholder-gray-400 bg-transparent text-sm md:text-base leading-6 max-h-[200px] overflow-y-auto focus:outline-none focus:ring-0 focus:border-transparent"
                    style={{ 
                      minHeight: '28px',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#d1d5db transparent',
                      paddingTop: '2px'
                    }}
                  />

                  <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <button
                      onClick={toggleListening}
                      disabled={loading || prompt.trim().length > 0}
                      className={`p-2 md:p-2.5 rounded-full transition-all duration-200 ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : prompt.trim().length > 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                      title={isListening ? "Stop listening" : "Start voice input"}
                    >
                      <svg 
                        className="w-5 h-5 md:w-6 md:h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
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
                        prompt.trim() && !loading && !isListening
                          ? 'bg-gray-900 text-white hover:bg-gray-800' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      title="Generate document"
                    >
                      {loading ? (
                        <svg className="w-5 h-5 md:w-6 md:h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg 
                          className="w-5 h-5 md:w-6 md:h-6" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Helper text */}
                <p className="text-center text-xs text-gray-400 mt-2 md:mt-3">
                  Press Enter to generate • Shift + Enter for new line
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="min-h-screen relative bg-gray-50" style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 5 }}>
              
              {/* PDF Preview Section - MOBILE RESPONSIVE */}
              <div className="lg:col-span-3 space-y-3 md:space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Generated Document</h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">{documentTitle}</p>
                  </div>
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
                    }}
                    className="px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                    </svg>
                    New Document
                  </button>
                </div>
                
                {/* PDF Preview with Template - MOBILE RESPONSIVE HEIGHT */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {loadingPreview ? (
                    <div className="flex items-center justify-center h-[400px] md:h-[700px]">
                      <div className="text-center">
                        <svg className="animate-spin h-10 w-10 md:h-12 md:w-12 text-purple-600 mx-auto mb-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <p className="text-gray-600 font-medium text-sm md:text-base">Generating PDF with template...</p>
                        <p className="text-gray-400 text-xs md:text-sm mt-2">Please wait a moment</p>
                      </div>
                    </div>
                  ) : pdfPreviewUrl ? (
                    <iframe
                      src={pdfPreviewUrl}
                      className="w-full h-[400px] md:h-[700px]"
                      title="PDF Preview with Template"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[400px] md:h-[700px]">
                      <div className="text-center px-4">
                        <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <p className="text-gray-500 text-sm md:text-base">Failed to load preview</p>
                        <button
                          onClick={generatePDFPreview}
                          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          Retry Preview
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Document Stats - MOBILE RESPONSIVE */}
                <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm">
                  <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                    <div className="text-center">
                      <p className="text-gray-500">Words</p>
                      <p className="text-lg md:text-xl font-bold text-gray-900">{draft.split(/\s+/).length}</p>
                    </div>
                    <div className="text-center border-l border-r border-gray-200">
                      <p className="text-gray-500">Characters</p>
                      <p className="text-lg md:text-xl font-bold text-gray-900">{draft.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Est. Pages</p>
                      <p className="text-lg md:text-xl font-bold text-gray-900">{Math.ceil(draft.split(/\s+/).length / 250)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Options Sidebar - MOBILE RESPONSIVE */}
              <div className="lg:col-span-1 space-y-3 md:space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm lg:sticky lg:top-24">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Export Options</h3>

                  {/* Download PDF Button - MOBILE RESPONSIVE */}
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF || loadingPreview}
                    className="w-full px-4 py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 mb-3 text-sm md:text-base"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <svg className="animate-spin h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Download PDF
                      </>
                    )}
                  </button>

                  {/* Print Button - MOBILE RESPONSIVE */}
                  <button
                    onClick={handlePrint}
                    disabled={loadingPreview || !pdfPreviewUrl}
                    className="w-full px-4 py-2.5 md:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    Print Document
                  </button>

                  {/* Info Section - MOBILE RESPONSIVE */}
                  <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">Document Info</h4>
                    <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Format:</span>
                        <span className="text-gray-900 font-medium">PDF</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className="text-green-600 font-medium">✓ Ready</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Generated:</span>
                        <span className="text-gray-900 font-medium">{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer - MOBILE RESPONSIVE */}
                  <div className="mt-4 md:mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                    <div className="flex gap-2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      <div>
                        <p className="text-yellow-800 text-xs font-semibold mb-1">Legal Review Required</p>
                        <p className="text-yellow-700 text-xs leading-relaxed">
                          This AI-generated document must be reviewed by a qualified attorney before use.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Features List - MOBILE RESPONSIVE (Hidden on small screens) */}
                  <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 hidden sm:block">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">Included Features</h4>
                    <ul className="space-y-1.5 md:space-y-2 text-xs text-gray-600">
                      <li className="flex items-center gap-2">
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Professional template
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Professional template design
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Multi-page support
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Automatic page numbering
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Footer preservation
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Print-ready format
                      </li>
                    </ul>
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