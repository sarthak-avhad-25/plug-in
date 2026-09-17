const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `      {/* LEFT COLUMN - SEARCH & UI */}
      <div id="left-column" className="hidden md:flex w-full md:w-[50%] lg:w-[40%] flex-col border-t-4 md:border-t-0 md:border-l-4 border-[#222222] relative z-20 bg-black text-white overflow-visible drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">`;

const replaceStr = `      {/* LEFT COLUMN - SEARCH & UI */}
      <div id="left-column" className="hidden md:flex w-full md:w-[50%] lg:w-[40%] flex-col border-t-4 md:border-t-0 md:border-l-4 border-[#222222] relative z-20 bg-black text-white overflow-visible drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
        
        {/* Subtle Welcome Greeting */}
        <AnimatePresence>
          {showGreeting && authUser && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse" />
              <span className="text-white font-medium">Welcome back, {authUser.name.split(' ')[0]}</span>
            </motion.div>
          )}
        </AnimatePresence>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
