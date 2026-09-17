const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetHUD = `        {/* BOTTOM HUD (Mini Player + Nav) */}
        <div className="absolute bottom-6 left-4 right-4 flex flex-col gap-3 z-50">
          
          {/* Mini Player */}
          {currentSong && (
            <div 
              className="w-full bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => setShowMobilePlayer(true)}
            >
              <div className="w-12 h-12 relative rounded-xl overflow-hidden shrink-0">
                <img src={currentSong.image} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold text-white truncate">{currentSong.title}</span>
                <span className="text-xs text-[#D4FF00] truncate">{currentSong.artist}</span>
              </div>
              <div className="flex items-center gap-2 pr-2" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={(e) => toggleLike(currentSong, e)}
                  className="p-2"
                >
                  <Heart className={\`w-5 h-5 \${playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong.id) ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-white/40'}\`} />
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  {playbackState === "loading" || playbackState === "buffering" ? (
                    <Loader2 className="w-5 h-5 animate-spin text-black" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-black text-black" />
                  ) : (
                    <Play className="w-5 h-5 fill-black text-black ml-1" />
                  )}
                </button>
              </div>
              {/* Mini Progress Bar */}
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#D4FF00] transition-all duration-200"
                  style={{ width: \`\${duration ? (progress / duration) * 100 : 0}%\` }}
                />
              </div>
            </div>
          )}

          {/* Pill Navigation */}
          <div className="w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.8)]">`;

const replacementHUD = `        {/* BOTTOM HUD (Mini Player + Nav) */}
        <div className="fixed bottom-0 left-0 right-0 flex flex-col z-50 pointer-events-none">
          
          {/* Mini Player */}
          {currentSong && (
            <div className="px-4 pb-3 pointer-events-auto">
              <div 
                className="w-full bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setShowMobilePlayer(true)}
              >
                <div className="w-12 h-12 relative rounded-xl overflow-hidden shrink-0">
                  <img src={currentSong.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-bold text-white truncate">{currentSong.title}</span>
                  <span className="text-xs text-[#D4FF00] truncate">{currentSong.artist}</span>
                </div>
                <div className="flex items-center gap-2 pr-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => toggleLike(currentSong, e)}
                    className="p-2"
                  >
                    <Heart className={\`w-5 h-5 \${playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong.id) ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-white/40'}\`} />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                  >
                    {playbackState === "loading" || playbackState === "buffering" ? (
                      <Loader2 className="w-5 h-5 animate-spin text-black" />
                    ) : isPlaying ? (
                      <Pause className="w-5 h-5 fill-black text-black" />
                    ) : (
                      <Play className="w-5 h-5 fill-black text-black ml-1" />
                    )}
                  </button>
                </div>
                {/* Mini Progress Bar */}
                <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#D4FF00] transition-all duration-200"
                    style={{ width: \`\${duration ? (progress / duration) * 100 : 0}%\` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="w-full bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] px-8 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto">`;

code = code.replace(targetHUD, replacementHUD);

// Update padding of Main Content Area to ensure content isn't hidden
const targetMainContent = `        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pb-[140px] px-6 scrollbar-hide pt-12 transition-opacity duration-300" style={{ WebkitOverflowScrolling: 'touch' }}>`;
const replacementMainContent = `        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pb-[200px] px-6 scrollbar-hide pt-12 transition-opacity duration-300" style={{ WebkitOverflowScrolling: 'touch' }}>`;
code = code.replace(targetMainContent, replacementMainContent);

fs.writeFileSync('src/app/page.tsx', code);
