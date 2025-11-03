"use client";

import { useState, useEffect, useRef, useMemo, useCallback, memo, lazy, Suspense } from "react";
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { saveAnalysisToFirebase } from '../../lib/saveAnalysis';
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import UploadForm from "../../components/UploadForm";
import AnalysisResults from "../../components/AnalysisResults";
import { setDocumentAnalysis, clearDocumentAnalysis } from '../../lib/documentContext';
import { useAnalysis } from '../../context/AnalysisContext';
import HeroText from '../../components/ui/HeroText';
import SideNav from '../../components/sidenav/SideNav';
import { FaShieldAlt, FaBolt, FaBullseye, FaLock, FaLightbulb, FaHandshake } from 'react-icons/fa';

// ✅ Lazy load ALL heavy components
const Chatbot = dynamic(() => import('../../components/chatbot/ChatBot'), {
  ssr: false,
  loading: () => null
});

const Aurora = dynamic(() => import('../../components/ui/Aurora'), {
  ssr: false,
  loading: () => null
});

const Plasma = dynamic(() => import('../../components/ui/Plasma'), {
  ssr: false,
  loading: () => null
});

// ✅ OPTIMIZED: Simplified feature card with GPU acceleration
const MagicFeatureCard = memo(({ feature, index }) => {
  return (
    <div 
      className="w-[280px] sm:w-[320px] md:w-[360px] lg:w-[380px] flex-shrink-0"
      style={{ willChange: 'transform' }}
    >
      <div className="bg-black/50 backdrop-blur-sm border border-gray-800 hover:border-gray-600 rounded-xl p-4 sm:p-5 h-full transition-colors duration-300">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <span className="text-2xl sm:text-3xl">{feature.icon}</span>
          <h3 className={`text-lg sm:text-xl font-black bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent tracking-tight`}>
            {feature.title}
          </h3>
        </div>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed font-medium">
          {feature.description}
        </p>
      </div>
    </div>
  );
});

MagicFeatureCard.displayName = 'MagicFeatureCard';

// ✅ OPTIMIZED: Simplified success notification
const SuccessNotification = memo(({ onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!mounted) return null;

  const notificationContent = (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        pointerEvents: 'none',
        willChange: 'transform, opacity'
      }}
    >
      <div className="max-w-fit mx-auto" style={{ pointerEvents: 'auto' }}>
        <div className="relative bg-black/95 backdrop-blur-xl border-2 border-purple-500/70 rounded-2xl px-6 py-4 shadow-2xl">
          <div className="relative flex items-center gap-4">
            <div className="flex items-center -space-x-2">
              <span className="text-2xl">✨</span>
              <span className="text-2xl">🎯</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-white font-bold text-base">
                Analysis Complete!
              </span>
              
              <button
                onClick={() => {
                  const resultsSection = document.querySelector('[data-results-section]');
                  if (resultsSection) {
                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                  onClose();
                }}
                className="text-purple-300 hover:text-purple-200 transition-colors text-sm font-medium"
              >
                View Results ↓
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return createPortal(notificationContent, document.body);
});

SuccessNotification.displayName = 'SuccessNotification';

export default function Home() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const { saveAnalysis, clearAnalysis } = useAnalysis();
  
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const mainContentRef = useRef(null);
  const uploadSectionRef = useRef(null);
  const whyLexiSectionRef = useRef(null);
  const heroRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // ✅ Memoize feature data
  const featureData = useMemo(() => [
    {
      icon: <FaShieldAlt className="text-blue-400" />,
      title: "Complete Protection",
      description: "Our AI identifies potentially harmful clauses and one-sided terms that could put you at risk.",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      icon: <FaBolt className="text-purple-400" />,
      title: "Lightning Fast",
      description: "Get comprehensive contract analysis in seconds, not hours. Save time and legal fees.",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      icon: <FaBullseye className="text-orange-400" />,
      title: "Crystal Clear",
      description: "Complex legal jargon translated into plain English you can actually understand.",
      gradient: "from-orange-600 to-red-600"
    },
    {
      icon: <FaLock className="text-green-400" />,
      title: "Bank-Level Security",
      description: "Your documents are encrypted end-to-end and securely stored in your private dashboard.",
      gradient: "from-green-600 to-emerald-600"
    },
    {
      icon: <FaLightbulb className="text-yellow-400" />,
      title: "Smart Recommendations",
      description: "Get actionable suggestions on how to negotiate better terms and protect your interests.",
      gradient: "from-indigo-600 to-purple-600"
    },
    {
      icon: <FaHandshake className="text-pink-400" />,
      title: "Negotiation Ready",
      description: "Armed with insights, you'll be prepared to negotiate from a position of strength.",
      gradient: "from-pink-600 to-rose-600"
    }
  ], []);

  // ✅ OPTIMIZED: Document upload handler
  const handleDocumentUpload = useCallback(async (file) => {
    setUploadedFile(file);
    setLoading(true);
    setAnalysisResult(null);
    setUploadProgress(0);
    setAnalyzing(true);
    
    clearAnalysis();
    
    sessionStorage.removeItem('voiceSummaryUrl');
    sessionStorage.removeItem('voiceSummaryMetadata');

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/document-process', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setUploadProgress(100);

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (data.success && data.analysis) {
        setAnalysisResult(data);
        
        if (data.analysis && data.analysis.metadata) {
          setDocumentAnalysis(data.analysis, data.analysis.metadata.fileName);
          
          saveAnalysis({
            documentName: data.analysis.metadata?.fileName || file.name,
            analysisResults: data.analysis,
            riskScore: data.analysis.overallRiskScore,
            summary: data.analysis.executiveSummary || data.analysis.summary,
            voiceSummaryUrl: data.analysis.voiceSummaryUrl || null,
            chatHistory: [],
            actionItems: data.analysis.actionItems,
            obligations: data.analysis.obligations,
            clauses: data.analysis.flaggedClauses,
            risks: data.analysis.riskCategories,
            positives: data.analysis.positiveProvisions,
            userId: localStorage.getItem('username') || 'anonymous',
            userEmail: localStorage.getItem('userEmail') || null
          });

          const currentUser = auth.currentUser;
          if (currentUser) {
            await saveAnalysisToFirebase(
              data.analysis,
              currentUser.uid,
              currentUser.email
            );
          }
        }

        sessionStorage.setItem('uploadedDocument', JSON.stringify({
          fileName: file.name,
          uploadTime: new Date().toISOString()
        }));
        
        setShowSuccessNotification(true);
      } else {
        console.error('Analysis failed:', data.error);
        alert(data.error || 'Analysis failed. Please try again.');
        setAnalysisResult(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document. Please try again.');
      setAnalysisResult(null);
    } finally {
      setLoading(false);
      setAnalyzing(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setUploadProgress(0);
    }
  }, [clearAnalysis, saveAnalysis]);

  const exportAnalysis = useCallback(() => {
    console.log("Exporting analysis...");
  }, []);

  // ✅ Simplified auth check
  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!mounted) return;
      
      if (user && user.emailVerified) {
        setAuthChecked(true);
      } else {
        router.replace('/auth');
      }
    });
    
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [router]);

  // ✅ OPTIMIZED: Debounced mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 250);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // ✅ OPTIMIZED: Restore analysis (runs once)
  useEffect(() => {
    const returning = sessionStorage.getItem('returning_from_detail');
    if (returning === 'true') {
      sessionStorage.removeItem('returning_from_detail');
      
      const storedAnalysis = sessionStorage.getItem('current_document_analysis');
      if (storedAnalysis) {
        try {
          const parsedAnalysis = JSON.parse(storedAnalysis);
          setAnalysisResult({ analysis: parsedAnalysis, success: true });
          
          setTimeout(() => {
            const resultsSection = document.querySelector('[data-results-section]');
            if (resultsSection) {
              resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        } catch (error) {
          console.error('Error restoring analysis:', error);
        }
      }
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  if (!authChecked) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <img src="/logo.png" alt="Lexi Logo" className="w-full h-full object-contain animate-pulse" />
          </div>
          <div className="text-white text-lg font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SideNav />
      
      <AnimatePresence mode="wait">
        {showSuccessNotification && (
          <SuccessNotification onClose={() => setShowSuccessNotification(false)} />
        )}
      </AnimatePresence>

      <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
        
        {/* ✅ CSS for scrolling animation */}
        <style jsx global>{`
          @keyframes scroll-features {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .animate-scroll-features {
            animation: scroll-features 30s linear infinite;
            display: flex;
            width: max-content;
          }

          .animate-scroll-features:hover {
            animation-play-state: paused;
          }

          /* Disable on mobile/tablet for manual scroll */
          @media (max-width: 1024px) {
            .animate-scroll-features {
              animation: none;
              width: auto;
            }
          }
        `}</style>

        {/* ✅ OPTIMIZED: Aurora only on desktop, with GPU hint */}
        {!isMobile && (
          <div 
            className="fixed top-0 left-0 right-0 pointer-events-none"
            style={{ 
              height: '300px',
              zIndex: 1,
              clipPath: 'inset(0 0 0 0)',
              willChange: 'transform'
            }}
          >
            <Suspense fallback={null}>
              <Aurora
                colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
                blend={0.5}
                amplitude={1.2}
                speed={0.3}
              />
            </Suspense>
          </div>
        )}

        <div ref={mainContentRef} className="relative z-10">
          
          {/* Hero Section */}
          <section ref={heroRef} className="relative w-full min-h-[45vh] sm:min-h-[50vh] md:min-h-[60vh] flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 pt-16 sm:pt-18 md:pt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-7xl mx-auto w-full"
            >
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-3 md:mb-4 px-2"
                style={{ 
                  paddingBottom: '0.5rem',
                  lineHeight: '1.3',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '0.2em'
                }}
              >
                <span 
                  className="bg-gradient-to-r from-indigo-400 via-pink-500 to-purple-500 bg-clip-text text-transparent"
                  style={{ 
                    flexShrink: 0,
                    fontSize: 'clamp(1em, 1.3em, 1.5em)',
                    paddingBottom: '0.1em'
                  }}
                >
                  Lexi -
                </span>
                <HeroText />
              </h1>

              <p 
                className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300 mb-6 md:mb-8 px-4 sm:px-6"
                style={{
                  paddingBottom: '0.3em',
                  lineHeight: '1.6',
                  marginTop: '-0.5rem',
                  maxWidth: '900px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
              >
                Upload your contract and let our AI analyze every clause,
                <br className="hidden sm:block" />
                <span className="text-pink-400 font-semibold"> protecting your interests</span> with intelligent insights
              </p>
            </motion.div>
            
            <div 
              className="absolute inset-x-0 bottom-0 h-24 sm:h-32 md:h-48 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 50%, black 100%)',
                zIndex: 5
              }}
            />
          </section>

          {/* ✅ OPTIMIZED: Video section with reduced overlays */}
          <section 
            ref={uploadSectionRef} 
            className="relative w-full min-h-[70vh] sm:min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6"
            style={{ backgroundColor: 'black' }}
          >
            {!isMobile && (
              <div className="absolute inset-0">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ 
                    opacity: 0.7,
                    willChange: 'transform'
                  }}
                  loading="lazy"
                >
                  <source src="/media/encryption-bg.webm" type="video/webm" />
                </video>
                
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            )}

            {isMobile && (
              <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
            )}

            <div className="relative z-10 w-full max-w-4xl mx-auto">
              <UploadForm 
                onDocumentUpload={handleDocumentUpload}
                loading={loading}
                uploadProgress={uploadProgress}
                analyzing={analyzing}
                analysisData={analysisResult}
              />
            </div>
          </section>

          {analysisResult && !loading && (
            <div className="relative bg-black">
              <div className="absolute inset-0 bg-black" style={{ zIndex: 0 }} />
              
              <div className="relative" style={{ zIndex: 1 }}>
                <AnalysisResults 
                  analysisResult={analysisResult.analysis}
                  onExportAnalysis={exportAnalysis}
                  onAnalyzeAnother={() => {
                    setAnalysisResult(null);
                    setUploadedFile(null);
                    clearDocumentAnalysis();
                    window.scrollTo({ top: uploadSectionRef.current.offsetTop - 100, behavior: 'smooth' });
                  }}
                  uploadSectionRef={uploadSectionRef}
                />
              </div>
            </div>
          )}

          {/* PLASMA SECTION */}
          <div ref={whyLexiSectionRef} className="relative -mt-0">
            
            {/* ✅ OPTIMIZED: Plasma with reduced effects */}
            {!isMobile && (
              <div 
                className="absolute pointer-events-none" 
                style={{ 
                  zIndex: 1,
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '100%',
                  width: '100%',
                  willChange: 'transform'
                }}
              >
                <Suspense fallback={null}>
                  <Plasma
                    color="#8B5CF6"
                    speed={0.2}
                    direction="forward"
                    scale={1.2}
                    opacity={0.3}
                    mouseInteractive={false}
                  />
                </Suspense>
              </div>
            )}

            <div 
              className="absolute inset-x-0 top-0 h-20 sm:h-24 md:h-32 pointer-events-none" 
              style={{ 
                background: 'linear-gradient(to bottom, black 0%, transparent 100%)', 
                zIndex: 5 
              }} 
            />

            {/* Features Section - ✅ SCROLLING ANIMATION RESTORED */}
            <section className="relative w-full pt-12 sm:pt-16 md:pt-24 pb-10 sm:pb-12 md:pb-20 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 relative z-10"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16">
                  <span 
                    style={{
                      background: 'linear-gradient(to right, rgb(96, 165, 250), rgb(168, 85, 247))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      display: 'inline-block',
                      paddingBottom: '0.2em',
                      lineHeight: '1.4'
                    }}
                  >
                    Why Lexi?
                  </span>
                </h2>
              </motion.div>
              
              <div className="relative z-10">
                <div className="absolute left-0 top-0 w-12 sm:w-16 md:w-32 h-full bg-gradient-to-r from-black to-transparent z-10" />
                <div className="absolute right-0 top-0 w-12 sm:w-16 md:w-32 h-full bg-gradient-to-l from-black to-transparent z-10" />
                
                {/* ✅ RESTORED: Infinite scroll animation */}
                <div className="flex gap-3 md:gap-4 animate-scroll-features px-4 overflow-x-auto scrollbar-hide touch-pan-x">
                  {featureData.concat(featureData).map((feature, index) => (
                    <MagicFeatureCard
                      key={`feature-${index}-${feature.title}`}
                      feature={feature}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="relative w-full py-10 sm:py-12 md:py-20 px-4 sm:px-6 md:px-8">
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <div className="backdrop-blur-sm bg-black/20 rounded-xl sm:rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent px-2" 
                    style={{ lineHeight: '1.3' }}>
                    Ready to Protect Your Interests?
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 md:mb-10 px-2 sm:px-4">
                    Join thousands who've avoided costly contract mistakes with AI-powered analysis
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-4 sm:mb-6">
                    <button
                      onClick={() => {
                        const section = uploadSectionRef.current;
                        if (section) {
                          const top = section.offsetTop - 100;
                          window.scrollTo({ 
                            top: top, 
                            behavior: 'smooth' 
                          });
                        }
                      }}
                      className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-sm sm:text-base md:text-xl text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Start Free Analysis
                    </button>

                    <button
                      onClick={() => router.push('/drafter')}
                      className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full font-bold text-sm sm:text-base md:text-xl text-white shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Try Document Drafter →
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-400 px-4">
                    No credit card required • Your documents are never stored
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="w-full py-6 sm:py-8 px-4 sm:px-6 md:px-8 border-t border-gray-800/30 relative">
              <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center text-gray-500 text-xs sm:text-sm">
                  © {new Date().getFullYear()} Lexi. All rights reserved.
                  <p className="text-gray-600 text-xs mt-2">
                    This tool provides AI-generated insights for educational purposes only and does not constitute legal advice.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </main>
      
      {/* ✅ Chatbot lazy loaded */}
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </>
  );
}