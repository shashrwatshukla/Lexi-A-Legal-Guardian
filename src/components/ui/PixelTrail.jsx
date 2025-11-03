'use client';

import { useEffect, useRef } from 'react';
import './PixelTrail.css';

export default function PixelTrail() {
  const containerRef = useRef(null);
  const trailRef = useRef([]);

  useEffect(() => {
    // Only run on desktop
    if (typeof window === 'undefined' || window.innerWidth < 768) return;

    const container = containerRef.current;
    if (!container) return;

    const pixelSize = 60; // 60px pixels as requested
    const cols = Math.ceil(window.innerWidth / pixelSize);
    const rows = Math.ceil(window.innerHeight / pixelSize);
    const totalPixels = cols * rows;

    console.log('🟢 Creating pixels:', totalPixels);

    // Clear existing
    container.innerHTML = '';
    
    // Set grid
    container.style.gridTemplateColumns = `repeat(${cols}, ${pixelSize}px)`;
    container.style.gridTemplateRows = `repeat(${rows}, ${pixelSize}px)`;

    // Trail opacity levels - progressively darker as you go back in trail
    const trailLevels = [
      0.95,  // Current (darkest)
      0.90,  // 1 pixel back
      0.82,  // 2 pixels back
      0.74,  // 3 pixels back
      0.65,  // 4 pixels back
      0.56,  // 5 pixels back
      0.47,  // 6 pixels back
      0.38,  // 7 pixels back
      0.30,  // 8 pixels back
      0.23,  // 9 pixels back
      0.17,  // 10 pixels back
      0.12,  // 11 pixels back
      0.08,  // 12 pixels back
      0.05,  // 13 pixels back
      0.03,  // 14 pixels back
      0.01   // 15 pixels back (lightest before fade)
    ];

    // Create pixels with trail effect
    for (let i = 0; i < totalPixels; i++) {
      const pixel = document.createElement('div');
      pixel.className = 'pixel-item';
      pixel.style.width = `${pixelSize}px`;
      pixel.style.height = `${pixelSize}px`;
      pixel.style.backgroundColor = 'transparent';
      pixel.style.transition = 'none';
      
      let fadeInterval = null;
      
      pixel.addEventListener('mouseenter', function() {
        // Stop any ongoing fade
        if (fadeInterval) {
          clearInterval(fadeInterval);
        }
        
        // Add to trail
        trailRef.current.unshift(this);
        
        // Limit trail length
        if (trailRef.current.length > trailLevels.length) {
          trailRef.current.pop();
        }
        
        // Update all pixels in trail with progressive darkness
        trailRef.current.forEach((trailPixel, index) => {
          if (index < trailLevels.length) {
            trailPixel.style.backgroundColor = `rgba(34, 197, 94, ${trailLevels[index]})`;
            trailPixel.style.transition = 'background-color 0.08s ease-out';
          }
        });
      });
      
      pixel.addEventListener('mouseleave', function() {
        const self = this;
        let currentOpacity = 0.95;
        let fadeStep = 0;
        
        // Gradual fade out stages
        const fadeDurations = [
          { opacity: 0.75, delay: 150 },
          { opacity: 0.55, delay: 150 },
          { opacity: 0.38, delay: 150 },
          { opacity: 0.24, delay: 150 },
          { opacity: 0.14, delay: 150 },
          { opacity: 0.07, delay: 150 },
          { opacity: 0.03, delay: 150 },
          { opacity: 0, delay: 150 }
        ];
        
        fadeInterval = setInterval(() => {
          if (fadeStep >= fadeDurations.length) {
            clearInterval(fadeInterval);
            self.style.backgroundColor = 'transparent';
            
            // Remove from trail
            const index = trailRef.current.indexOf(self);
            if (index > -1) {
              trailRef.current.splice(index, 1);
            }
            return;
          }
          
          const stage = fadeDurations[fadeStep];
          self.style.backgroundColor = `rgba(34, 197, 94, ${stage.opacity})`;
          self.style.transition = `background-color ${stage.delay}ms ease-out`;
          
          fadeStep++;
        }, 150);
      });
      
      container.appendChild(pixel);
    }
    
    console.log('✅ Pixels with progressive trail effect ready!');

    // Cleanup
    return () => {
      if (container) {
        container.innerHTML = '';
      }
      trailRef.current = [];
    };
  }, []);

  return <div ref={containerRef} className="pixel-trail-container" />;
}