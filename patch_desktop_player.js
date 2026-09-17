const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `               <div className="relative overflow-hidden rounded-[32px] bg-[#050505] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col gap-8 transition-all duration-700">
                 {/* Ambient Blur Background */}
                 <div className="absolute inset-0 z-0 opacity-30 mix-blend-screen pointer-events-none">
                   <img src={currentSong.image} className="w-full h-full object-cover blur-[100px] scale-150 transform translate-y-10" alt="" />
                 </div>
                 
                 <div className="relative z-10 flex flex-col items-center">
                   {/* Large Square Artwork */}
                   <motion.div 
                     className="relative w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)] mb-10 border border-white/10"
                     layoutId="album-art-desktop"
                   >
                     <img src={currentSong.image} className="w-full h-full object-cover" alt="album art" />
                   </motion.div>
                   
                   <div className="flex flex-col w-full text-center px-4 mb-10">
                     <span className="text-[11px] font-bold tracking-widest text-white/30 uppercase mb-4">Now Playing</span>
                     <span className="text-4xl font-black tracking-tight text-white mb-2 truncate">{currentSong.title}</span>
                     <span className="text-lg font-medium text-white/50 truncate">{currentSong.artist}</span>
                   </div>
                   
                   {/* Timeline */}
                   <div className="w-full flex flex-col gap-3 cursor-pointer mb-10 px-2 group/timeline" onClick={handleProgressClick}>
                     <div className="h-1.5 w-full rounded-full bg-white/10 relative overflow-hidden transition-all duration-200 group-hover/timeline:h-2">
                       <motion.div 
                         className="absolute top-0 left-0 h-full bg-white rounded-full transition-all ease-linear"
                         style={{ width: \`\${duration ? (progress / duration) * 100 : 0}%\` }}
                       />
                       {/* Thumb */}
                       <div 
                         className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/timeline:opacity-100 transition-opacity"
                         style={{ left: \`calc(\${duration ? (progress / duration) * 100 : 0}% - 8px)\` }}
                       />
                     </div>
                     <div className="flex justify-between text-xs font-medium text-white/40 tracking-wide">
                       <span>{Math.floor(progress / 60)}:{(Math.floor(progress % 60)).toString().padStart(2, "0")}</span>
                       <span>-{Math.floor((duration - progress) / 60)}:{(Math.floor((duration - progress) % 60)).toString().padStart(2, "0")}</span>
                     </div>
                   </div>
                   
                   {/* Main Controls Row */}
                   <div className="flex items-center justify-center gap-10 w-full mb-8">
                     <button onClick={() => setIsShuffleOn(!isShuffleOn)} className={\`transition-colors \${isShuffleOn ? 'text-[#1ED760]' : 'text-white/30 hover:text-white'}\`}><Shuffle className="w-6 h-6" /></button>
                     <button 
                       onClick={playPreviousSong}
                       className={\`text-white hover:text-white/80 transition-transform active:scale-90 \${playbackHistory.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}\`}
                       disabled={playbackHistory.length === 0}
                     >
                       <SkipBack className="w-10 h-10 fill-current" />
                     </button>
                     
                     <button 
                       onClick={togglePlay}
                       className="w-20 h-20 shrink-0 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.15)]"
                     >
                       {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
                     </button>
                     
                     <button 
                       onClick={playNextSong}
                       className={\`text-white hover:text-white/80 transition-transform active:scale-90 \${relatedSongs.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}\`}
                       disabled={relatedSongs.length === 0}
                     >
                       <SkipForward className="w-10 h-10 fill-current" />
                     </button>
                     <button className="text-white/30 hover:text-white transition-colors"><Repeat className="w-6 h-6" /></button>
                   </div>`;

const replaceStr = `               <div className="relative overflow-hidden rounded-[32px] bg-[#020202] p-8 md:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.9)] border border-white/5 flex flex-col gap-10 transition-all duration-700 group/player">
                 
                 {/* Cinematic Gradient Base */}
                 <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                 
                 {/* Extremely subtle artwork glow */}
                 <div className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] z-0 opacity-10 mix-blend-screen pointer-events-none">
                   <img src={currentSong.image} className="w-full h-full object-cover blur-[150px] opacity-60" alt="" />
                 </div>
                 
                 <div className="relative z-10 flex flex-col w-full h-full">
                   
                   {/* Massive Cinematic Artwork */}
                   <motion.div 
                     className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,1)] border border-white/10 mb-8"
                     layoutId="album-art-desktop"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                   >
                     <img src={currentSong.image} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[2s] ease-out" alt="album art" />
                     
                     {/* Artwork Inner Shadow */}
                     <div className="absolute inset-0 rounded-2xl border border-white/10 mix-blend-overlay pointer-events-none" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
                   </motion.div>
                   
                   {/* Info Section (Left-aligned for a modern magazine feel) */}
                   <div className="flex items-end justify-between w-full mb-8">
                     <div className="flex flex-col flex-1 pr-6 min-w-0">
                       <motion.span 
                         key={\`title-\${currentSong.id}\`}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5, delay: 0.1 }}
                         className="text-3xl md:text-4xl font-black tracking-tight text-white mb-1 truncate"
                       >
                         {currentSong.title}
                       </motion.span>
                       <motion.span 
                         key={\`artist-\${currentSong.id}\`}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5, delay: 0.2 }}
                         className="text-lg md:text-xl font-medium text-white/50 truncate tracking-wide"
                       >
                         {currentSong.artist}
                       </motion.span>
                     </div>
                     <button 
                       onClick={(e) => toggleLike(currentSong, e)}
                       className="shrink-0 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                     >
                       <Heart className={\`w-6 h-6 transition-colors \${playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong?.id) ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-white'}\`} />
                     </button>
                   </div>
                   
                   {/* Futuristic Timeline */}
                   <div className="w-full flex flex-col gap-4 cursor-pointer mb-10 px-1 group/timeline" onClick={handleProgressClick}>
                     <div className="h-1.5 w-full rounded-full bg-white/5 relative overflow-hidden transition-all duration-300 hover:h-2 hover:bg-white/10">
                       <motion.div 
                         className="absolute top-0 left-0 h-full bg-[#D4FF00] rounded-full transition-all ease-linear"
                         style={{ width: \`\${duration ? (progress / duration) * 100 : 0}%\` }}
                       />
                       {/* Glowing thumb (only visible on hover for minimalism) */}
                       <div 
                         className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_#D4FF00] opacity-0 group-hover/timeline:opacity-100 transition-opacity"
                         style={{ left: \`calc(\${duration ? (progress / duration) * 100 : 0}% - 8px)\` }}
                       />
                     </div>
                     <div className="flex justify-between text-[11px] font-bold text-white/40 tracking-widest tabular-nums">
                       <span>{Math.floor(progress / 60)}:{(Math.floor(progress % 60)).toString().padStart(2, "0")}</span>
                       <span>-{Math.floor((duration - progress) / 60)}:{(Math.floor((duration - progress) % 60)).toString().padStart(2, "0")}</span>
                     </div>
                   </div>
                   
                   {/* Playback Controls */}
                   <div className="flex items-center justify-between w-full mb-8">
                     <button aria-label="Shuffle" onClick={() => setIsShuffleOn(!isShuffleOn)} className={\`transition-colors p-2 rounded-full hover:bg-white/5 \${isShuffleOn ? 'text-[#D4FF00]' : 'text-white/30 hover:text-white'}\`}>
                       <Shuffle className="w-5 h-5" />
                     </button>
                     
                     <div className="flex items-center gap-6 md:gap-8">
                       <button 
                         aria-label="Previous song"
                         onClick={playPreviousSong}
                         className={\`text-white hover:text-white/80 transition-transform active:scale-90 \${playbackHistory.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}\`}
                         disabled={playbackHistory.length === 0}
                       >
                         <SkipBack className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                       </button>
                       
                       <button 
                         aria-label={isPlaying ? "Pause" : "Play"}
                         onClick={togglePlay}
                         className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full bg-[#D4FF00] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_10px_30px_rgba(212,255,0,0.2)]"
                       >
                         {playbackState === "loading" || playbackState === "buffering" ? (
                           <Loader2 className="w-10 h-10 animate-spin" />
                         ) : isPlaying ? (
                           <Pause className="w-10 h-10 md:w-12 md:h-12 fill-current" />
                         ) : (
                           <Play className="w-10 h-10 md:w-12 md:h-12 fill-current ml-2" />
                         )}
                       </button>
                       
                       <button 
                         aria-label="Next song"
                         onClick={playNextSong}
                         className={\`text-white hover:text-white/80 transition-transform active:scale-90 \${relatedSongs.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}\`}
                         disabled={relatedSongs.length === 0}
                       >
                         <SkipForward className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                       </button>
                     </div>

                     <button aria-label="Repeat" className="text-white/30 hover:text-white hover:bg-white/5 p-2 rounded-full transition-colors">
                       <Repeat className="w-5 h-5" />
                     </button>
                   </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
