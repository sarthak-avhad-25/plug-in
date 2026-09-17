const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `          {/* Custom Ambient Video to Fill Bottom Space */}
          <div className="w-[40%] max-w-2xl mx-auto mt-12 mb-8 overflow-hidden rounded-[2rem] border border-[#222222] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
            <video 
              src="/video.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"
            />
          </div>`;

code = code.replace(target, '');
fs.writeFileSync('src/app/page.tsx', code);
