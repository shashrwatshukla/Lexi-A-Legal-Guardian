"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { generateDeepAnalysisSummary } from "../../lib/aiSummaryGenerator";

export default function VoiceSummary({ analysis }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Seek audio to specific position
  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Generate AI-powered deep summary (minimum 3 minutes = 450-500 words)
  const generateDetailedSummary = () => {
    return generateDeepAnalysisSummary(analysis);
  };

  // Generate AI voice using Google Cloud Text-to-Speech
  const generateVoice = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setError(null);
      
      const script = generateDetailedSummary();
      console.log('📝 Generated script:', script.substring(0, 100) + '...');
      
      // Estimate generation time (10-15 seconds minimum for quality processing)
      const wordCount = script.split(/\s+/).length;
      const estimatedSeconds = Math.max(12, Math.ceil(wordCount / 80)); // Slower, more realistic
      setEstimatedTime(estimatedSeconds);
      
      console.log(`⏱️ Estimated generation time: ${estimatedSeconds} seconds`);
      console.log(`📊 Word count: ${wordCount} words`);

      // Simulate progress while waiting for API
      let currentProgress = 0;
      progressIntervalRef.current = setInterval(() => {
        currentProgress += 10;
        if (currentProgress <= 90) {
          setGenerationProgress(currentProgress);
          console.log(`📈 Progress: ${currentProgress}%`);
        }
      }, (estimatedSeconds * 1000) / 9); // Reach 90% by estimated time

      console.log('🌐 Calling voice generation API...');
      const startTime = Date.now();

      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: script,
          riskLevel: analysis.riskLevel || 'Medium'
        })
      });

      const data = await response.json();
      const endTime = Date.now();
      const actualTime = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`✅ API responded in ${actualTime} seconds`);
      
      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      setGenerationProgress(100);

      if (data.error) {
        console.error('❌ API Error:', data.error);
        setError(data.error);
        setIsGenerating(false);
        return;
      }

      if (data.audioUrl) {
  console.log('✅ Audio URL received');
  setAudioUrl(data.audioUrl);
  setMetadata(data.metadata);
  console.log('📊 Metadata:', data.metadata);
  
  // ✅ Store in sessionStorage to prevent regeneration
  sessionStorage.setItem('voiceSummaryUrl', data.audioUrl);
  sessionStorage.setItem('voiceSummaryMetadata', JSON.stringify(data.metadata));
  console.log('💾 Audio stored in sessionStorage');
  
  // Wait a moment to show 100% then hide loading
  setTimeout(() => {
    setIsGenerating(false);
    console.log('🎉 Voice generation complete!');
  }, 800);
} else {
        console.error('❌ No audio URL in response');
        setError('No audio generated');
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('❌ Voice generation failed:', error);
      setError(error.message);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setIsGenerating(false);
    }
  };

  useEffect(() => {
  // ✅ Check if audio already exists in sessionStorage
  const storedAudioUrl = sessionStorage.getItem('voiceSummaryUrl');
  const storedMetadata = sessionStorage.getItem('voiceSummaryMetadata');
  
  if (storedAudioUrl && storedMetadata) {
    console.log('✅ Audio already exists, loading from sessionStorage');
    setAudioUrl(storedAudioUrl);
    setMetadata(JSON.parse(storedMetadata));
    setIsGenerating(false);
  } else if (analysis && !audioUrl) {
    // ✅ Only generate if analysis exists AND no audio is loaded yet
    console.log('🚀 Starting voice generation...');
    generateVoice();
  }

  // Cleanup on unmount
  return () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };
}, [analysis]); // Keep only analysis as dependency

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl || isGenerating) {
      console.log('⚠️ Cannot play: Audio not ready');
      return;
    }

    if (isPlaying) {
      console.log('⏸️ Pausing audio at', currentTime, 'seconds');
      audioRef.current.pause();
    } else {
      console.log('▶️ Playing audio from', currentTime, 'seconds');
      audioRef.current.play().catch(err => {
        console.error('❌ Play failed:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      {/* Title */}
      <div className="px-8 pt-6 pb-4">
        <h3 className="text-2xl font-bold text-white text-center">
          🎧 The Audio Gist
        </h3>
      </div>

      {/* Full-Width Waveform - NO BOX, NO CONTAINER */}
      <div className="px-8 pb-6">
        <div 
          onClick={audioUrl && !isGenerating ? togglePlay : undefined}
          className={`w-full h-32 flex items-end justify-center overflow-visible relative ${
            audioUrl && !isGenerating 
              ? 'cursor-pointer' 
              : 'cursor-default'
          }`}
        >
          {/* Subtle Background Glow - Very minimal */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-blue-600/5"
            animate={{
              opacity: isPlaying ? [0.3, 0.5, 0.3] : 0.2,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          {/* Arctic Monkeys Style Waveform - Full Width */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 800 120" 
            preserveAspectRatio="none"
            className="w-full h-full relative z-10"
          >
            {/* Generate 80 bars for full width coverage */}
            {Array.from({ length: 80 }).map((_, i) => {
              // Create symmetrical amplitude (Arctic Monkeys style)
              const centerPoint = 40;
              const distanceFromCenter = Math.abs(i - centerPoint);
              const maxHeight = 100;
              const minHeight = 10;
              const height = maxHeight - (distanceFromCenter * 2);
              const finalHeight = Math.max(minHeight, height);

              return (
                <motion.rect
                  key={i}
                  x={i * 10}
                  y={60 - finalHeight / 2}
                  width="6"
                  height={finalHeight}
                  fill="white"
                  opacity={isGenerating ? 0.3 : 0.8}
                  animate={isPlaying ? {
                    height: [finalHeight, finalHeight * 1.3, finalHeight],
                    y: [60 - finalHeight / 2, 60 - (finalHeight * 1.3) / 2, 60 - finalHeight / 2],
                  } : {}}
                  transition={{
                    duration: 0.6,
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.02,
                    ease: "easeInOut"
                  }}
                />
              );
            })}
          </svg>

          {/* Play/Pause Button at BOTTOM of waveform */}
          {audioUrl && !isGenerating && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[30%] pointer-events-none z-20">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-black/90 backdrop-blur-md flex items-center justify-center transition-all pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                style={{
                  border: isPlaying 
                    ? '3px solid rgba(59, 130, 246, 1)' 
                    : '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: isPlaying 
                    ? '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.6), inset 0 0 15px rgba(59, 130, 246, 0.4)' 
                    : '0 0 10px rgba(0, 0, 0, 0.5)',
                }}
                animate={isPlaying ? {
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.6), inset 0 0 15px rgba(59, 130, 246, 0.4)',
                    '0 0 30px rgba(59, 130, 246, 1), 0 0 60px rgba(59, 130, 246, 0.8), inset 0 0 20px rgba(59, 130, 246, 0.6)',
                    '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.6), inset 0 0 15px rgba(59, 130, 246, 0.4)',
                  ]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: isPlaying ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                {isPlaying ? (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </motion.div>
            </div>
          )}

          {/* Generating Indicator with Progress */}
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20">
              <div className="text-white text-center px-6">
                {/* Circular Progress */}
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="url(#progressGradient)"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - generationProgress / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#A855F7" />
                        <stop offset="50%" stopColor="#EC4899" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{generationProgress}%</span>
                  </div>
                </div>

                <p className="text-base font-semibold mb-1">Generating Voice Summary</p>
                <p className="text-sm text-gray-300 mb-1">
                  Estimated time: ~{estimatedTime} seconds
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && !isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/10 backdrop-blur-sm z-20">
              <div className="text-center px-6">
                <p className="text-red-400 font-semibold mb-2">⚠️ Generation Failed</p>
                <p className="text-sm text-gray-300">{error}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateVoice();
                  }}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Audio Controls - When Playing */}
        {isPlaying && metadata && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 px-4"
          >
            <div className="flex items-center gap-4">
              {/* Left: Playing Status */}
              <div className="flex items-center gap-2 text-sm text-gray-300 min-w-[100px]">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-medium">Playing</span>
              </div>

              {/* Center: Progress Bar */}
              <div className="flex-1 flex items-center gap-3">
                {/* Current Time */}
                <span className="text-sm text-gray-400 font-mono min-w-[45px]">
                  {formatTime(currentTime)}
                </span>

                {/* Seekable Progress Bar */}
                <div 
                  className="flex-1 h-2 bg-gray-700/20 rounded-full cursor-pointer group relative"
                  onClick={handleSeek}
                >
                  {/* Background Track */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    {/* Progress Fill */}
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                      transition={{ duration: 0.1 }}
                    >
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-50 blur-sm" />
                    </motion.div>
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                         style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
                    />
                  </div>
                </div>

                {/* Total Duration */}
                <span className="text-sm text-gray-400 font-mono min-w-[45px]">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Right: Word Count */}
              <div className="text-sm text-gray-400 min-w-[80px] text-right font-medium">
                {metadata.wordCount} words
              </div>
            </div>
          </motion.div>
        )}

        {/* Info When Not Playing */}
        {audioUrl && !isGenerating && !isPlaying && metadata && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
              <span>{metadata.wordCount} words</span>
              <span>•</span>
              <span>~{formatTime(metadata.estimatedDuration)}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={(e) => {
            setDuration(e.target.duration);
            console.log('📊 Audio duration:', e.target.duration);
          }}
          onTimeUpdate={(e) => {
            setCurrentTime(e.target.currentTime);
          }}
          onEnded={() => {
            console.log('🏁 Audio ended');
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onPlay={() => {
            console.log('▶️ Audio playing');
            setIsPlaying(true);
          }}
          onPause={() => {
            console.log('⏸️ Audio paused');
            setIsPlaying(false);
          }}
          onError={(e) => {
            console.error('❌ Audio error:', e);
            setError('Audio playback failed');
          }}
        />
      )}
    </motion.div>
  );
}