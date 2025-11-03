"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    {
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      ),
      number: "10,000+",
      label: "Contracts Analyzed",
      description: "Legal documents processed with AI"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      number: "99.9%",
      label: "AI Accuracy",
      description: "Precision in legal analysis"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      number: "<60",
      label: "Seconds",
      description: "Average analysis time"
    }
  ];

  const CountUpAnimation = ({ end, duration = 2 }) => {
    const [count, setCount] = useState("0");

    useEffect(() => {
      if (!isInView) return;

      const isNumber = !isNaN(parseInt(end));
      
      if (!isNumber) {
        setCount(end);
        return;
      }

      const endNum = parseInt(end.replace(/[^0-9]/g, ''));
      const hasPlus = end.includes('+');
      const increment = endNum / (duration * 60);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= endNum) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current).toLocaleString() + (hasPlus ? '+' : ''));
        }
      }, 1000 / 60);

      return () => clearInterval(timer);
    }, [isInView, end, duration]);

    return <span>{count}</span>;
  };

  return (
    <section ref={ref} className="py-32 px-6 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 
            className="text-6xl md:text-7xl font-bold text-white mb-6"
            style={{ 
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.03em'
            }}
          >
            Trusted by professionals
          </h2>
          <p 
            className="text-2xl text-white/60"
            style={{ 
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}
          >
            Join thousands who use AI to understand legal documents
          </p>
        </motion.div>

        {/* Stats Grid - LARGE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.15 }}
              className="text-center p-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.05] cursor-pointer"
            >
              {/* Icon - Animated */}
              <motion.div
                animate={isInView ? { 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 text-white mb-8"
              >
                {stat.icon}
              </motion.div>

              {/* Number - Count up animation - LARGE */}
              <div 
                className="text-7xl md:text-8xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
                style={{ 
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.03em'
                }}
              >
                <CountUpAnimation end={stat.number} />
              </div>

              {/* Label - LARGE */}
              <p 
                className="text-white text-2xl font-bold mb-3"
                style={{ 
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                }}
              >
                {stat.label}
              </p>

              {/* Description */}
              <p 
                className="text-white/60 text-base"
                style={{ 
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                }}
              >
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}