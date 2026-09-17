const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Issue 16: Wrap the search container in max-w-[1400px] mx-auto
const targetSearchContainer = `<div className="w-full flex flex-col gap-2 mb-8 z-[60] search-container">`;
const replaceSearchContainer = `<div className="w-full max-w-[1400px] mx-auto flex flex-col gap-2 mb-8 z-[60] search-container">`;
code = code.replace(targetSearchContainer, replaceSearchContainer);

// Issue 17: Search input prominence. Remove conflicting 'border' class, increase text size.
const targetSearchInput = `<div className="border-2 border-white/40 bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white shadow-[2px_2px_0_0_rgba(255,255,255,0.3)] group-focus-within:translate-y-px group-focus-within:translate-x-px group-focus-within:shadow-[0px_0px_0_0_#024230] transition-all duration-200">
                <div className="bg-black/50 text-white px-2 py-0.5 inline-block text-[10px] font-medium tracking-wide  tracking-widest border-r-2 border-b-2 border-white/40 backdrop-blur-xl">
                  Track
                </div>
                <input
                  type="text"
                  placeholder="What is the song name?"
                  value={songQuery}
                  onChange={(e) => setSongQuery(e.target.value)}
                  className="w-full bg-transparent text-base font-bold px-3 py-1 outline-none placeholder:text-white/70 text-white"
                />`;

const replaceSearchInput = `<div className="border-2 border-white/60 bg-[#111111]/80 backdrop-blur-xl text-white shadow-[4px_4px_0_0_rgba(255,255,255,0.4)] group-focus-within:translate-y-px group-focus-within:translate-x-px group-focus-within:shadow-[0px_0px_0_0_rgba(255,255,255,0.8)] transition-all duration-200">
                <div className="bg-black/80 text-white px-3 py-1 inline-block text-xs font-bold tracking-widest border-r-2 border-b-2 border-white/60 backdrop-blur-xl">
                  TRACK
                </div>
                <input
                  type="text"
                  placeholder="What is the song name?"
                  value={songQuery}
                  onChange={(e) => setSongQuery(e.target.value)}
                  className="w-full bg-transparent text-lg md:text-xl font-bold px-4 py-3 outline-none placeholder:text-white/50 text-white"
                />`;
code = code.replace(targetSearchInput, replaceSearchInput);

fs.writeFileSync('src/app/page.tsx', code);
