const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Unify 'Delete' button with other utility buttons
const targetDelete = `className="px-3 py-2 border-2 border-transparent hover:border-red-500 hover:text-red-500 transition-colors  font-bold text-sm"`;
const replaceDelete = `className="px-4 py-2 border-2 border-transparent hover:border-red-500 hover:text-red-500 uppercase font-black text-xs tracking-widest transition-all"`;
code = code.replace(targetDelete, replaceDelete);

// Unify 'New Playlist' button with sidebar playlist buttons
const targetNewPlaylist = `className="w-full border border-[#222222] border-dashed p-4 text-xl font-medium tracking-wide tracking-tight bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white text-white hover:bg-[#000000] hover:text-white transition-colors"`;
const replaceNewPlaylist = `className="w-full border-2 border-white/20 border-dashed p-4 text-xl font-medium tracking-wide tracking-tight bg-[#000000]/70 backdrop-blur-xl text-white hover:border-[#D4FF00] hover:text-[#D4FF00] transition-colors"`;
code = code.replace(targetNewPlaylist, replaceNewPlaylist);

fs.writeFileSync('src/app/page.tsx', code);
