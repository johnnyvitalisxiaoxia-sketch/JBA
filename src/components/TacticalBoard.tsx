import React from 'react';
import { motion } from 'motion/react';
import { AnalysisResult } from '../types';

interface Props {
  activeTab: keyof AnalysisResult;
}

export default function TacticalBoard({ activeTab }: Props) {
  const getPlayerAnimation = (num: number) => {
    const basePositions = {
      1: { x: 250, y: 80 },
      2: { x: 80, y: 180 },
      3: { x: 420, y: 180 },
      4: { x: 170, y: 320 },
      5: { x: 330, y: 320 },
    };

    if (activeTab === 'offense') {
      // Pick and roll animation
      if (num === 1) return { x: [250, 250, 350, 350, 250], y: [80, 80, 150, 350, 80] };
      if (num === 5) return { x: [330, 280, 280, 250, 330], y: [320, 100, 100, 350, 320] };
      if (num === 2) return { x: [80, 80, 60, 80], y: [180, 180, 250, 180] };
      if (num === 3) return { x: [420, 420, 440, 420], y: [180, 180, 250, 180] };
      if (num === 4) return { x: [170, 100, 100, 170], y: [320, 380, 380, 320] };
    }

    if (activeTab === 'defense') {
      // 2-3 Zone shifting
      if (num === 1) return { x: [190, 140, 240, 190], y: [180, 200, 180, 180] };
      if (num === 2) return { x: [310, 260, 360, 310], y: [180, 180, 200, 180] };
      if (num === 3) return { x: [100, 80, 150, 100], y: [320, 350, 300, 320] };
      if (num === 4) return { x: [400, 350, 420, 400], y: [320, 300, 350, 320] };
      if (num === 5) return { x: [250, 200, 300, 250], y: [350, 350, 350, 350] };
    }

    // Default static with slight float
    const pos = basePositions[num as keyof typeof basePositions];
    return { 
      x: [pos.x, pos.x, pos.x], 
      y: [pos.y, pos.y - 8, pos.y] 
    };
  };

  return (
    <div className="relative w-full aspect-[10/9] mx-auto">
      <svg viewBox="0 0 500 450" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,255,255,0.2)]">
        {/* Court Lines */}
        <rect x="10" y="10" width="480" height="430" fill="rgba(10, 15, 30, 0.4)" stroke="#00ffff" strokeWidth="2" strokeOpacity="0.5" rx="10" />
        
        {/* Paint */}
        <rect x="170" y="250" width="160" height="190" fill="rgba(0, 255, 255, 0.05)" stroke="#00ffff" strokeWidth="2" strokeOpacity="0.6" />
        
        {/* Free throw circle */}
        <path d="M 170 250 A 80 80 0 0 1 330 250" fill="none" stroke="#00ffff" strokeWidth="2" strokeOpacity="0.6" strokeDasharray="10,10" />
        <path d="M 170 250 A 80 80 0 0 0 330 250" fill="rgba(0, 255, 255, 0.05)" stroke="#00ffff" strokeWidth="2" strokeOpacity="0.6" />
        
        {/* 3pt line */}
        <path d="M 40 440 L 40 150 A 210 210 0 0 1 460 150 L 460 440" fill="none" stroke="#00ffff" strokeWidth="2" strokeOpacity="0.6" />
        
        {/* Hoop and backboard */}
        <line x1="210" y1="415" x2="290" y2="415" stroke="#fff" strokeWidth="4" strokeOpacity="0.8" />
        <circle cx="250" cy="400" r="12" fill="none" stroke="#ff4444" strokeWidth="3" />
        <line x1="250" y1="415" x2="250" y2="425" stroke="#fff" strokeWidth="2" strokeOpacity="0.5" />

        {/* Players */}
        {[1, 2, 3, 4, 5].map((num) => (
          <motion.g 
            key={num} 
            animate={getPlayerAnimation(num)} 
            transition={{ 
              duration: activeTab === 'offense' || activeTab === 'defense' ? 5 : 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <circle cx="0" cy="0" r="18" fill="rgba(0, 255, 255, 0.15)" stroke="#00ffff" strokeWidth="2" />
            <circle cx="0" cy="0" r="24" fill="none" stroke="#00ffff" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 4">
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
            </circle>
            <text x="0" y="5" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" fontFamily="monospace">{num}</text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
