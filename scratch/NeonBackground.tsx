"use client";
import { motion } from "framer-motion";

export function NeonBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-black">
      {/* SVG Grain Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-10 z-20 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Layer 1: Dark Charcoal Flow (Bottom Right) */}
      <motion.div
        className="absolute -bottom-[20%] -right-[10%] w-[100%] h-[100%] bg-[#0f0f0f] rounded-[100%] blur-[160px] mix-blend-lighten opacity-80"
        animate={{
          x: [0, -40, 20, -30, 0],
          y: [0, -60, 30, -20, 0],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 2: Deep Slate Flow (Top Left) */}
      <motion.div
        className="absolute -top-[30%] -left-[20%] w-[120%] h-[120%] bg-[#121212] rounded-[100%] blur-[180px] mix-blend-screen opacity-90"
        animate={{
          x: [0, 60, -30, 50, 0],
          y: [0, 50, -40, 30, 0],
          scale: [1, 1.05, 0.9, 1.1, 1],
        }}
        transition={{ duration: 55, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 3: Ultra-Subtle Neon Lime Core (Center Right) */}
      <motion.div
        className="absolute top-[20%] right-[5%] w-[80%] h-[100%] bg-[#D4FF00] rounded-[100%] blur-[200px] opacity-[0.03] mix-blend-screen"
        animate={{
          x: [0, -80, 40, -50, 0],
          y: [0, 100, -50, 60, 0],
          scale: [1, 1.2, 0.8, 1.1, 1],
        }}
        transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 4: Organic Mid-tone Smoke (Center Bottom) */}
      <motion.div
        className="absolute top-[40%] left-[10%] w-[90%] h-[90%] bg-[#1a1a1a] rounded-[100%] blur-[150px] opacity-50 mix-blend-screen"
        animate={{
          x: [0, 50, -60, 30, 0],
          y: [0, -80, 40, -30, 0],
        }}
        transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Vignette / Edge Fades */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/30 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_100%)] opacity-[0.85] z-10 pointer-events-none" />
    </div>
  );
}
