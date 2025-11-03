'use client';

import { useState } from 'react';
import { generatePDFWithTemplate, createPDFBlobUrl, downloadPDF } from '@/lib/pdfGenerator';

export default function ExportOptions({ draft, documentType, documentTitle }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfBytes, setPdfBytes] = useState(null);

  const handleGeneratePDFPreview = async () => {
    setIsGenerating(true);
    try {
      const bytes = await generatePDFWithTemplate(draft, documentTitle, documentType);
      setPdfBytes(bytes);
      
      const blobUrl = createPDFBlobUrl(bytes);
      setPdfPreviewUrl(blobUrl);
      setShowPreview(true);
    } catch (error) {
      console.error('PDF Preview Error:', error);
      alert('Failed to generate PDF preview. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      let bytes = pdfBytes;
      
      if (!bytes) {
        setIsGenerating(true);
        bytes = await generatePDFWithTemplate(draft, documentTitle, documentType);
        setPdfBytes(bytes);
        setIsGenerating(false);
      }
      
      const filename = `${documentType || 'document'}-${Date.now()}.pdf`;
      downloadPDF(bytes, filename);
    } catch (error) {
      console.error('PDF Download Error:', error);
      alert('Failed to download PDF. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      alert('✅ Document copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('❌ Failed to copy. Please try manual selection.');
    }
  };

  const handleClosePreview = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    setPdfPreviewUrl(null);
    setShowPreview(false);
  };

  return (
    <>
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white">Export & Share</h3>

        {/* PDF Actions */}
        <div className="space-y-3">
          {/* Preview PDF */}
          <button
            onClick={handleGeneratePDFPreview}
            disabled={isGenerating}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Generating Preview...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                Preview PDF with Template
              </>
            )}
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Download PDF with Template
              </>
            )}
          </button>
        </div>

        <div className="border-t border-white/10 pt-4"></div>

        {/* Additional Actions */}
        <div className="space-y-2">
          <button
            onClick={handleCopyToClipboard}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
            </svg>
            Copy Text to Clipboard
          </button>

          <button
            onClick={() => window.print()}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            Print Document
          </button>
        </div>

        {/* Document Stats */}
        <div className="pt-4 border-t border-white/10 space-y-2 text-sm">
          <div className="flex justify-between text-white/60">
            <span>Word Count:</span>
            <span className="text-white font-medium">{draft.split(/\s+/).length}</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>Character Count:</span>
            <span className="text-white font-medium">{draft.length}</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>Estimated Pages:</span>
            <span className="text-white font-medium">{Math.ceil(draft.split(/\s+/).length / 250)}</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-200 text-xs leading-relaxed">
            <strong>⚠️ Legal Review Required:</strong> This AI-generated document must be reviewed by a qualified attorney before use.
          </p>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && pdfPreviewUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-white/20 w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">PDF Preview with Template</h3>
                <p className="text-white/60 text-sm mt-1">Review your document before downloading</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Download
                </button>
                <button
                  onClick={handleClosePreview}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 p-6 overflow-hidden">
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-full rounded-lg border border-white/10"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}