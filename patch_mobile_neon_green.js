const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `              {/* Ambient Background */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#020005]">
                <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[120%] bg-blue-700/30 rounded-full blur-[100px] mix-blend-screen opacity-60" />
                <div className="absolute top-[20%] right-[5%] w-[80%] h-[80%] bg-fuchsia-600/30 rounded-full blur-[120px] mix-blend-screen opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />`;

const replaceStr = `              {/* Ambient Background */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#020005]">
                <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[120%] bg-blue-700/30 rounded-full blur-[100px] mix-blend-screen opacity-60" />
                <div className="absolute top-[20%] right-[5%] w-[80%] h-[80%] bg-fuchsia-600/30 rounded-full blur-[120px] mix-blend-screen opacity-70" />
                <div className="absolute bottom-[10%] -left-[10%] w-[60%] h-[60%] bg-[#D4FF00]/10 rounded-full blur-[100px] mix-blend-screen opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
