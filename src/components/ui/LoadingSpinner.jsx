"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingSpinner({ 
  progress = 0
}) {
  const segments = 12;
  const activeColor = "#00FF00"; // NEON GREEN
  const inactiveColor = "#FFFFFF"; // WHITE
  
  const [activated, setActivated] = useState(Array(12).fill(false));
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    // Update display progress
    setDisplayProgress(progress);
    
    // Calculate active bars - use Math.ceil to reach 12 at 100%
    const activeSpokes = Math.ceil((progress / 100) * 12);
    setActivated(Array(12).fill(false).map((_, i) => i < activeSpokes));
  }, [progress]);

  const containerSize = 340; // BIGGER CONTAINER
  const barWidth = 18; // BOLDER BARS (increased from 14)
  const barHeight = 45; // TALL BARS
  const radius = 115; // MORE SPACE FROM CENTER

  return (
    <div style={{ 
      width: containerSize,
      height: containerSize,
      position: "relative",
      margin: "0 auto",
      backgroundColor: "transparent"
    }}>
      {/* 12 BARS */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const angle = (i * 30) - 90;
        const angleRad = (angle * Math.PI) / 180;
        
        const x = containerSize / 2 + radius * Math.cos(angleRad);
        const y = containerSize / 2 + radius * Math.sin(angleRad);
        
        const isActive = activated[i];
        
        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              left: x - barWidth / 2,
              top: y - barHeight / 2,
              width: barWidth,
              height: barHeight,
              borderRadius: barWidth / 2,
              transform: `rotate(${angle + 90}deg)`,
              transformOrigin: "center",
              boxShadow: isActive 
                ? `0 0 8px rgba(0, 255, 0, 0.6), 0 0 15px rgba(0, 255, 0, 0.3)` 
                : "none"
            }}
            animate={{
              backgroundColor: isActive ? activeColor : inactiveColor,
              scaleY: isActive ? [1, 1.6, 1] : 1
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        );
      })}

      {/* PERCENTAGE */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 64,
        fontWeight: 700,
        color: "#FFFFFF",
        userSelect: "none",
        textShadow: "0 0 20px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.5)"
      }}>
        {Math.round(displayProgress)}%
      </div>
    </div>
  );
}