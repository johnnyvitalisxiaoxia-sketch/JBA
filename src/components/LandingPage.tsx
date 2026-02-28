import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Activity, Users } from 'lucide-react';

interface LandingPageProps {
  onEnter: (mode: number) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [step, setStep] = useState<'intro' | 'mode'>('intro');

  return (
    <div className="relative min-h-screen w-full bg-[#030303] overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Animated Bottom Glow - Smooth color transition */}
      <motion.div 
        className="absolute -bottom-[40%] left-1/2 -translate-x-1/2 w-[150vw] h-[80vh] rounded-[100%] blur-[120px] opacity-80 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, #ff0000 0%, #7f0000 30%, #1a0000 60%, transparent 80%)'
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, transparent 10%, black 50%, transparent 90%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 10%, black 50%, transparent 90%)'
        }}
      />

      <AnimatePresence mode="wait">
        {step === 'intro' ? (
          <motion.div 
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="text-center relative"
            >
              {/* Background glow for the text */}
              <div className="absolute inset-0 blur-[60px] bg-red-900/20 rounded-full" />
              
              <h1 
                className="text-[25vw] md:text-[280px] font-black tracking-tighter leading-none relative z-10"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  background: 'linear-gradient(180deg, #0a0a0a 0%, #3f0000 40%, #ff0000 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 15px 25px rgba(255, 0, 0, 0.4))'
                }}
              >
                JBA
              </h1>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
                className="flex items-center justify-center gap-4 mt-6"
              >
                <Activity className="w-5 h-5 text-red-500" />
                <p className="text-red-500/90 font-mono tracking-[0.5em] text-sm md:text-xl uppercase font-bold text-shadow-sm">
                  Tactical Analysis Engine
                </p>
                <Activity className="w-5 h-5 text-red-500" />
              </motion.div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              onClick={() => setStep('mode')}
              className="mt-24 group relative px-10 py-4 bg-transparent overflow-hidden rounded-full border border-red-900/50 hover:border-red-500 transition-all duration-500 cursor-pointer"
            >
              <div className="absolute inset-0 bg-red-950/30 group-hover:bg-red-900/50 transition-colors duration-500" />
              <div className="relative z-10 flex items-center gap-3 text-red-500 group-hover:text-red-400 font-mono tracking-widest text-sm transition-colors duration-500 font-bold">
                INITIALIZE SYSTEM
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(220,38,38,0.2)] rounded-full group-hover:shadow-[inset_0_0_30px_rgba(220,38,38,0.4)] transition-shadow duration-500" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="mode"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-12 font-mono tracking-widest text-shadow-sm flex items-center gap-4">
              <Users className="w-8 h-8 md:w-12 md:h-12 text-red-500" />
              SELECT MATCH MODE
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              {[3, 4, 5].map((mode) => (
                <button
                  key={mode}
                  onClick={() => onEnter(mode)}
                  className="group relative px-12 py-8 bg-black/40 backdrop-blur-md border border-red-900/50 rounded-2xl hover:border-red-500 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 group-hover:from-red-400 group-hover:to-red-700 transition-all duration-500" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      {mode}V{mode}
                    </span>
                    <span className="text-xs font-mono text-gray-500 group-hover:text-red-400 tracking-widest uppercase transition-colors duration-500">
                      Tactical Setup
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
