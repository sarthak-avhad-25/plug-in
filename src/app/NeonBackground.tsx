"use client";
import { motion } from "framer-motion";

export function NeonBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#020005]">
      {/* 
        We use multiple layered motion.divs to create an organic, liquid neon flow.
        The right side is intense, fading towards the center/left. 
      */}

      {/* Layer 1: Deep Blue Base (Right) */}
      <motion.div
        className="absolute top-[10%] -right-[20%] w-[120%] h-[120%] bg-blue-700/40 rounded-[100%] blur-[120px] mix-blend-screen"
        animate={{
          scale: [1, 1.1, 0.9, 1.05, 1],
          rotate: [0, 15, -10, 5, 0],
          opacity: [0.6, 0.8, 0.5, 0.7, 0.6],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      {/* Layer 2: Electric Purple / Magenta Core */}
      <motion.div
        className="absolute top-[30%] right-[5%] w-[80%] h-[80%] bg-fuchsia-600/40 rounded-[100%] blur-[150px] mix-blend-screen"
        animate={{
          x: [0, -50, 30, -20, 0],
          y: [0, 40, -60, 20, 0],
          scale: [1, 1.2, 0.8, 1.1, 1],
          opacity: [0.5, 0.9, 0.4, 0.8, 0.5],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 3: Cyan Highlights */}
      <motion.div
        className="absolute -top-[10%] right-[10%] w-[60%] h-[60%] bg-cyan-400/30 rounded-[100%] blur-[140px] mix-blend-screen"
        animate={{
          x: [0, -80, 50, -40, 0],
          y: [0, -50, 80, -30, 0],
          scale: [1, 1.4, 0.9, 1.3, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 4: Pink Glow */}
      <motion.div
        className="absolute bottom-[0%] right-[0%] w-[70%] h-[70%] bg-pink-500/30 rounded-[100%] blur-[160px] mix-blend-screen"
        animate={{
          x: [0, -100, 60, -30, 0],
          y: [0, -80, 40, -50, 0],
          rotate: [0, -20, 15, -10, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 5: Neon Green Brand Accent */}
      <motion.div
        className="absolute top-[50%] right-[15%] w-[40%] h-[40%] bg-[#D4FF00]/15 rounded-[100%] blur-[120px] mix-blend-screen"
        animate={{
          x: [0, -60, 40, -30, 0],
          y: [0, 50, -40, 20, 0],
          scale: [1, 1.3, 0.8, 1.2, 1],
          opacity: [0.3, 0.6, 0.2, 0.5, 0.3],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 6: Dark Gradient Overlay (fades from left to right) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />

      {/* Subtle Particles / Dust */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            top: (Math.random() * 100) + "%",
            left: (60 + Math.random() * 40) + "%",
          }}
          animate={{
            y: [0, -200 - Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0, 0.6, 0],
            scale: [0, Math.random() * 2 + 1, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 15,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
