const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `                   {/* Secondary Controls */}
                   <div className="flex items-center justify-between w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/5">
                     <button className="text-white/40 hover:text-white transition-colors"><Volume2 className="w-6 h-6" /></button>
                     <div className="flex items-center gap-8">
                       <button 
                         onClick={(e) => toggleLike(currentSong, e)}
                         className="text-white/40 hover:text-white transition-transform active:scale-90"
                       >
                         <Heart className={\`w-6 h-6 transition-colors \${playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong?.id) ? 'fill-[#1ED760] text-[#1ED760]' : 'hover:text-white'}\`} />
                       </button>
                       <button className="text-white/40 hover:text-white transition-transform active:scale-90"><Share className="w-6 h-6" /></button>
                       {hasHeadphones && <Headphones className="w-6 h-6 text-white/40" />}
                     </div>
                     <button onClick={() => setIsLyricsExpanded(!isLyricsExpanded)} className={\`transition-colors \${isLyricsExpanded ? 'text-white' : 'text-white/40 hover:text-white'}\`}>
                       <ListMusic className="w-6 h-6" />
                     </button>
                   </div>`;

const replaceStr = `                   {/* Secondary Controls */}
                   <div className="flex items-center justify-between w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/5">
                     <div className="relative" onMouseLeave={() => setShowVolumeSlider(false)}>
                       <button 
                         onMouseEnter={() => setShowVolumeSlider(true)}
                         onClick={() => setIsMuted(!isMuted)} 
                         className="text-white/40 hover:text-white transition-colors"
                         title="Volume"
                         aria-label="Volume"
                       >
                         {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : volume < 0.5 ? <Volume1 className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                       </button>
                       <AnimatePresence>
                         {showVolumeSlider && (
                           <motion.div 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: 10 }}
                             className="absolute bottom-full left-0 mb-4 bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-xl z-50 flex items-center justify-center h-32 w-12"
                           >
                             <div className="relative w-full h-full flex items-center justify-center">
                               <input 
                                 type="range" min="0" max="1" step="0.01" 
                                 value={isMuted ? 0 : volume} 
                                 onChange={(e) => { setIsMuted(false); setVolume(parseFloat(e.target.value)); }} 
                                 className="appearance-none bg-white/20 h-1 w-24 rounded-full outline-none transform -rotate-90 origin-center cursor-pointer absolute"
                                 style={{ WebkitAppearance: 'none', background: \`linear-gradient(to right, #D4FF00 0%, #D4FF00 \${(isMuted ? 0 : volume)*100}%, rgba(255,255,255,0.2) \${(isMuted ? 0 : volume)*100}%, rgba(255,255,255,0.2) 100%)\` }}
                               />
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                     <div className="flex items-center gap-8 relative">
                       <button 
                         onClick={(e) => toggleLike(currentSong, e)}
                         className="text-white/40 hover:text-white transition-transform active:scale-90"
                       >
                         <Heart className={\`w-6 h-6 transition-colors \${playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong?.id) ? 'fill-[#1ED760] text-[#1ED760]' : 'hover:text-white'}\`} />
                       </button>
                       <div className="relative">
                         <button onClick={(e) => handleShare(currentSong, e)} className="text-white/40 hover:text-white transition-transform active:scale-90" title="Share" aria-label="Share">
                           <Share className="w-6 h-6" />
                         </button>
                         {copiedLink && (
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#D4FF00] text-black text-xs font-bold px-2 py-1 rounded whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2">
                             Link copied
                           </div>
                         )}
                       </div>
                       {hasHeadphones && <Headphones className="w-6 h-6 text-white/40" />}
                     </div>
                     <div className="flex items-center gap-4">
                       <button onClick={() => { setIsQueueExpanded(!isQueueExpanded); setIsLyricsExpanded(false); }} className={\`transition-colors \${isQueueExpanded ? 'text-white' : 'text-white/40 hover:text-white'}\`} title="Queue" aria-label="Queue">
                         <ListMusic className="w-6 h-6" />
                       </button>
                       <button onClick={() => { setIsLyricsExpanded(!isLyricsExpanded); setIsQueueExpanded(false); }} className={\`transition-colors \${isLyricsExpanded ? 'text-white' : 'text-white/40 hover:text-white'}\`} title="Lyrics" aria-label="Lyrics">
                         <Quote className="w-6 h-6" />
                       </button>
                     </div>
                   </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
