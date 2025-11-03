"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';

export default function VideoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // ✅ Memoize slides - REPLACED videos with photos
  const slides = useMemo(() => [
    { 
      title: 'Upload Contract', 
      description: 'Upload any legal document in seconds. Supports PDF, DOCX, and more.',
      photoPath: '/images/how-it-works/upload.png', // ✅ Photo instead of video
      icon: (
        <svg className="w-20 h-20 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M7 18C7 18.5304 7.21071 19.0391 7.58579 19.4142C7.96086 19.7893 8.46957 20 9 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V8C20 7.46957 19.7893 6.96086 19.4142 6.58579C19.0391 6.21071 18.5304 6 18 6H16" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 6V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H9C8.46957 2 7.96086 2.21071 7.58579 2.58579C7.21071 2.96086 7 3.46957 7 4V6" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 11V17M9 14L12 17L15 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      title: 'AI Analysis', 
      description: 'Our AI analyzes every clause, term, and condition in your contract.',
      photoPath: '/images/how-it-works/analysis.png',
      icon: (
        <svg className="w-20 h-20 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <path d="M12 6V12L16 14" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
      )
    },
    { 
      title: 'Chatbot Q&A', 
      description: 'Ask questions about your document. Get instant AI-powered answers.',
      photoPath: '/images/how-it-works/chatbot.png',
      icon: (
        <svg className="w-20 h-20 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" strokeWidth="2"/>
          <circle cx="9" cy="10" r="1" fill="currentColor"/>
          <circle cx="15" cy="10" r="1" fill="currentColor"/>
          <path d="M9 13C9 13 10 14 12 14C14 14 15 13 15 13" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      title: 'Audio Playback', 
      description: 'Listen to your contract analysis on the go with AI voice narration.',
      photoPath: '/images/how-it-works/audio.png',
      icon: (
        <svg className="w-20 h-20 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2C10.9 2 10 2.9 10 4V12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12V4C14 2.9 13.1 2 12 2Z" strokeWidth="2"/>
          <path d="M17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 16V20M8 20H16" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      title: 'Document Drafter', 
      description: 'Create professional contracts for any country with AI assistance.',
      photoPath: '/images/how-it-works/drafter.png',
      icon: (
        <svg className="w-20 h-20 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" strokeWidth="2"/>
          <path d="M14 2V8H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 18V12M9 15L12 18L15 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      title: 'Voice Input', 
      description: 'Speak to create contracts. Voice-to-text for effortless drafting.',
      photoPath: '/images/how-it-works/voice.png',
      icon: (
        <svg className="w-20 h-20 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <path d="M8 12H12L14 9L16 15L18 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ], []);

  // Auto-slide every 2 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section ref={ref} className="py-16 px-6 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-16"
          style={{ 
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.03em'
          }}
        >
          See how it works
        </motion.h2>

        {/* ✅ DESKTOP CAROUSEL - WITH PHOTOS */}
        <div 
          className="hidden md:block relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden px-16">
            <motion.div
              animate={{ x: `-${currentSlide * 100}%` }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="flex"
            >
              {slides.map((slide, idx) => (
                <div key={idx} className="w-full flex-shrink-0 px-4">
                  {/* ✅ PHOTO CONTAINER - 16:9 Laptop Size */}
                  <div 
                    className="relative rounded-3xl overflow-hidden group shadow-2xl"
                    style={{
                      width: '100%',
                      maxWidth: '960px',
                      aspectRatio: '16/9',
                      margin: '0 auto',
                      backgroundColor: '#1a1a1a'
                    }}
                  >
                    {/* ✅ PHOTO */}
                    <Image
                      src={slide.photoPath}
                      alt={slide.title}
                      fill
                      className="object-cover transition-all duration-500 group-hover:scale-105"
                      priority={idx === 0 || idx === 1}
                    />

                    {/* ✅ Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* ✅ Text Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                      <div className="mb-6 opacity-90 transition-all duration-500 group-hover:scale-110">
                        {slide.icon}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {slide.title}
                      </h3>
                      <p className="text-white/80 max-w-md text-lg">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === idx ? 'w-12 h-3 bg-white' : 'w-3 h-3 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ✅ MOBILE CAROUSEL - WITH PHOTOS */}
        <div 
          className="md:hidden"
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="overflow-hidden -mx-6">
            <motion.div
              animate={{ x: `-${currentSlide * 100}%` }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="flex"
            >
              {slides.map((slide, idx) => (
                <div key={idx} className="w-full flex-shrink-0 px-6">
                  {/* ✅ MOBILE PHOTO CONTAINER */}
                  <div 
                    className="relative rounded-3xl overflow-hidden shadow-2xl"
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      backgroundColor: '#1a1a1a'
                    }}
                  >
                    {/* ✅ PHOTO */}
                    <Image
                      src={slide.photoPath}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority={idx === 0}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Text Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                      <div className="mb-4 opacity-90">
                        {slide.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {slide.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Mobile Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button onClick={prevSlide} className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === idx ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/30'
                  }`}
                />
              ))}
            </div>

            <button onClick={nextSlide} className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}