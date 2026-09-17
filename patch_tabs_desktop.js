const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `                   {/* Secondary Controls */}
                   <div className="flex items-center justify-between w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/5">`;
const replaceStr = `                   {/* Clean Navigation Section */}
                   <div className="flex items-center justify-between w-full border-t border-white/10 pt-6">
                     <div className="flex items-center gap-6">
                       <button onClick={() => setPlayerTab(playerTab === 'queue' ? null : 'queue')} className={\`text-xs font-bold uppercase tracking-widest transition-colors \${playerTab === 'queue' ? 'text-[#D4FF00]' : 'text-white/50 hover:text-white'}\`}>Up Next</button>
                       <button onClick={() => setPlayerTab(playerTab === 'lyrics' ? null : 'lyrics')} className={\`text-xs font-bold uppercase tracking-widest transition-colors \${playerTab === 'lyrics' ? 'text-[#D4FF00]' : 'text-white/50 hover:text-white'}\`}>Lyrics</button>
                       <button onClick={() => setPlayerTab(playerTab === 'related' ? null : 'related')} className={\`text-xs font-bold uppercase tracking-widest transition-colors \${playerTab === 'related' ? 'text-[#D4FF00]' : 'text-white/50 hover:text-white'}\`}>Related</button>
                     </div>
                     <div className="flex items-center gap-6">
                       <div className="relative" onMouseLeave={() => setShowVolumeSlider(false)}>
                         <button onMouseEnter={() => setShowVolumeSlider(true)} onClick={() => setIsMuted(!isMuted)} className="text-white/40 hover:text-white transition-colors" title="Volume" aria-label="Volume">
                           {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : volume < 0.5 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                         </button>
                         <AnimatePresence>
                           {showVolumeSlider && (
                             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 shadow-xl z-50 flex items-center justify-center h-32 w-10">
                               <div className="relative w-full h-full flex items-center justify-center">
                                 <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={(e) => { setIsMuted(false); setVolume(parseFloat(e.target.value)); }} className="appearance-none bg-white/20 h-1 w-24 rounded-full outline-none transform -rotate-90 origin-center cursor-pointer absolute" style={{ WebkitAppearance: 'none', background: \`linear-gradient(to right, #D4FF00 0%, #D4FF00 \${(isMuted ? 0 : volume)*100}%, rgba(255,255,255,0.2) \${(isMuted ? 0 : volume)*100}%, rgba(255,255,255,0.2) 100%)\` }} />
                               </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                       </div>
                       <div className="relative">
                         <button onClick={(e) => handleShare(currentSong, e)} className="text-white/40 hover:text-white transition-colors" aria-label="Share">
                           <Share className="w-5 h-5" />
                         </button>
                         {copiedLink && (
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#D4FF00] text-black text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2">
                             Copied
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                   {/* Hidden Old Secondary Controls Wrapper to avoid regex breakage */}`;

code = code.replace(targetStr, replaceStr + "\n                   <div className=\"hidden flex items-center justify-between w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/5\">");
fs.writeFileSync('src/app/page.tsx', code);
