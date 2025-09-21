"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence, useAnimation } from "framer-motion";
import UploadForm from "../components/UploadForm";
import AnalysisResults from "../components/AnalysisResults";
import { StarsCanvas } from "../components/StarsCanvas";
import Chatbot from "../components/chatbot/ChatBot";
import { setDocumentAnalysis, clearDocumentAnalysis } from '../lib/documentContext';
import { gsap } from 'gsap';

// MagicBento Card Component
const MagicFeatureCard = ({
  feature,
  index,
  enableStars = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  particleCount = 12,
  glowColor = "132, 0, 255"
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef(null);

  const createParticleElement = (x, y, color = glowColor) => {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(${color}, 1);
      box-shadow: 0 0 6px rgba(${color}, 0.6);
      pointer-events: none;
      z-index: 100;
      left: ${x}px;
      top: ${y}px;
    `;
    return el;
  };

  const initializeParticles = () => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  };

  const clearAllParticles = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  };

  const animateParticles = () => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, idx) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        });
      }, idx * 100);

      timeoutsRef.current.push(timeoutId);
    });
  };

  useEffect(() => {
    if (!cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      if (enableStars) animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      if (enableStars) clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = e => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleClick = e => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      if (enableStars) clearAllParticles();
    };
  }, [enableStars, enableTilt, enableMagnetism, clickEffect, glowColor]);

  // Map gradient colors based on feature gradient
  const getGlowColor = () => {
    if (feature.gradient.includes('blue')) return "66, 153, 225";
    if (feature.gradient.includes('purple')) return "159, 122, 234";
    if (feature.gradient.includes('orange')) return "237, 137, 54";
    if (feature.gradient.includes('green')) return "72, 187, 120";
    if (feature.gradient.includes('indigo')) return "102, 126, 234";
    if (feature.gradient.includes('pink')) return "236, 72, 153";
    return "132, 0, 255";
  };

  return (
    <div
      ref={cardRef}
      className="magic-feature-card relative group w-[320px] md:w-[380px] flex-shrink-0"
      style={{ 
        '--glow-color': getGlowColor(),
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Glowing background effect on hover */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-xl`}
      />
      
      {/* Card content */}
      <div className="relative bg-black/50 backdrop-blur-sm border border-gray-800 group-hover:border-gray-600 rounded-xl p-5 h-full transition-all duration-300 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
        </div>
        
        {/* Icon and Title in same line */}
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <motion.span 
            className="text-3xl"
            animate={{ 
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            {feature.icon}
          </motion.span>
          
          <h3 className={`text-xl font-black bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent tracking-tight`}>
            {feature.title}
          </h3>
        </div>
        
        {/* Description - Enhanced */}
        <p className="text-gray-200 text-base leading-relaxed relative z-10 font-medium">
          {feature.description}
        </p>
        
        {/* Border glow effect */}
        <div className="magic-card-border-glow" />
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  
  // Check if user is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      router.push('/auth');
    }
  }, [router]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  const mainContentRef = useRef(null);
  const uploadSectionRef = useRef(null);

  // Smooth scroll animations
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Arc animation controls
  const arcControls = useAnimation();
  const dotControls = useAnimation();
  const titleControls = useAnimation();

  // Intro animation sequence
  useEffect(() => {
    const runIntroAnimation = async () => {
      // Start with arcs animation
      await arcControls.start("animate");

      // Then spin the dot
      await dotControls.start({
        rotate: 720,
        scale: [1, 1.5, 1],
        transition: { duration: 1.5, ease: "easeInOut" }
      });

      // Finally reveal the title
      await titleControls.start({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
      });

      // Mark intro as complete
      setTimeout(() => {
        setIntroComplete(true);
      }, 500);
    };

    runIntroAnimation();
  }, [arcControls, dotControls, titleControls]);

  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const handleDocumentUpload = async (file) => {
    setUploadedFile(file);
    setLoading(true);
    setAnalysisResult(null);
    setUploadProgress(0);
    setAnalyzing(true);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Create FormData and append the file
      const formData = new FormData();
      formData.append('file', file);

      // Call your API endpoint
      const response = await fetch('/api/document-process', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      // Clear the progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (data.success && data.analysis) {
        // Pass the analysis data directly from the API response
        setAnalysisResult(data.analysis);
        
        // Store the analysis in the shared context
        if (data.analysis && data.analysis.metadata) {
          setDocumentAnalysis(data.analysis, data.analysis.metadata.fileName);
        }

        // ADD THIS: Store document info for chatbot
        sessionStorage.setItem('uploadedDocument', JSON.stringify({
          fileName: file.name,
          uploadTime: new Date().toISOString()
        }));
        
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 5000);
      } else {
        // Handle error
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
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  };

  const exportAnalysis = () => {
    // This is a placeholder for export functionality
    console.log("Exporting analysis...");
    // You would implement actual DOCX export here
  };

  return (
    <main className="relative min-h-screen bg-[#030014] text-white overflow-x-hidden">
      <div className="relative z-10">
        {/* Add Stars Background */}
        <StarsCanvas />
      </div>

      {/* Logout Button - Properly Positioned */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4 }}
        onClick={() => {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('username');
          window.location.href = '/auth';
        }}
        className="fixed top-6 right-6 z-[60] px-5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-300 backdrop-blur-sm"
      >
        Logout
      </motion.button>

      {/* ------------------------
          INTRO ANIMATION OVERLAY
      ------------------------- */}
      <AnimatePresence>
        {!introComplete && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: '#030014' }}
          >
            {/* SVG Container for Arcs */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Define filters for glow effects */}
              <defs>
                <filter id="yellowGlow">
                  <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="blueGlow">
                  <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="greenGlow">
                  <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Arcs Group - centered at dot position */}
              <g transform="translate(18, 50)">
                {/* Yellow Arc (innermost) */}
                <motion.path
                  d="M 0,-12 A 12,12 0 0,1 10.39,6"
                  fill="none"
                  stroke="#F4B400"
                  strokeWidth="0.35"
                  strokeLinecap="round"
                  filter="url(#yellowGlow)"
                  initial={{ 
                    pathLength: 0, 
                    opacity: 0,
                    scale: 0.86
                  }}
                  animate={{
                    pathLength: [0, 1],
                    opacity: [0, 1, 1, 0],
                    scale: [0.86, 1.05, 1.05, 1.06],
                    x: [0, 0, 0, 22],
                  }}
                  transition={{
                    pathLength: { 
                      duration: 1.9, 
                      delay: 0.06,
                      ease: [0.22, 1, 0.36, 1]
                    },
                    opacity: {
                      times: [0, 0.1, 0.85, 1],
                      duration: 2.5,
                      delay: 0.06
                    },
                    scale: {
                      times: [0, 0.5, 0.85, 1],
                      duration: 2.5,
                      delay: 0.06
                    },
                    x: {
                      times: [0, 0, 0.85, 1],
                      duration: 2.5,
                      delay: 0.06
                    }
                  }}
                />

                {/* Black Arc */}
                <motion.path
                  d="M 0,-18 A 18,18 0 0,1 15.59,9"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="0.45"
                  strokeLinecap="round"
                  opacity="0.8"
                  initial={{ 
                    pathLength: 0, 
                    opacity: 0,
                    scale: 0.86
                  }}
                  animate={{
                    pathLength: [0, 1],
                    opacity: [0, 0.8, 0.8, 0],
                    scale: [0.86, 1.05, 1.05, 1.06],
                    x: [0, 0, 0, 22],
                  }}
                  transition={{
                    pathLength: { 
                      duration: 1.9, 
                      delay: 0.18,
                      ease: [0.22, 1, 0.36, 1]
                    },
                    opacity: {
                      times: [0, 0.1, 0.85, 1],
                      duration: 2.5,
                      delay: 0.18
                    },
                    scale: {
                      times: [0, 0.5, 0.85, 1],
                      duration: 2.5,
                      delay: 0.18
                    },
                    x: {
                      times: [0, 0, 0.85, 1],
                      duration: 2.5,
                      delay: 0.18
                    }
                  }}
                />

                {/* Blue Arc */}
                <motion.path
                  d="M 0,-24 A 24,24 0 0,1 20.78,12"
                  fill="none"
                  stroke="#4285F4"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  filter="url(#blueGlow)"
                  initial={{ 
                    pathLength: 0, 
                    opacity: 0,
                    scale: 0.86
                  }}
                  animate={{
                    pathLength: [0, 1],
                    opacity: [0, 1, 1, 0],
                    scale: [0.86, 1.05, 1.05, 1.06],
                    x: [0, 0, 0, 22],
                  }}
                  transition={{
                    pathLength: { 
                      duration: 1.85, 
                      delay: 0.34,
                      ease: [0.22, 1, 0.36, 1]
                    },
                    opacity: {
                      times: [0, 0.1, 0.85, 1],
                      duration: 2.5,
                      delay: 0.34
                    },
                    scale: {
                      times: [0, 0.5, 0.85, 1],
                      duration: 2.5,
                      delay: 0.34
                    },
                    x: {
                      times: [0, 0, 0.85, 1],
                      duration: 2.5,
                      delay: 0.34
                    }
                  }}
                />

                {/* Gray Arc */}
                <motion.path
                  d="M 0,-30 A 30,30 0 0,1 25.98,15"
                  fill="none"
                  stroke="#707070"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  initial={{ 
                    pathLength: 0, 
                    opacity: 0,
                    scale: 0.86
                  }}
                  animate={{
                    pathLength: [0, 1],
                    opacity: [0, 1, 1, 0],
                    scale: [0.86, 1.05, 1.05, 1.06],
                    x: [0, 0, 0, 22],
                  }}
                  transition={{
                    pathLength: { 
                      duration: 1.8, 
                      delay: 0.48,
                      ease: [0.22, 1, 0.36, 1]
                    },
                    opacity: {
                      times: [0, 0.1, 0.85, 1],
                      duration: 2.5,
                      delay: 0.48
                    },
                    scale: {
                      times: [0, 0.5, 0.85, 1],
                      duration: 2.5,
                      delay: 0.48
                    },
                    x: {
                      times: [0, 0, 0.85, 1],
                      duration: 2.5,
                      delay: 0.48
                    }
                  }}
                />

                {/* Green Arc (outermost) */}
                <motion.path
                  d="M 0,-36 A 36,36 0 0,1 31.18,18"
                  fill="none"
                  stroke="#34A853"
                  strokeWidth="1.0"
                  strokeLinecap="round"
                  filter="url(#greenGlow)"
                  initial={{ 
                    pathLength: 0, 
                    opacity: 0,
                    scale: 0.86
                  }}
                  animate={{
                    pathLength: [0, 1],
                    opacity: [0, 1, 1, 0],
                    scale: [0.86, 1.05, 1.05, 1.06],
                    x: [0, 0, 0, 22],
                  }}
                  transition={{
                    pathLength: { 
                      duration: 1.75, 
                      delay: 0.62,
                      ease: [0.22, 1, 0.36, 1]
                    },
                    opacity: {
                      times: [0, 0.1, 0.85, 1],
                      duration: 2.5,
                      delay: 0.62
                    },
                    scale: {
                      times: [0, 0.5, 0.85, 1],
                      duration: 2.5,
                      delay: 0.62
                    },
                    x: {
                      times: [0, 0, 0.85, 1],
                      duration: 2.5,
                      delay: 0.62
                    }
                  }}
                />
              </g>
            </svg>

            {/* Black Dot */}
            <motion.div
              className="absolute"
              style={{ left: '18vw', top: '50vh', transform: 'translate(-50%, -50%)' }}
              initial={{ scale: 0.9 }}
              animate={{
                scale: [0.9, 0.9, 0.96, 1.08, 1.0],
                rotate: [0, 0, 0, 360, 360],
              }}
              transition={{
                scale: {
                  times: [0, 0.72, 0.75, 0.85, 1],
                  duration: 3.5,
                  ease: "easeInOut"
                },
                rotate: {
                  times: [0, 0.72, 0.75, 0.9, 1],
                  duration: 3.5,
                  ease: "easeInOut"
                }
              }}
            >
              <div 
                className="w-2 h-2 bg-black rounded-full"
                style={{ 
                  boxShadow: '0 0 12px rgba(0,0,0,0.12)',
                  width: 'calc(0.5vw + 4px)',
                  height: 'calc(0.5vw + 4px)',
                }}
              />
            </motion.div>

            {/* Title Reveal - delayed until animation completes */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0 
              }}
              transition={{
                delay: 3.5,
                duration: 0.5,
                ease: "easeOut"
              }}
              className="relative z-10 text-center"
            >
              <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-indigo-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Lexi - A Legal Guardian
              </h1>
              <p className="mt-4 text-xl text-gray-400">
                AI-Powered Contract Intelligence
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------
          MAIN CONTENT
      ------------------------- */}
      <div ref={mainContentRef} className={`transition-opacity duration-500 ${introComplete ? 'opacity-100' : 'opacity-0'}`}>

        {/* Hero Section */}
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative w-full min-h-[60vh] flex flex-col items-center justify-center px-6 pt-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-indigo-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-6">
              Lexi - A Legal Guardian
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Upload your contract and let our AI analyze every clause,
              <span className="text-pink-400 font-semibold"> protecting your interests</span> with intelligent insights
            </p>
            
          </motion.div>
        </motion.section>

        {/* ------------------------
            UPLOAD SECTION WITH VIDEO BACKGROUND
        ------------------------- */}
        <section ref={uploadSectionRef} className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
          {/* Video Background with blend */}
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/media/encryption-bg.webm" type="video/webm" />
            </video>
            {/* Gradient overlays to blend with #030014 */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-[#030014]/50" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#030014] via-transparent to-[#030014]/50" />
          </div>

          {/* Upload Form - Transparent overlay */}
          <div className="relative z-10">
            <UploadForm 
              onDocumentUpload={handleDocumentUpload}
              loading={loading}
              uploadProgress={uploadProgress}
              analyzing={analyzing}
            />
          </div>
        </section>

        {/* Success Notification - Enhanced Slide Animation */}
        <AnimatePresence>
          {showSuccessNotification && (
            <motion.div
              initial={{ x: "-100vw" }}
              animate={{ x: 0 }}
              exit={{ x: "100vw" }}
              transition={{ 
                type: "spring", 
                stiffness: 100,
                damping: 20,
                duration: 0.8 
              }}
              className="fixed top-20 left-0 right-0 z-50"
            >
              <div className="max-w-fit mx-auto">
                <motion.div
                  className="relative bg-[#030014]/90 backdrop-blur-xl border border-purple-500/50 rounded-full px-10 py-5 shadow-2xl overflow-hidden"
                  animate={{
                    boxShadow: [
                      "0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.3)",
                      "0 0 40px rgba(236,72,153,0.5), 0 0 80px rgba(236,72,153,0.3)",
                      "0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(168,85,247,0.3)"
                    ],
                    borderColor: ["rgba(99,102,241,0.5)", "rgba(236,72,153,0.5)", "rgba(168,85,247,0.5)"]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    animate={{
                      background: [
                        "linear-gradient(45deg, transparent, rgba(99,102,241,0.3), transparent)",
                        "linear-gradient(45deg, transparent, rgba(236,72,153,0.3), transparent)",
                        "linear-gradient(45deg, transparent, rgba(168,85,247,0.3), transparent)"
                      ],
                      x: ["-100%", "100%"]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  {/* Sparkle particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${10 + i * 15}%`,
                        top: "50%",
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity
                      }}
                    />
                  ))}
                  
                  {/* Progress line */}
                  <motion.div
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-indigo-400 via-pink-500 to-purple-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 5 }}
                    style={{ transformOrigin: "left" }}
                  />
                  
                  <div className="relative flex items-center gap-4">
                    {/* Multiple animated icons */}
                    <div className="flex items-center -space-x-2">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="text-2xl"
                      >
                        ✨
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="text-2xl"
                      >
                        🎯
                      </motion.div>
                    </div>
                    
                    {/* Text content */}
                    <div className="flex items-center gap-4">
                      <motion.span 
                        className="text-white font-bold text-lg bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
                        animate={{
                          backgroundPosition: ["0%", "100%", "0%"]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ backgroundSize: "200%" }}
                      >
                        Analysis Complete!
                      </motion.span>
                      
                      {/* Animated separator */}
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 h-1 rounded-full bg-purple-400"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                              duration: 1.5,
                              delay: i * 0.2,
                              repeat: Infinity
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Clickable scroll button */}
                      <motion.button
                        onClick={() => {
                          const resultsSection = document.querySelector('[data-results-section]');
                          if (resultsSection) {
                            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                          setShowSuccessNotification(false);
                        }}
                        className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors cursor-pointer group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="font-medium">View Results</span>
                        <motion.svg 
                          className="w-4 h-4"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          animate={{ y: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </motion.svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------------------------
            ANALYSIS RESULTS SECTION
        ------------------------- */}
        {analysisResult && !loading && (
          <AnalysisResults 
            analysisResult={analysisResult}
            onExportAnalysis={exportAnalysis}
            onAnalyzeAnother={() => {
              setAnalysisResult(null);
              setUploadedFile(null);
              
              // Clear the shared document context
              clearDocumentAnalysis();
              
              window.scrollTo({ top: uploadSectionRef.current.offsetTop - 100, behavior: 'smooth' });
            }}
            uploadSectionRef={uploadSectionRef}
          />
        )}

        {/* ------------------------
            FEATURES SECTION WITH MAGIC BENTO EFFECTS
        ------------------------- */}
        <section className="relative w-full py-20 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto px-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Why Lexi?
            </h2>
          </motion.div>
          
          {/* Moving Features Carousel with Magic Effects */}
          <div className="relative">
            {/* Gradient Overlays for fade effect */}
            <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-[#030014] to-transparent z-10" />
            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#030014] to-transparent z-10" />
            
            {/* Moving Container */}
            <div className="flex gap-4 animate-scroll-features">
              {/* First set of features */}
              {[
                {
                  icon: "🛡️",
                  title: "Complete Protection",
                  description: "Our AI identifies potentially harmful clauses and one-sided terms that could put you at risk.",
                  gradient: "from-blue-600 to-cyan-600"
                },
                {
                  icon: "⚡",
                  title: "Lightning Fast",
                  description: "Get comprehensive contract analysis in seconds, not hours. Save time and legal fees.",
                  gradient: "from-purple-600 to-pink-600"
                },
                {
                  icon: "🎯",
                  title: "Crystal Clear",
                  description: "Complex legal jargon translated into plain English you can actually understand.",
                  gradient: "from-orange-600 to-red-600"
                },
                {
                  icon: "🔒",
                  title: "Bank-Level Security",
                  description: "Your documents are encrypted end-to-end and automatically deleted after analysis.",
                  gradient: "from-green-600 to-emerald-600"
                },
                {
                  icon: "💡",
                  title: "Smart Recommendations",
                  description: "Get actionable suggestions on how to negotiate better terms and protect your interests.",
                  gradient: "from-indigo-600 to-purple-600"
                },
                {
                  icon: "🤝",
                  title: "Negotiation Ready",
                  description: "Armed with insights, you'll be prepared to negotiate from a position of strength.",
                  gradient: "from-pink-600 to-rose-600"
                }
              ].concat([
                // Duplicate the features for seamless loop
                {
                  icon: "🛡️",
                  title: "Complete Protection",
                  description: "Our AI identifies potentially harmful clauses and one-sided terms that could put you at risk.",
                  gradient: "from-blue-600 to-cyan-600"
                },
                {
                  icon: "⚡",
                  title: "Lightning Fast",
                  description: "Get comprehensive contract analysis in seconds, not hours. Save time and legal fees.",
                  gradient: "from-purple-600 to-pink-600"
                },
                {
                  icon: "🎯",
                  title: "Crystal Clear",
                  description: "Complex legal jargon translated into plain English you can actually understand.",
                  gradient: "from-orange-600 to-red-600"
                },
                {
                  icon: "🔒",
                  title: "Bank-Level Security",
                  description: "Your documents are encrypted end-to-end and automatically deleted after analysis.",
                  gradient: "from-green-600 to-emerald-600"
                },
                {
                  icon: "💡",
                  title: "Smart Recommendations",
                  description: "Get actionable suggestions on how to negotiate better terms and protect your interests.",
                  gradient: "from-indigo-600 to-purple-600"
                },
                {
                  icon: "🤝",
                  title: "Negotiation Ready",
                  description: "Armed with insights, you'll be prepared to negotiate from a position of strength.",
                  gradient: "from-pink-600 to-rose-600"
                }
              ]).map((feature, index) => (
                <MagicFeatureCard
                  key={index}
                  feature={feature}
                  index={index}
                  enableStars={true}
                  enableTilt={true}
                  enableMagnetism={true}
                  clickEffect={true}
                  particleCount={12}
                />
              ))}
            </div>
          </div>
          
          {/* Add CSS for the scrolling animation */}
          <style jsx>{`
            @keyframes scroll-features {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            
            .animate-scroll-features {
              animation: scroll-features 35s linear infinite;
              display: flex;
              width: max-content;
            }
            
            .animate-scroll-features:hover {
              animation-play-state: paused;
            }

            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.3);
              border-radius: 4px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(168, 85, 247, 0.5);
              border-radius: 4px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(168, 85, 247, 0.7);
            }

            .glow-text {
              text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
            }
          `}</style>
        </section>

        {/* ------------------------
            CTA SECTION
        ------------------------- */}
        <section className="relative w-full py-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Ready to Protect Your Interests?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands who've avoided costly contract mistakes with AI-powered analysis
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: uploadSectionRef.current.offsetTop - 100, behavior: 'smooth' })}
              className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-xl text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            >
              Start Free Analysis
            </motion.button>

            <p className="mt-6 text-sm text-gray-500">
              No credit card required • Your documents are never stored
            </p>
          </motion.div>
        </section>

        {/* ------------------------
            FOOTER
        ------------------------- */}
        <footer className="w-full py-12 px-6 border-t border-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">
                  Lexi - A Legal Guardian
                </h3>
                <p className="text-gray-400 text-sm">
                  AI-powered legal document analysis that empowers you to understand complex contracts and agreements. Built with Google Cloud's Generative AI.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition">How It Works</a></li>
                  <li><a href="#" className="hover:text-white transition">Document Types</a></li>
                  <li><a href="#" className="hover:text-white transition">FAQs</a></li>
                  <li><a href="#" className="hover:text-white transition">User Guide</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms of Use</a></li>
                  <li><a href="#" className="hover:text-white transition">Data Security</a></li>
                  <li><a href="#" className="hover:text-white transition">Disclaimer</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} Lexi. All rights reserved.
              <p className="text-gray-600 text-xs mt-2">
                This tool provides AI-generated insights for educational purposes only and does not constitute legal advice.
              </p>
            </div>
          </div>
        </footer>
      </div>
      <Chatbot />
    </main>
  );
}