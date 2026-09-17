const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `                  <button className="p-2 text-white/40">
                    <Repeat className="w-6 h-6" />
                  </button>
                </div>

                {/* Lyrics Toggle */}
                <button 
                  onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}`;

const replaceStr = `                  <button className="p-2 text-white/40">
                    <Repeat className="w-6 h-6" />
                  </button>
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-between w-full px-4 mt-2">
                  <div className="relative">
                    <button onClick={(e) => handleShare(currentSong, e)} className="p-2 text-white/40 hover:text-white transition-transform active:scale-90" aria-label="Share">
                      <Share className="w-6 h-6" />
                    </button>
                    {copiedLink && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#D4FF00] text-black text-xs font-bold px-2 py-1 rounded whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2">
                        Link copied
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setShowVolumeSlider(!showVolumeSlider)} 
                      className="p-2 text-white/40 hover:text-white transition-transform active:scale-90"
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
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-xl z-[60] flex items-center justify-center h-32 w-12"
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
                  <button onClick={() => { setIsQueueExpanded(!isQueueExpanded); setIsLyricsExpanded(false); }} className={\`p-2 transition-transform active:scale-90 \${isQueueExpanded ? 'text-white' : 'text-white/40 hover:text-white'}\`} aria-label="Queue">
                    <ListMusic className="w-6 h-6" />
                  </button>
                </div>

                {/* Lyrics Toggle */}
                <button 
                  onClick={() => { setIsLyricsExpanded(!isLyricsExpanded); setIsQueueExpanded(false); }}`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
