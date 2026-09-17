const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const importTarget = `import { useState, useRef, useEffect } from "react";`;
const importReplace = `import { useState, useRef, useEffect } from "react";\nimport { NeonBackground } from "./NeonBackground";`;

code = code.replace(importTarget, importReplace);

const bgTarget = `        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div 
            className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[#D4FF00]/40 blur-[100px]"
            animate={{ y: [0, -120, 50, 0], x: [0, 50, -50, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-[30%] -right-[10%] w-[600px] h-[600px] rounded-full bg-purple-600/30 blur-[120px]"
            animate={{ y: [0, -120, 50, 0], x: [0, 50, -50, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
          />
          <motion.div 
            className="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] rounded-full bg-indigo-500/30 blur-[100px]"
            animate={{ y: [0, -120, 50, 0], x: [0, 50, -50, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>`;

const bgReplace = `        {/* Heavily Animated Neon Background */}
        <NeonBackground />`;

code = code.replace(bgTarget, bgReplace);
fs.writeFileSync('src/app/page.tsx', code);
