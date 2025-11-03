"use client";

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function UseCasesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const useCases = [
    {
      icon: (
        <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 13V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H13" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-blue-500"
          />
          <circle cx="8" cy="10" r="2" strokeWidth="2" className="text-blue-500"/>
          <path d="M16 16L18 18L22 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"/>
        </svg>
      ),
      title: 'Freelancers',
      description: 'Review client contracts with confidence and speed. Understand every term, identify potential risks, and negotiate better agreements. Protect your business interests without expensive legal fees while maintaining professional standards.'
    },
    {
      icon: (
        <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" className="text-purple-500"/>
          <path d="M3 9H21" strokeWidth="2" className="text-purple-500"/>
          <path d="M9 21V9" strokeWidth="2" className="text-purple-500"/>
          <circle cx="15" cy="15" r="2" strokeWidth="2" className="text-purple-500"/>
        </svg>
      ),
      title: 'Small Businesses',
      description: 'Safeguard your company with enterprise-grade contract analysis. Review vendor agreements, employment contracts, and partnership terms. Save thousands on legal fees while ensuring your business stays protected and compliant.'
    },
    {
      icon: (
        <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" 
                strokeWidth="2" 
                strokeLinecap="round"
                className="text-pink-500"
          />
          <circle cx="9" cy="7" r="4" strokeWidth="2" className="text-pink-500"/>
          <path d="M23 21V19C23 17.1362 21.7252 15.5701 20 15.126" strokeWidth="2" strokeLinecap="round" className="text-pink-500"/>
          <path d="M16 3.12988C17.7252 3.57391 19 5.13998 19 7.00003C19 8.86008 17.7252 10.4262 16 10.8702" 
                strokeWidth="2" 
                strokeLinecap="round"
                className="text-pink-500"
          />
        </svg>
      ),
      title: 'Legal Professionals',
      description: 'Enhance your practice with AI-powered contract review. Streamline routine analysis, catch overlooked clauses, and focus on complex strategic work. Deliver faster results to clients while maintaining the highest quality standards.'
    },
    {
      icon: (
        <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-cyan-500"
          />
        </svg>
      ),
      title: 'Startups',
      description: 'Build your business on solid legal foundations. Analyze investor agreements, vendor contracts, and partnership terms with confidence. Make informed decisions quickly without burning through your runway on legal costs.'
    },
    {
      icon: (
        <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 20V10" strokeWidth="2" strokeLinecap="round" className="text-orange-500"/>
          <path d="M12 20V4" strokeWidth="2" strokeLinecap="round" className="text-orange-500"/>
          <path d="M6 20V14" strokeWidth="2" strokeLinecap="round" className="text-orange-500"/>
          <circle cx="18" cy="7" r="3" strokeWidth="2" className="text-orange-500"/>
          <circle cx="6" cy="11" r="3" strokeWidth="2" className="text-orange-500"/>
        </svg>
      ),
      title: 'Entrepreneurs',
      description: 'Navigate business agreements with clarity and confidence. Understand partnership agreements, service contracts, and vendor terms without expensive legal consultants. Make faster, better-informed decisions that protect your vision.'
    },
    {
      icon: (
        <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-green-500"
          />
          <path d="M13 3V8H18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"/>
        </svg>
      ),
      title: 'Contract Reviewers',
      description: 'Amplify your expertise with AI assistance. Process more contracts efficiently, identify issues faster, and provide deeper insights to clients. Maintain quality while dramatically increasing your capacity and service value.'
    }
  ];

  return (
    <section ref={ref} className="py-8 px-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
            style={{ 
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.03em'
            }}
          >
            Who uses Lexi?
          </h2>
          <p 
            className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto"
            style={{ 
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}
          >
            Trusted by professionals across industries to analyze, understand, and protect their legal interests
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {useCases.map((useCase, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group cursor-pointer"
            >
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                {useCase.icon}
              </motion.div>

              {/* Title */}
              <h3 
                className="text-3xl md:text-4xl font-black text-white mb-4 group-hover:text-white/90 transition-colors duration-300"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                {useCase.title}
              </h3>

              {/* Description */}
              <p 
                className="text-base md:text-lg text-white/70 leading-relaxed group-hover:text-white/80 transition-colors duration-300"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
              >
                {useCase.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}