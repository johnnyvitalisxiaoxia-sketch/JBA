import React from 'react';
import { motion } from 'motion/react';

const CourtBase = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,255,255,0.2)]">
    <rect x="0" y="0" width="100" height="100" fill="#020617" rx="4" />
    <path d="M 0,0 L 100,0 L 100,100 L 0,100 Z" stroke="#00ffff" strokeWidth="0.5" fill="none" opacity="0.3" />
    <rect x="35" y="0" width="30" height="45" stroke="#00ffff" strokeWidth="0.5" fill="none" opacity="0.3" />
    <path d="M 35,45 A 15 15 0 0 0 65 45" stroke="#00ffff" strokeWidth="0.5" fill="none" opacity="0.3" strokeDasharray="2,2" />
    <path d="M 35,45 A 15 15 0 0 1 65 45" stroke="#00ffff" strokeWidth="0.5" fill="none" opacity="0.3" />
    <path d="M 10,0 L 10,25 A 40 40 0 0 0 90 25 L 90,0" stroke="#00ffff" strokeWidth="0.5" fill="none" opacity="0.3" />
    <line x1="45" y1="5" x2="55" y2="5" stroke="#00ffff" strokeWidth="1.5" />
    <circle cx="50" cy="8" r="3" stroke="#f97316" strokeWidth="0.8" fill="none" />
    {children}
  </svg>
);

const PlayerNode = ({ x, y, label, color = "#00ffff", delay = 0 }: { x: number | number[], y: number | number[], label: string, color?: string, delay?: number }) => (
  <motion.g 
    initial={Array.isArray(x) ? { x: x[0], y: y[0] } : { x, y }}
    animate={{ x, y }} 
    transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", delay }}
  >
    <circle cx={0} cy={0} r="4" fill={color} opacity="0.8" />
    <circle cx={0} cy={0} r="6" stroke={color} strokeWidth="0.5" fill="none" opacity="0.5" />
    <text x={0} y={1.2} fontSize="3.5" fill="#fff" textAnchor="middle" dominantBaseline="middle" className="font-mono font-bold">{label}</text>
  </motion.g>
);

const StructureVisual = () => {
  const points = [
    { x: 50, y: 20 }, { x: 80, y: 45 }, { x: 65, y: 80 }, { x: 35, y: 80 }, { x: 20, y: 45 }
  ];
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]">
      <rect x="0" y="0" width="100" height="100" fill="#020617" rx="4" />
      {points.map((p1, i) => 
        points.map((p2, j) => i < j && (
          <motion.line 
            key={`${i}-${j}`}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke="#00ffff" strokeWidth="0.5"
            initial={{ opacity: 0.1 }}
            animate={{ opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, delay: (i+j)*0.2 }}
          />
        ))
      )}
      {points.map((p, i) => (
        <PlayerNode key={i} x={p.x} y={p.y} label={`P${i+1}`} />
      ))}
    </svg>
  );
};

const PositionsVisual = () => (
  <CourtBase>
    <PlayerNode x={[50, 50]} y={[90, 75]} label="1" delay={0} />
    <PlayerNode x={[50, 20]} y={[90, 45]} label="2" delay={0.2} />
    <PlayerNode x={[50, 80]} y={[90, 45]} label="3" delay={0.4} />
    <PlayerNode x={[50, 35]} y={[90, 25]} label="4" delay={0.6} />
    <PlayerNode x={[50, 65]} y={[90, 25]} label="5" delay={0.8} />
  </CourtBase>
);

const RolesVisual = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]">
    <rect x="0" y="0" width="100" height="100" fill="#020617" rx="4" />
    {[20, 35, 50].map(r => (
      <circle key={r} cx="50" cy="50" r={r} stroke="#00ffff" strokeWidth="0.5" fill="none" opacity="0.3" strokeDasharray="2,2" />
    ))}
    <line x1="50" y1="0" x2="50" y2="100" stroke="#00ffff" strokeWidth="0.5" opacity="0.3" />
    <line x1="0" y1="50" x2="100" y2="50" stroke="#00ffff" strokeWidth="0.5" opacity="0.3" />
    
    <motion.polygon 
      points="50,15 80,40 65,80 35,80 20,40"
      fill="#00ffff" opacity="0.1" stroke="#00ffff" strokeWidth="1"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
      style={{ transformOrigin: '50px 50px' }}
    />
    
    <motion.g style={{ transformOrigin: '50px 50px' }} animate={{ rotate: 360 }} transition={{ duration: 4, ease: "linear", repeat: Infinity }}>
      <path d="M 50,50 L 50,0 A 50 50 0 0 1 85.3,14.6 Z" fill="url(#radarGrad)" opacity="0.5" />
    </motion.g>
    
    <defs>
      <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00ffff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <PlayerNode x={50} y={50} label="CORE" color="#f97316" />
  </svg>
);

const OffenseVisual = () => (
  <CourtBase>
    {/* Pick and Roll Animation */}
    <PlayerNode x={[50, 30, 30]} y={[75, 60, 60]} label="1" />
    <PlayerNode x={[65, 40, 50]} y={[30, 55, 20]} label="5" color="#f97316" />
    <PlayerNode x={15} y={40} label="2" />
    <PlayerNode x={85} y={40} label="3" />
    <PlayerNode x={35} y={20} label="4" />
    
    {/* Ball */}
    <motion.circle 
      r="2" fill="#f97316"
      animate={{ 
        x: [50, 30, 50], 
        y: [70, 55, 20] 
      }}
      transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
    />
    
    {/* Movement paths */}
    <path d="M 50,75 L 30,60" stroke="#00ffff" strokeWidth="0.5" strokeDasharray="2,2" fill="none" opacity="0.5" />
    <path d="M 65,30 L 40,55 L 50,20" stroke="#f97316" strokeWidth="0.5" strokeDasharray="2,2" fill="none" opacity="0.5" />
  </CourtBase>
);

const DefenseVisual = () => (
  <CourtBase>
    {/* 2-3 Zone Shifting */}
    <PlayerNode x={[35, 25, 45]} y={[40, 40, 40]} label="1" />
    <PlayerNode x={[65, 55, 75]} y={[40, 40, 40]} label="2" />
    <PlayerNode x={[20, 10, 30]} y={[20, 20, 20]} label="3" />
    <PlayerNode x={[50, 40, 60]} y={[20, 20, 20]} label="5" color="#f97316" />
    <PlayerNode x={[80, 70, 90]} y={[20, 20, 20]} label="4" />
    
    {/* Zone Highlight */}
    <motion.path 
      d="M 15,15 L 85,15 L 75,45 L 25,45 Z" 
      fill="#00ffff" opacity="0.1" stroke="#00ffff" strokeWidth="0.5" strokeDasharray="4,4"
      animate={{ x: [0, -10, 10] }}
      transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
    />
  </CourtBase>
);

const PossessionVisual = () => {
  const nodes = [{x: 20, y: 20}, {x: 80, y: 20}, {x: 20, y: 80}, {x: 80, y: 80}];
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]">
      <rect x="0" y="0" width="100" height="100" fill="#020617" rx="4" />
      {nodes.map((n, i) => (
        <g key={i}>
          <line x1="50" y1="50" x2={n.x} y2={n.y} stroke="#00ffff" strokeWidth="1" opacity="0.3" />
          <motion.circle 
            cx={50} cy={50} r="2" fill="#00ffff"
            animate={{ cx: n.x, cy: n.y, opacity: [1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
          />
          <PlayerNode x={n.x} y={n.y} label={`P${i+2}`} />
        </g>
      ))}
      <PlayerNode x={50} y={50} label="PG" color="#f97316" />
      <motion.circle 
        cx="50" cy="50" r="15" stroke="#f97316" strokeWidth="0.5" fill="none" strokeDasharray="4,4"
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: '50px 50px' }}
      />
    </svg>
  );
};

export const TacticalVisuals = ({ type }: { type: string }) => {
  switch (type) {
    case 'structure': return <StructureVisual />;
    case 'positions': return <PositionsVisual />;
    case 'roles': return <RolesVisual />;
    case 'offense': return <OffenseVisual />;
    case 'defense': return <DefenseVisual />;
    case 'possession': return <PossessionVisual />;
    default: return <StructureVisual />;
  }
};
