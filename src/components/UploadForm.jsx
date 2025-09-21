"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadForm({ onDocumentUpload, loading, uploadProgress, analyzing }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleSelect = (fileList) => {
    if (fileList.length === 0) return;
    
    const file = fileList[0];
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];
    
    if (!validTypes.includes(file.type)) {
      setError("Please upload PDF, DOCX, or TXT files only.");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError("File size too large. Please upload files under 10MB.");
      return;
    }
    
    setError(null);
    setFiles([file]);
    
    onDocumentUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (loading || analyzing) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      {uploadProgress < 100 ? (
        
        <div>
          <motion.div className="relative w-40 h-40 mx-auto mb-6">
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                background: [
                  "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ filter: "blur(30px)" }}
            />
            
            {/* Progress ring */}
            <svg className="relative w-40 h-40 -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="6"
                fill="none"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#progressGradient)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: uploadProgress / 100 }}
                style={{
                  filter: "drop-shadow(0 0 10px rgba(168,85,247,0.5))"
                }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="50%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ y: [-5, 0, -5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg className="w-12 h-12 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </motion.div>
              <span className="text-2xl font-bold text-white">{uploadProgress}%</span>
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="text-white text-xl font-medium mb-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Uploading your document
          </motion.p>
          
          <motion.p className="text-gray-300 text-sm">
            Securely transferring your file...
          </motion.p>
        </div>
      ) : (
        
        <div>
          <motion.div className="relative w-40 h-40 mx-auto mb-6">
            {/* Multiple rotating rings with gradient */}
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="absolute rounded-full"
                style={{
                  inset: `${index * 12}px`,
                  background: `conic-gradient(from 0deg, transparent, ${
                    index === 0 ? '#6366F1' : index === 1 ? '#EC4899' : '#A855F7'
                  }, transparent)`,
                  opacity: 0.3
                }}
                animate={{ rotate: index % 2 === 0 ? 360 : -360 }}
                transition={{ 
                  duration: 3 + index, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              />
            ))}
            
            {/* Pulsing center glow */}
            <motion.div
              className="absolute inset-8 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
                filter: "blur(20px)"
              }}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* AI Brain with shimmer */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="text-6xl"
                animate={{
                  filter: [
                    "drop-shadow(0 0 20px rgba(99,102,241,0.8))",
                    "drop-shadow(0 0 25px rgba(236,72,153,0.8))",
                    "drop-shadow(0 0 20px rgba(168,85,247,0.8))"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🧠
              </motion.div>
            </motion.div>
            
            {/* Scanning lines */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
            </motion.div>
          </motion.div>
          
          <motion.div className="space-y-3">
            <motion.p 
              className="text-white text-xl font-medium"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              AI is analyzing your contract
            </motion.p>
            
            {/* Analysis steps */}
            <div className="space-y-2 max-w-xs mx-auto">
              {[
                "Reading document structure",
                "Identifying key clauses",
                "Analyzing legal terms",
                "Generating insights"
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.5 }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500"
                    animate={{ scale: [0, 1, 0] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: i * 0.5 
                    }}
                  />
                  {step}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="cursor-pointer"
      onClick={() => inputRef.current.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
    {/* Cloud Upload Icon - White with colored shadow only */}
<motion.svg
  className="w-32 h-32 mx-auto mb-4"
  fill="none"
  viewBox="0 0 24 24"
  animate={{ y: [0, -10, 0] }}
  transition={{ duration: 3, repeat: Infinity }}
  style={{
    filter: "drop-shadow(0 0 0.5px #6366F1) drop-shadow(0 0 0.5px #EC4899) drop-shadow(0 0 0.5px #A855F7)"
  }}
>
  <motion.path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2.5}
    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    stroke="white"
    fill="none"
  />
</motion.svg>

      {/* Upload Text */}
      <p className="text-white text-2xl font-semibold text-center">
        Drop your file here
      </p>

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={(e) => handleSelect(e.target.files)}
        hidden
      />

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}