const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `              {/* Expandable Lyrics Sheet */}
              <AnimatePresence>
                {isLyricsExpanded && (
                  <motion.div `;

const replaceStr = `              {/* Expandable Queue Sheet */}
              <AnimatePresence>
                {isQueueExpanded && (
                  <motion.div 
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl flex flex-col pt-12"
                  >
                    <div className="flex items-center justify-between p-6 pb-2 border-b border-white/10">
                      <h2 className="text-lg font-black uppercase tracking-widest text-white">Queue</h2>
                      <button onClick={() => setIsQueueExpanded(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90">
                        <ChevronDown className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-32">
                      {playbackHistory.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest px-2">Previously Played</h3>
                          {playbackHistory.map((song, i) => (
                            <div key={i} className="opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                              <SongBox song={song} index={i} onPlay={() => playSong(song)} />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-col gap-2 relative">
                        <h3 className="text-sm font-bold text-[#D4FF00] uppercase tracking-widest px-2">Now Playing</h3>
                        <div className="ring-2 ring-[#D4FF00] rounded-xl overflow-hidden">
                          <SongBox song={currentSong} index={0} onPlay={() => {}} />
                        </div>
                      </div>
                      {relatedSongs.filter(s => s.id !== currentSong.id).length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest px-2">Up Next</h3>
                          {relatedSongs.filter(s => s.id !== currentSong.id).map((song, i) => (
                            <SongBox key={song.id} song={song} index={i} onPlay={() => playSong(song)} />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expandable Lyrics Sheet */}
              <AnimatePresence>
                {isLyricsExpanded && (
                  <motion.div `;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
