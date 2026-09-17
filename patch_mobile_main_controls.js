const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `                {/* Main Controls */}
                <div className="flex items-center justify-between w-full px-2">
                  <button onClick={() => setIsShuffleOn(!isShuffleOn)} className={\`p-2 \${isShuffleOn ? 'text-[#D4FF00]' : 'text-white/40'}\`}>
                    <Shuffle className="w-6 h-6" />
                  </button>
                  <button onClick={playPreviousSong} className="p-2 text-white active:scale-90 transition-transform">
                    <SkipBack className="w-10 h-10 fill-current" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 transition-transform"
                  >
                    {playbackState === "loading" || playbackState === "buffering" ? (
                      <Loader2 className="w-10 h-10 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-10 h-10 fill-current" />
                    ) : (
                      <Play className="w-10 h-10 fill-current ml-2" />
                    )}
                  </button>
                  <button onClick={playNextSong} className="p-2 text-white active:scale-90 transition-transform">
                    <SkipForward className="w-10 h-10 fill-current" />
                  </button>
                  <button className="p-2 text-white/40">
                    <Repeat className="w-6 h-6" />
                  </button>
                </div>`;

const replaceStr = `                {/* Main Controls */}
                <div className="flex items-center justify-between w-full">
                  <button onClick={() => setIsShuffleOn(!isShuffleOn)} className={\`p-3 rounded-full bg-white/5 active:bg-white/10 transition-colors \${isShuffleOn ? 'text-[#D4FF00]' : 'text-white/40'}\`} aria-label="Shuffle">
                    <Shuffle className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-6">
                    <button onClick={playPreviousSong} className="text-white active:text-white/70 active:scale-90 transition-transform" aria-label="Previous song">
                      <SkipBack className="w-10 h-10 fill-current" />
                    </button>
                    <button 
                      onClick={togglePlay}
                      className="w-20 h-20 bg-[#D4FF00] text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,255,0,0.2)] active:scale-95 transition-transform"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {playbackState === "loading" || playbackState === "buffering" ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-10 h-10 fill-current" />
                      ) : (
                        <Play className="w-10 h-10 fill-current ml-1" />
                      )}
                    </button>
                    <button onClick={playNextSong} className="text-white active:text-white/70 active:scale-90 transition-transform" aria-label="Next song">
                      <SkipForward className="w-10 h-10 fill-current" />
                    </button>
                  </div>
                  <button className="p-3 rounded-full bg-white/5 active:bg-white/10 transition-colors text-white/40" aria-label="Repeat">
                    <Repeat className="w-5 h-5" />
                  </button>
                </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
