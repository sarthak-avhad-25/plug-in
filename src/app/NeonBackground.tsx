"use client";
import { motion } from "framer-motion";

export function NeonBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#000000]">
      {/* 
        Subtle dark atmospheric background.
        Deep black base with subtle charcoal gradients and extremely subtle neon-lime glow.
      */}

      {/* Layer 1: Charcoal Organic Shape */}
      <motion.div
        className="absolute -top-[10%] -right-[10%] w-[80%] h-[80%] bg-[#1a1a1a]/40 rounded-[100%] blur-[120px]"
        animate={{
          scale: [1, 1.05, 0.95, 1],
          rotate: [0, 10, -5, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 2: Deep Dark Base Shape */}
      <motion.div
        className="absolute top-[40%] right-[10%] w-[60%] h-[60%] bg-[#0f0f0f]/50 rounded-[100%] blur-[100px]"
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 40, -20, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 3: Extremely Subtle Neon-Lime Glow */}
      <motion.div
        className="absolute top-[20%] right-[20%] w-[50%] h-[50%] bg-[#D4FF00]/5 rounded-[100%] blur-[140px]"
        animate={{
          x: [0, -40, 20, 0],
          y: [0, -30, 30, 0],
          scale: [1, 1.2, 0.8, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Dark Gradient Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />
    </div>
  );
}
