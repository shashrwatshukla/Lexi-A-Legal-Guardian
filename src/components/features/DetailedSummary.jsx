"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function DetailedSummary({ analysis }) {
  const router = useRouter();
  const [originalText, setOriginalText] = useState('');
  const [detailedSummary, setDetailedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const summaryRef = useRef(null);

  // Extract original text from analysis
  useEffect(() => {
    console.log('🔍 DetailedSummary - Extracting text...');
    
    let extractedText = '';
    
    if (analysis?.metadata?.documentText) {
      extractedText = analysis.metadata.documentText;
    } else if (analysis?.documentText) {
      extractedText = analysis.documentText;
    } else if (analysis?.rawText) {
      extractedText = analysis.rawText;
    } else if (analysis?.flaggedClauses && analysis.flaggedClauses.length > 0) {
      extractedText = analysis.flaggedClauses
        .map(clause => clause.fullText || clause.description || '')
        .join('\n\n');
    } else if (analysis?.summary) {
      extractedText = analysis.summary;
    }

    if (extractedText && extractedText.trim().length > 50) {
      setOriginalText(extractedText.trim());
      console.log('✅ Original text extracted:', extractedText.length, 'chars');
    } else {
      console.error('❌ No valid text found');
      setError('Could not extract document text');
    }
  }, [analysis]);

  // Auto-generate detailed summary when text is available
  useEffect(() => {
    if (originalText && originalText.length > 50 && !detailedSummary) {
      // Check if summary already exists in sessionStorage
      const storedSummary = sessionStorage.getItem('detailedSummary');
      if (storedSummary) {
        setDetailedSummary(storedSummary);
        console.log('✅ Summary loaded from sessionStorage');
      } else {
        generateDetailedSummary();
      }
    }
  }, [originalText]);

  const generateDetailedSummary = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      console.log('🚀 Generating detailed summary...');
      
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 3, 90));
      }, 500);

      const response = await fetch('/api/detailed-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: originalText,
          documentType: analysis?.documentType || 'legal document'
        })
      });

      clearInterval(progressInterval);
      setProgress(95);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Summary generation failed');
      }

      const data = await response.json();
      setProgress(100);

      if (data.success && data.detailedSummary) {
        setDetailedSummary(data.detailedSummary);
        console.log('✅ Summary generated:', data.detailedSummary.length, 'chars');
        
        // STORE IN SESSIONSTORAGE
        sessionStorage.setItem('detailedSummary', data.detailedSummary);
      } else {
        throw new Error('No summary received');
      }
      
    } catch (err) {
      console.error('❌ Summary generation error:', err);
      setError(err.message);
      setDetailedSummary('⚠️ Summary generation failed. Please try again.');
    } finally {
      setTimeout(() => setIsGenerating(false), 500);
    }
  };

  const downloadAsPDF = async () => {
    if (!detailedSummary || detailedSummary.length < 100) {
      alert('Summary is still being generated. Please wait...');
      return;
    }
    
    setIsDownloading(true);
    console.log('🚀 Starting PDF generation...');
    
    try {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm';
      tempContainer.style.background = '#ffffff';
      tempContainer.style.padding = '20mm';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      document.body.appendChild(tempContainer);

      const formattedHTML = `
        <div style="max-width: 170mm; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
            <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 10px;">
              📄 Detailed Legal Summary
            </h1>
            <p style="font-size: 14px; color: #6b7280; font-style: italic;">
              ${analysis?.metadata?.fileName?.replace(/\.[^/.]+$/, '') || 'Legal Document'}
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
              ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div style="line-height: 1.8; font-size: 13px; color: #374151;">
            ${detailedSummary
              .split(/\n\n+/)
              .map(para => {
                const trimmed = para.trim();
                
                if (/^[A-Z\s]+:?$/.test(trimmed) || 
                    trimmed.startsWith('SECTION') || 
                    trimmed.startsWith('WHAT THIS') ||
                    trimmed.startsWith('IMPORTANT DATES') ||
                    trimmed.startsWith('MONEY') ||
                    trimmed.startsWith('YOUR RIGHTS') ||
                    trimmed.startsWith('KEY THINGS') ||
                    trimmed.startsWith('LEGAL JARGON')) {
                  return `<h2 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-top: 25px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">${trimmed}</h2>`;
                }
                
                if (/^[•\-\*]/.test(trimmed)) {
                  return `<p style="margin-bottom: 12px; margin-left: 20px;"><span style="color: #3b82f6; font-weight: bold;">•</span> ${trimmed.replace(/^[•\-\*]\s*/, '')}</p>`;
                }
                
                return `<p style="margin-bottom: 15px; text-align: justify;">${trimmed}</p>`;
              })
              .join('')}
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
            <p style="font-size: 11px; color: #6b7280; font-style: italic;">
              ✨ AI-generated summary. For official legal advice, consult a licensed attorney.
            </p>
          </div>
        </div>
      `;

      tempContainer.innerHTML = formattedHTML;
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      document.body.removeChild(tempContainer);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      const imgWidth = contentWidth;
      const imgHeightMM = (canvas.height * contentWidth) / canvas.width;

      let yPosition = margin;
      let remainingHeight = imgHeightMM;
      let sourceY = 0;
      let pageNumber = 1;

      while (remainingHeight > 0) {
        if (pageNumber > 1) {
          pdf.addPage();
          yPosition = margin;
        }

        const heightForThisPage = Math.min(contentHeight, remainingHeight);
        const sourceHeight = (heightForThisPage * canvas.height) / imgHeightMM;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;

        const pageCtx = pageCanvas.getContext('2d');
        pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);

        const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
        pdf.addImage(pageImgData, 'PNG', margin, yPosition, imgWidth, heightForThisPage, undefined, 'FAST');

        sourceY += sourceHeight;
        remainingHeight -= heightForThisPage;
        pageNumber++;

        if (pageNumber > 50) break;
      }

      const fileName = `Detailed_Summary_${
        analysis?.metadata?.fileName?.replace(/\.[^/.]+$/, '') || 'Document'
      }_${new Date().toISOString().slice(0, 10)}.pdf`;

      pdf.save(fileName);
      console.log('✅ PDF downloaded:', fileName);

    } catch (err) {
      console.error('❌ PDF Error:', err);
      alert('PDF generation failed: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatSummary = (text) => {
    if (!text) return [];
    
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    
    return paragraphs.map((para, index) => {
      const trimmed = para.trim();
      const isHeading = /^[A-Z\s]+:?$/.test(trimmed) || 
                       /^\d+\./.test(trimmed) || 
                       trimmed.startsWith('SECTION') || 
                       trimmed.startsWith('WHAT THIS') || 
                       trimmed.startsWith('THE PEOPLE') || 
                       trimmed.startsWith('IMPORTANT DATES') || 
                       trimmed.startsWith('MONEY') || 
                       trimmed.startsWith('YOUR RIGHTS') || 
                       trimmed.startsWith('KEY THINGS') || 
                       trimmed.startsWith('LEGAL JARGON');
      const isBullet = /^[•\-\*]/.test(trimmed);
      
      return {
        id: index,
        text: trimmed,
        isHeading,
        isBullet
      };
    });
  };

  const renderFormattedText = (text) => {
    if (!text) return text;
    
    let cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\s\*(?=\w)/g, ' ')
      .replace(/^\*\s/gm, '• ')
      .replace(/\*/g, '');
    
    const parts = cleanText.split(/(•\s[^\n]+)/g);
    
    return parts.map((part, index) => {
      if (part.trim().startsWith('•')) {
        return (
          <span key={index} className="block ml-4 my-1.5">
            <span className="text-blue-600 font-bold">•</span>
            <span className="ml-2">{part.replace('•', '').trim()}</span>
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const formattedContent = formatSummary(detailedSummary);

  const handleViewFullSummary = () => {
    // Mark that we're navigating to detail page
    sessionStorage.setItem('returning_from_detail', 'true');
    router.push('/detailed-summary');
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="relative w-full mb-10"
    >
      {/* Header - Centered */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-2xl"
          >
            📝
          </motion.div>
          <h3 className="text-xl font-bold text-white">Detailed Summary</h3>
        </div>
      </div>

      {/* COMPACT PREVIEW CARD */}
      <motion.div variants={fadeInUp} className="relative group mx-auto max-w-6xl px-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 overflow-hidden">
          
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-4 py-2 border-b border-gray-200/50">
            <div className="relative flex items-center justify-center">
              <h4 className="text-base font-bold text-gray-900 truncate max-w-[50%] sm:max-w-none">
                {analysis?.metadata?.fileName?.replace(/\.[^/.]+$/, '') || 'Legal Document'}
              </h4>
              
              {!isGenerating && detailedSummary && (
                <div className="absolute right-0 sm:right-4 flex items-center gap-2">
                  <motion.button
                    onClick={handleViewFullSummary}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-lg shadow-md hover:shadow-blue-500/50 transition-all flex items-center gap-1.5"
                  >
                    <span>📖</span>
                    <span className="hidden sm:inline">Read</span>
                  </motion.button>

                  <motion.button
                    onClick={downloadAsPDF}
                    disabled={isDownloading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg shadow-md transition-all flex items-center gap-1.5 ${
                      isDownloading
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-purple-500/50'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ⚙️
                        </motion.span>
                      </>
                    ) : (
                      <>
                        <span>📥</span>
                        <span className="hidden sm:inline">Download</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* COMPACT PREVIEW */}
          <div ref={summaryRef} className="p-5 elegant-scrollbar">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-4xl mb-4"
                >
                  ✨
                </motion.div>
                <h4 className="text-base font-semibold text-gray-800 mb-2">
                  Generating Summary...
                </h4>
                <p className="text-xs text-gray-500 mb-4 max-w-xs text-center">
                  Converting legal jargon into simple language
                </p>
                <div className="w-64">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-center text-gray-500 text-xs mt-1.5">{progress}%</p>
                </div>
              </div>
            ) : detailedSummary ? (
              <div className="prose prose-sm max-w-none">
                {/* SHOW ONLY 3 ITEMS WITH FORMATTING */}
                <div className="text-sm text-gray-700 leading-relaxed">
                  {formattedContent.slice(0, 3).map((item) => (
                    <div key={item.id} className="mb-2">
                      {item.isHeading ? (
                        <h3 className="font-bold text-gray-900 text-sm">
                          {renderFormattedText(item.text)}
                        </h3>
                      ) : (
                        <p className="text-sm leading-relaxed line-clamp-2">
                          {renderFormattedText(item.text)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-3 mt-2"
                >
                  <button
                    onClick={handleViewFullSummary}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 mx-auto group"
                  >
                    <span>Continue reading full summary</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </button>
                </motion.div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-3">⚠️</span>
                <p className="text-sm font-semibold text-gray-800 mb-1">Unable to Generate</p>
                <p className="text-xs text-gray-500 mb-4">{error || 'Please try again'}</p>
                <button
                  onClick={generateDetailedSummary}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .elegant-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .elegant-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .elegant-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </motion.div>
  );
}