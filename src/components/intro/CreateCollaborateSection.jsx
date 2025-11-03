"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';

export default function CreateCollaborateSection() {
  const [activeItem, setActiveItem] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const items = [
    {
      icon: (
        <svg className="w-10 h-10 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" opacity="0.3"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'AI',
      description: 'Advanced AI analyzes your contracts in seconds. Upload any legal document and receive comprehensive insights powered by cutting-edge machine learning algorithms.',
      photoPath: '/images/ai-analysis.png' // ✅ Replace with your photo path
    },
    {
      icon: (
        <svg className="w-10 h-10 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" opacity="0.3"/>
          <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Analyze',
      description: 'Upload any legal document and receive instant AI-powered analysis. Our intelligent system breaks down complex clauses, identifies key terms, and highlights potential risks.',
      photoPath: '/images/analyze-dashboard.png' // ✅ Replace with your photo path
    },
    {
      icon: (
        <svg className="w-10 h-10 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" opacity="0.3"/>
          <path d="M12 8V12L15 15" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      ),
      title: 'Understand',
      description: 'Complex legal jargon translated into plain English. Get clear explanations of contract terms, obligations, and potential implications in language everyone can understand.',
      photoPath: '/images/understand-view.png' // ✅ Replace with your photo path
    },
    {
      icon: (
        <svg className="w-10 h-10 text-cyan-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" opacity="0.3"/>
          <path d="M12 8V12" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="12" cy="16" r="1" fill="white"/>
        </svg>
      ),
      title: 'Protect',
      description: 'Identify one-sided clauses and hidden risks before you sign. Our AI highlights potentially harmful terms, suggests negotiation points, and helps protect your interests.',
      photoPath: '/images/protect-system.png' // ✅ Replace with your photo path
    }
  ];

  // ✅ SCROLL DETECTION - Using IntersectionObserver
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index'));
          if (!isNaN(index)) {
            setActiveItem(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    const photoElements = document.querySelectorAll('.photo-item');
    photoElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle title clicks
  const handleTitleClick = (index) => {
    const photoItem = document.querySelector(`#photo-item-${index}`);
    if (photoItem) {
      const yOffset = window.innerHeight / 2 - 270;
      const y = photoItem.getBoundingClientRect().top + window.pageYOffset - yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section id="how-it-works" ref={sectionRef} className="py-8 px-6">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-20"
          style={{ 
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.03em'
          }}
        >
          Analyze, <span className="text-sky-400">understand</span>, and protect
        </motion.h2>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-[30%_70%] gap-10 min-h-[600px]">
          
          {/* LEFT SIDE - STICKY */}
          <div className="sticky top-32 h-fit py-12">
            {items.map((item, idx) => {
              const isActive = activeItem === idx;
              
              return (
                <div 
                  key={idx} 
                  className="cursor-pointer mb-6" 
                  onClick={() => handleTitleClick(idx)}
                >
                  {/* Icon + Title */}
                  <div 
                    className={`flex items-center gap-3 mb-3 transition-all duration-500 ${
                      isActive ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <div className={`transition-transform duration-500 ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`}>
                      {item.icon}
                    </div>
                    <h3 
                      className={`text-3xl font-bold transition-colors duration-500 ${
                        isActive ? 'text-white' : 'text-white/40'
                      }`}
                      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <div
                    className="overflow-hidden transition-all duration-500 ml-1"
                    style={{
                      maxHeight: isActive ? '200px' : '0px',
                      opacity: isActive ? 1 : 0,
                      marginBottom: isActive ? '16px' : '0px'
                    }}
                  >
                    <p
                      className="text-base leading-relaxed text-white/80"
                      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                    >
                      {item.description}
                    </p>
                  </div>

                  {/* Separator */}
                  {idx < items.length - 1 && (
                    <div className={`border-t transition-colors duration-500 ${
                      isActive ? 'border-white/20' : 'border-white/10'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ✅ RIGHT SIDE - SCROLLABLE PHOTOS (OPTIMIZED) */}
          <div className="space-y-[15vh]"> {/* ✅ Reduced gap from 50vh to 15vh */}
            {items.map((item, idx) => {
              const isActive = activeItem === idx;
              
              return (
                <div
                  key={idx}
                  id={`photo-item-${idx}`}
                  data-index={idx}
                  className="photo-item flex items-center justify-center"
                  style={{ minHeight: '540px' }} // ✅ Matches photo height
                >
                  <div
                    className={`relative transition-all duration-500 ${
                      isActive 
                        ? 'scale-100 opacity-100' 
                        : 'scale-95 opacity-60'
                    }`}
                    style={{
                      width: '960px', // ✅ 16:9 ratio width
                      height: '540px', // ✅ 16:9 ratio height
                      maxWidth: '100%'
                    }}
                  >
                    {/* ✅ Photo Container with Rounded Corners */}
                    <div 
                      className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-500 ${
                        isActive 
                          ? 'shadow-2xl ring-2 ring-white/20' 
                          : 'shadow-lg'
                      }`}
                      style={{
                        backgroundColor: '#1a1a1a' // Fallback while photo loads
                      }}
                    >
                      {/* ✅ Photo (Replace with your actual photos) */}
                      <Image
                        src={item.photoPath}
                        alt={item.title}
                        fill
                        className="object-cover" // ✅ Fills entire box, crops to fit
                        style={{
                          transition: 'all 0.5s ease'
                        }}
                        priority={idx === 0} // ✅ Load first image faster
                      />

                      {/* ✅ Overlay gradient for better readability */}
                      <div 
                        className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-500 ${
                          isActive ? 'opacity-0' : 'opacity-60'
                        }`}
                      />

                      {/* ✅ Label (optional - you can remove this) */}
                      <div 
                        className={`absolute bottom-6 left-6 transition-all duration-500 ${
                          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                      >
                        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                          <p className="text-white font-semibold text-sm">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ✅ MOBILE LAYOUT (OPTIMIZED) */}
        <div className="md:hidden space-y-12">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="space-y-6"
            >
              {/* Title + Icon */}
              <div className="flex items-center gap-4">
                <div>{item.icon}</div>
                <h3 
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
                >
                  {item.title}
                </h3>
              </div>

              {/* Description */}
              <p 
                className="text-base text-white/80 leading-relaxed"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                {item.description}
              </p>

              {/* ✅ Photo (Mobile) */}
              <div 
                className="relative w-full rounded-xl overflow-hidden shadow-2xl"
                style={{
                  aspectRatio: '16/9', // ✅ Maintains 16:9 ratio on mobile
                  backgroundColor: '#1a1a1a'
                }}
              >
                <Image
                  src={item.photoPath}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                />

                {/* Label */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <p className="text-white font-semibold text-xs">
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}