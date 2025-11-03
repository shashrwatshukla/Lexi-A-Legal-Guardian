"use client";

import { useEffect, useRef, useState, useMemo } from "react";

const SYMBOLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?".split("");

function scrambleText(target, progress, scrambleSeed) {
  return target.split("").map((char, i) => {
    if (char === ' ') {
      return { char: ' ', isScrambled: false, isSpace: true };
    }
    
    if (i < progress) {
      return { char, isScrambled: false, isSpace: false };
    }
    
    const idx = Math.floor(Math.random() * SYMBOLS.length + scrambleSeed * (i + 1)) % SYMBOLS.length;
    return { char: SYMBOLS[idx], isScrambled: true, isSpace: false };
  });
}

export default function HeroText() {
  const phrases = useMemo(() => [
    "A Legal Guardian",
    "Your Document Demystifier",
    "Sign with Confidence"
  ], []);

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [display, setDisplay] = useState([]);
  const [isErasing, setIsErasing] = useState(false);
  const raf = useRef(null);
  const scrambleSeedRef = useRef(Math.random());
  const lastUpdateRef = useRef(0);

  const currentPhrase = phrases[currentPhraseIndex];

  useEffect(() => {
    let start = null;
    const writeDuration = 3500;
    const eraseDuration = 2000;
    const duration = isErasing ? eraseDuration : writeDuration;
    const totalFrames = currentPhrase.length;
    const updateInterval = 80; // ✅ FASTER: 80ms instead of 120ms

    function animate(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;

      // ✅ ALWAYS update scramble (even when complete)
      if (ts - lastUpdateRef.current >= updateInterval) {
        scrambleSeedRef.current = Math.random();
        lastUpdateRef.current = ts;
      }

      if (isErasing) {
        const reveal = Math.max(0, totalFrames - Math.floor(elapsed / duration * totalFrames));
        
        setProgress(reveal);
        setDisplay(scrambleText(currentPhrase, reveal, scrambleSeedRef.current));

        if (reveal > 0) {
          raf.current = requestAnimationFrame(animate);
        } else {
          setTimeout(() => {
            setIsErasing(false);
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          }, 800);
        }
      } else {
        const reveal = Math.min(totalFrames, Math.floor(elapsed / duration * totalFrames) + 1);
        
        setProgress(reveal);
        setDisplay(scrambleText(currentPhrase, reveal, scrambleSeedRef.current));

        if (reveal < totalFrames) {
          raf.current = requestAnimationFrame(animate);
        } else {
          // ✅ KEEP SCRAMBLING even after text is complete
          setDisplay(scrambleText(currentPhrase, reveal, scrambleSeedRef.current));
          raf.current = requestAnimationFrame(animate);
          
          // Wait before erasing
          if (elapsed >= duration + 3500) {
            setIsErasing(true);
          }
        }
      }
    }

    setProgress(0);
    setDisplay(scrambleText(currentPhrase, 0, scrambleSeedRef.current));
    raf.current = requestAnimationFrame(animate);

    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
    };
  }, [currentPhrase, isErasing, currentPhraseIndex, phrases]);

  const getCharacterColor = (index) => {
    const totalChars = currentPhrase.replace(/\s/g, '').length;
    let charPosition = 0;
    
    for (let i = 0; i <= index; i++) {
      if (currentPhrase[i] !== ' ') {
        charPosition++;
      }
    }
    
    const position = (charPosition - 1) / (totalChars - 1);
    
    if (position < 0.5) {
      const localPos = position / 0.5;
      const r = Math.round(236 + (168 - 236) * localPos);
      const g = Math.round(72 + (85 - 72) * localPos);
      const b = Math.round(153 + (247 - 153) * localPos);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const localPos = (position - 0.5) / 0.5;
      const r = Math.round(168 + (129 - 168) * localPos);
      const g = Math.round(85 + (140 - 85) * localPos);
      const b = Math.round(247 + (248 - 247) * localPos);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  return (
    <span
      style={{
        display: 'inline-block',
        whiteSpace: 'pre',
        textAlign: 'left',
        flexShrink: 1,
        paddingBottom: '0.15em',
        willChange: 'contents'
      }}
      aria-label={currentPhrase}
    >
      {display.map((d, i) => (
        <span
          key={i}
          style={{
            color: d.isSpace ? 'transparent' : getCharacterColor(i),
            opacity: d.isScrambled ? 0.4 : 1,
            display: 'inline',
            transition: 'opacity 0.15s ease-out'
          }}
        >
          {d.char}
        </span>
      ))}
    </span>
  );
}