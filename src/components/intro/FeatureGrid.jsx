"use client";

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';

export default function FeatureGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-pink-500"
          />
          <circle cx="9" cy="10" r="1" fill="currentColor" className="text-pink-500"/>
          <circle cx="15" cy="10" r="1" fill="currentColor" className="text-pink-500"/>
          <path d="M9 13C9 13 10 14 12 14C14 14 15 13 15 13" 
                strokeWidth="2" 
                strokeLinecap="round"
                className="text-pink-500"
          />
        </svg>
      ),
      title: 'AI Chatbot Assistant',
      description: 'Ask questions about your uploaded documents and get instant AI-powered answers. Our intelligent chatbot understands context and provides accurate responses about any contract clause or legal term.',
      photoPath: '/images/features/chatbot.png', // ✅ Replace with your photo path
      points: [
        'Natural language Q&A about documents',
        'Context-aware responses',
        'Instant clarification of complex terms',
        'Multi-document analysis support'
      ]
    },
    {
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2C10.9 2 10 2.9 10 4V12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12V4C14 2.9 13.1 2 12 2Z" 
                strokeWidth="2"
                className="text-cyan-500"
          />
          <path d="M17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11" 
                strokeWidth="2" 
                strokeLinecap="round"
                className="text-cyan-500"
          />
          <line x1="12" y1="16" x2="12" y2="20" strokeWidth="2" strokeLinecap="round" className="text-cyan-500"/>
          <line x1="8" y1="20" x2="16" y2="20" strokeWidth="2" strokeLinecap="round" className="text-cyan-500"/>
        </svg>
      ),
      title: 'Audio Playback & Voice',
      description: 'Listen to your contract analysis on the go with AI voice narration. Perfect for multitasking or when you prefer audio learning. Includes voice-to-text input for hands-free document creation.',
      photoPath: '/images/features/audio.png', // ✅ Replace with your photo path
      points: [
        'AI voice narration of analysis',
        'Listen to key insights anywhere',
        'Voice-to-text document drafting',
        'Adjustable playback speed'
      ]
    },
    {
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-orange-500"
          />
          <path d="M14 2V8H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"/>
          <line x1="8" y1="13" x2="16" y2="13" strokeWidth="2" strokeLinecap="round" className="text-orange-500"/>
          <line x1="8" y1="17" x2="16" y2="17" strokeWidth="2" strokeLinecap="round" className="text-orange-500"/>
        </svg>
      ),
      title: 'Multi-Country Drafter',
      description: 'Create professional legal documents for any country with AI-powered templates and guidance. Customizable, editable drafts with page count estimation and AI disclaimer for transparency.',
      photoPath: '/images/features/drafter.png', // ✅ Replace with your photo path
      points: [
        'Templates for all countries',
        'Customizable document generation',
        'Fully editable drafts',
        'Page count & time estimation'
      ]
    },
    {
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" className="text-green-500"/>
          <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" strokeLinecap="round" className="text-green-500"/>
          <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" 
                strokeWidth="2"
                className="text-green-500"
          />
        </svg>
      ),
      title: 'Cross-Platform Compatible',
      description: 'Seamlessly works on web and mobile without any errors or lag. Optimized for both desktop and mobile experiences with responsive design and fast performance across all devices.',
      photoPath: '/images/features/platform.png', // ✅ Replace with your photo path
      points: [
        'Web and mobile optimized',
        'No errors or lag',
        'Responsive on all devices',
        'Fast, smooth performance'
      ]
    }
  ];

  return (
    <section ref={ref} className="py-8 px-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
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
          <span className="text-cyan-400">Powerful</span> features for everyone
        </motion.h2>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-16">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group"
            >
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                {feature.icon}
              </motion.div>

              {/* Title */}
              <h3 
                className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p 
                className="text-lg text-white/80 mb-8 leading-relaxed"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                {feature.description}
              </p>

              {/* Feature Points */}
              <div className="space-y-4 mb-8">
                {feature.points.map((point, pointIdx) => (
                  <div key={pointIdx} className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0 border border-white/20">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white/70 text-base leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>

              {/* ✅ PHOTO Section - Laptop Screenshot Size */}
              <div 
                className="relative rounded-2xl overflow-hidden shadow-2xl group"
                style={{
                  width: '100%',
                  maxWidth: '960px', // ✅ 16:9 ratio width (desktop)
                  aspectRatio: '16/9', // ✅ Maintains 16:9 ratio
                  backgroundColor: '#1a1a1a',
                  margin: '0 auto' // ✅ Center align
                }}
              >
                {/* ✅ Photo */}
                <Image
                  src={feature.photoPath}
                  alt={feature.title}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105" // ✅ Slight zoom on hover
                  priority={idx === 0 || idx === 1} // ✅ Load first 2 images faster
                />

                {/* ✅ Overlay gradient (subtle) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                {/* ✅ Label (optional - remove if you don't want it) */}
                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <p className="text-white font-semibold text-sm">
                      {feature.title}
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