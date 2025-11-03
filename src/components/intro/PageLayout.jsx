"use client";

import { useRouter } from 'next/navigation';
import Navbar from '@/components/intro/Navbar';
import Footer from '@/components/intro/Footer';
import { motion } from 'framer-motion';

export default function PageLayout({ children }) {
  const router = useRouter();

  return (
    <div className="relative bg-black min-h-screen">
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-black/80 z-[-1]" />

      {/* Scrollable Content */}
      <div className="relative z-10 flex flex-col min-h-screen smooth-scroll-container">
        <Navbar router={router} />
        <main className="flex-grow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.2, 
              ease: [0.4, 0, 0.2, 1],
              willChange: "transform, opacity"
            }}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "translateZ(0)",
              WebkitTransform: "translateZ(0)"
            }}
          >
            {children}
          </motion.div>
        </main>
        <Footer router={router} />
      </div>
    </div>
  );
}