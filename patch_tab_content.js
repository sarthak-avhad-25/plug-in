const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `                 {/* QUEUE / LYRICS BOX */}
                 <div 
                   ref={lyricsContainerRef}
                   onWheel={handleUserInteraction}
                   onTouchMove={handleUserInteraction}
                   onMouseDown={handleUserInteraction}
                   className={\`mt-4 border-t-2 border-[#333] pt-4 overflow-y-auto overflow-x-hidden relative scrollbar-hide scroll-smooth transition-all duration-500 \${(isLyricsExpanded || isQueueExpanded) ? 'bg-black/40 backdrop-blur-sm -mx-6 px-6 rounded-3xl' : 'bg-transparent'}\`} 
                   style={{ height: (isLyricsExpanded || isQueueExpanded) ? '70vh' : '180px' }}
                 >
                   {isQueueExpanded ? (`;

const replaceStr = `                 {/* TAB CONTENT BOX */}
                 <AnimatePresence mode="wait">
                   {playerTab && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0, y: -20 }}
                       animate={{ opacity: 1, height: "60vh", y: 0 }}
                       exit={{ opacity: 0, height: 0, y: -20 }}
                       transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                       className="w-full mt-2 relative overflow-hidden bg-white/[0.02] rounded-2xl border border-white/5"
                     >
                       <div 
                         ref={lyricsContainerRef}
                         onWheel={handleUserInteraction}
                         onTouchMove={handleUserInteraction}
                         onMouseDown={handleUserInteraction}
                         className="w-full h-full overflow-y-auto overflow-x-hidden relative scrollbar-hide scroll-smooth"
                       >
                         {playerTab === 'queue' ? (`;

code = code.replace(targetStr, replaceStr);

const middleTarget = `                       )}
                     </div>
                   ) : (
                     <>
                    {lyricsLoading ? (`;

const middleReplace = `                       )}
                     </div>
                   ) : playerTab === 'lyrics' ? (
                     <>
                    {lyricsLoading ? (`;

code = code.replace(middleTarget, middleReplace);

const endTarget = `                         })}
                       </div>
                    )}
                     </>
                   )}
                 </div>`;

const endReplace = `                         })}
                       </div>
                    )}
                     </>
                   ) : playerTab === 'related' ? (
                     <div className="flex flex-col gap-4 w-full px-4 py-8">
                       <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest px-2">Related Songs</h3>
                       {relatedSongs.map((song, i) => (
                         <SongBox key={song.id} song={song} index={i} onPlay={() => playSong(song)} isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === song.id) ?? false} onToggleFavorite={(e) => toggleLike(song, e)} onOpenMenu={(e) => openPlaylistMenu(song, e)} isDownloaded={downloads.some(d => d.id === song.id)} downloadProgress={downloadProgress[song.id]} onDownload={(e) => handleDownload(song, e)} onRemoveDownload={(e) => handleRemoveDownload(song.id, e)} />
                       ))}
                     </div>
                   ) : null}
                   </div>
                 </motion.div>
                 )}
                 </AnimatePresence>`;

code = code.replace(endTarget, endReplace);
fs.writeFileSync('src/app/page.tsx', code);
