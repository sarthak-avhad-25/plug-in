const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `                 {/* LYRICS BOX */}
                 <div 
                   ref={lyricsContainerRef}
                   onWheel={handleUserInteraction}
                   onTouchMove={handleUserInteraction}
                   onMouseDown={handleUserInteraction}
                   className={\`mt-4 border-t-2 border-[#333] pt-4 overflow-y-auto overflow-x-hidden relative scrollbar-hide scroll-smooth transition-all duration-500 \${isLyricsExpanded ? 'bg-black/40 backdrop-blur-sm -mx-6 px-6 rounded-3xl' : 'bg-transparent'}\`} 
                   style={{ height: isLyricsExpanded ? '70vh' : '180px' }}
                 >`;

const replaceStr = `                 {/* QUEUE / LYRICS BOX */}
                 <div 
                   ref={lyricsContainerRef}
                   onWheel={handleUserInteraction}
                   onTouchMove={handleUserInteraction}
                   onMouseDown={handleUserInteraction}
                   className={\`mt-4 border-t-2 border-[#333] pt-4 overflow-y-auto overflow-x-hidden relative scrollbar-hide scroll-smooth transition-all duration-500 \${(isLyricsExpanded || isQueueExpanded) ? 'bg-black/40 backdrop-blur-sm -mx-6 px-6 rounded-3xl' : 'bg-transparent'}\`} 
                   style={{ height: (isLyricsExpanded || isQueueExpanded) ? '70vh' : '180px' }}
                 >
                   {isQueueExpanded ? (
                     <div className="flex flex-col gap-4 w-full px-4 pb-8">
                       {playbackHistory.length > 0 && (
                         <div className="flex flex-col gap-2">
                           <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest">Previously Played</h3>
                           {playbackHistory.map((song, i) => (
                             <div key={i} className="opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                               <SongBox song={song} index={i} onPlay={() => playSong(song)} />
                             </div>
                           ))}
                         </div>
                       )}
                       <div className="flex flex-col gap-2 relative">
                         <h3 className="text-sm font-bold text-[#D4FF00] uppercase tracking-widest">Now Playing</h3>
                         <div className="ring-2 ring-[#D4FF00] rounded-xl">
                           <SongBox song={currentSong} index={0} onPlay={() => {}} />
                         </div>
                       </div>
                       {relatedSongs.filter(s => s.id !== currentSong.id).length > 0 && (
                         <div className="flex flex-col gap-2">
                           <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest">Up Next</h3>
                           {relatedSongs.filter(s => s.id !== currentSong.id).map((song, i) => (
                             <SongBox key={song.id} song={song} index={i} onPlay={() => playSong(song)} />
                           ))}
                         </div>
                       )}
                     </div>
                   ) : (
                     <>`;

code = code.replace(targetStr, replaceStr);

const endTarget = `                         })}
                       </div>
                    )}
                 </div>`;
const endReplace = `                         })}
                       </div>
                    )}
                     </>
                   )}
                 </div>`;

code = code.replace(endTarget, endReplace);
fs.writeFileSync('src/app/page.tsx', code);
