"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function DetailedSummaryPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState(null);
  const [detailedSummary, setDetailedSummary] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get analysis from sessionStorage directly
    const storedAnalysis = sessionStorage.getItem('current_document_analysis');
    const storedFileName = sessionStorage.getItem('current_document_filename');
    
    console.log('📄 Retrieved analysis from sessionStorage:', storedAnalysis ? 'Found' : 'Not found');
    
    if (!storedAnalysis) {
      console.warn('⚠️ No analysis found, redirecting...');
      router.push('/');
      return;
    }
    
    try {
      const parsedAnalysis = JSON.parse(storedAnalysis);
      setAnalysis(parsedAnalysis);
      console.log('✅ Analysis loaded successfully');
    } catch (error) {
      console.error('❌ Error parsing analysis:', error);
      router.push('/');
      return;
    }
    
    // Get summary from sessionStorage
    const storedSummary = sessionStorage.getItem('detailedSummary');
    console.log('📝 Retrieved summary:', storedSummary ? `${storedSummary.length} chars` : 'Not found');
    
    if (storedSummary) {
      setDetailedSummary(storedSummary);
      setIsLoading(false);
    } else {
      console.warn('⚠️ No summary found in sessionStorage');
      setIsLoading(false);
    }
  }, [router]);

  const downloadAsPDF = async () => {
    if (!detailedSummary || detailedSummary.length < 100) {
      alert('Summary is not available. Please go back and generate it first.');
      return;
    }
    
    setIsDownloading(true);
    
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
  .split(/\n+/)
  .map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    
    // Check if it's a heading
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
    
    // Check if it's a bullet point
    if (/^[•\-\*]/.test(trimmed)) {
      return `<p style="margin-bottom: 10px; margin-left: 20px; line-height: 1.6;"><span style="color: #3b82f6; font-weight: bold;">•</span> ${trimmed.replace(/^[•\-\*]\s*/, '')}</p>`;
    }
    
    // Regular paragraph
    return `<p style="margin-bottom: 15px; text-align: justify; line-height: 1.7;">${trimmed}</p>`;
  })
  .filter(item => item !== '')
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
      
      return {
        id: index,
        text: trimmed,
        isHeading
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
          <span key={index} className="block ml-4 my-2">
            <span className="text-blue-600 font-bold">•</span>
            <span className="ml-2">{part.replace('•', '').trim()}</span>
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const extractLegalTerms = (text) => {
    if (!text) return [];
    
    const foundTerms = new Map();
    
    const commonLegalWords = [
      'abstain', 'pursuant', 'indemnify', 'notwithstanding', 'hereinafter',
      'whereas', 'thereof', 'aforementioned', 'henceforth', 'covenant',
      'consideration', 'force majeure', 'perpetuity', 'liable', 'null and void',
      'remuneration', 'rescind', 'severability', 'waive', 'jurisdiction',
      'breach', 'termination', 'arbitration', 'confidentiality', 'proprietary'
    ];
    
    commonLegalWords.forEach(legalWord => {
      const regex = new RegExp(`\\b${legalWord}\\b[^.]{0,200}(means?|which means|is when|refers to)[^.]{10,200}\\.`, 'gi');
      const matches = text.match(regex);
      
      if (matches && matches.length > 0 && !foundTerms.has(legalWord)) {
        let explanation = matches[0]
          .replace(new RegExp(`\\b${legalWord}\\b`, 'gi'), '')
          .replace(/(means?|which means|is when|refers to)/gi, '')
          .replace(/[\(\)]/g, '')
          .trim()
          .replace(/^[,:\s]+/, '')
          .replace(/\.$/, '');
        
        if (explanation.length > 15 && explanation.length < 250) {
          foundTerms.set(legalWord, {
            word: legalWord.charAt(0).toUpperCase() + legalWord.slice(1),
            meaning: explanation
          });
        }
      }
    });
    
    return Array.from(foundTerms.values()).slice(0, 10);
  };

  const formattedContent = formatSummary(detailedSummary);
  const legalTermsFound = extractLegalTerms(detailedSummary);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            ⚙️
          </motion.div>
          <p className="text-gray-600">Loading summary...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analysis Found</h2>
          <p className="text-gray-600 mb-6">Please upload and analyze a document first.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!detailedSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <span className="text-6xl mb-4 block">📝</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Summary Not Generated</h2>
          <p className="text-gray-600 mb-6">Please go back and wait for the summary to generate.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Google Docs Style Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>

            {/* Title */}
            <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate mx-4 flex-1 text-center">
              {analysis?.metadata?.fileName?.replace(/\.[^/.]+$/, '') || 'Detailed Summary'}
            </h1>

            {/* Download Button */}
            <motion.button
              onClick={downloadAsPDF}
              disabled={isDownloading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                isDownloading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
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
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content - Google Docs Style */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Document Header */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-200">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                📄 Simplified Legal Summary
              </h1>
              <p className="text-sm sm:text-base text-gray-600 italic mb-4">
                Easy-to-understand explanation of your document
              </p>
              
              {/* Animated Date Border */}
              <div className="relative mt-6">
                <motion.div
                  className="h-1 rounded-full mx-auto"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    background: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853, #4285F4)',
                    backgroundSize: '200% 100%'
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <p className="text-xs sm:text-sm text-gray-400 mt-3">
                  Generated on {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-6 sm:px-10 md:px-16 py-8 sm:py-12">
            <div className="prose prose-sm sm:prose-base max-w-none">
              {/* Content */}
              {formattedContent.map((item) => (
                <div key={item.id} className="mb-4 sm:mb-6">
                  {item.isHeading ? (
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-8 mb-4 pb-3 border-b-2 border-gray-300">
                      {renderFormattedText(item.text)}
                    </h2>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {renderFormattedText(item.text)}
                    </p>
                  )}
                </div>
              ))}

              {/* Legal Terms */}
              {legalTermsFound.length > 0 && (
                <div className="mt-12 sm:mt-16 pt-8 border-t-2 border-gray-300">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                    📚 Legal Jargon Explained
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {legalTermsFound.map((term, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200 hover:border-blue-300 transition-colors">
                        <p className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                          {term.word}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {term.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200 text-center">
                <p className="text-xs sm:text-sm text-gray-500 italic">
                  ✨ This summary was automatically generated using AI. For official legal advice, consult a licensed attorney.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .prose {
          max-width: none;
        }
        
        .prose p {
          margin-bottom: 1em;
          line-height: 1.75;
        }
        
        .prose h2 {
          margin-top: 2em;
          margin-bottom: 1em;
        }
      `}</style>
    </div>
  );
}