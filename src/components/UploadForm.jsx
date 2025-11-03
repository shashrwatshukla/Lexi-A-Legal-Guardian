"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "./ui/LoadingSpinner";

export default function UploadForm({ onDocumentUpload, loading, uploadProgress, analyzing, analysisData }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (analysisData && analysisData.analysis) {
      try {
        console.log('Saving analysis to session storage:', analysisData.analysis.metadata?.fileName);
        
        sessionStorage.setItem('documentAnalysis', JSON.stringify(analysisData.analysis));
        
        sessionStorage.setItem('uploadedDocument', JSON.stringify({
          fileName: analysisData.analysis.metadata?.fileName || 'document',
          fileSize: analysisData.analysis.metadata?.fileSize || 0,
          uploadedAt: analysisData.analysis.metadata?.analyzedAt || new Date().toISOString()
        }));
        
        console.log('✅ Analysis saved to session storage successfully');
      } catch (error) {
        console.error('Error saving to session storage:', error);
      }
    }
  }, [analysisData]);

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
    
    sessionStorage.removeItem('documentAnalysis');
    sessionStorage.removeItem('uploadedDocument');
    
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
        <LoadingSpinner progress={uploadProgress} />
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

      <p className="text-white text-2xl font-semibold text-center">
        Drop your file here
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={(e) => handleSelect(e.target.files)}
        hidden
      />

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