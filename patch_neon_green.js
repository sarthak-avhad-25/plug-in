const fs = require('fs');
let code = fs.readFileSync('src/app/NeonBackground.tsx', 'utf-8');

const targetStr = `      {/* Layer 5: Dark Gradient Overlay (fades from left to right) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />`;

const replaceStr = `      {/* Layer 5: Neon Green Brand Accent */}
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
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/NeonBackground.tsx', code);
