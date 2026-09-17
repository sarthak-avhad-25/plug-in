const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Add Mobile Downloads View
const targetMobileView = `          {/* SEARCH TAB */}`;
const replaceMobileView = `          {/* DOWNLOADS TAB */}
          {mobileTab === "downloads" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <ArrowDownToLine className="w-6 h-6 text-[#D4FF00]" />
                  <h2 className="text-2xl font-black tracking-tight text-white">Downloads</h2>
                </div>
                <div className="text-white/40 text-xs font-medium">
                  {downloads.length} songs • {(downloads.reduce((acc, d) => acc + d.size, 0) / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {downloads.length === 0 ? (
                  <div className="py-20 text-center text-white/40">No downloaded songs yet.</div>
                ) : (
                  downloads.map((d, index) => (
                    <div className="flex items-center group/box transition-all duration-200" key={d.id}>
                      <div className="flex-1 pointer-events-auto">
                        <SongBox 
                          song={d.metadata} 
                          index={index} 
                          onPlay={(e) => playSong(d.metadata, true, "playlist", downloads.map(d=>d.metadata), e)} 
                          isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === d.id) ?? false} 
                          onToggleFavorite={(e) => toggleLike(d.metadata, e)} onOpenMenu={(e) => openPlaylistMenu(d.metadata, e)} 
                          isDownloaded={true}
                          onRemoveDownload={(e) => handleRemoveDownload(d.id, e)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SEARCH TAB */}`;
code = code.replace(targetMobileView, replaceMobileView);


// Add Mobile Nav item
const targetNav = `            <button 
              onClick={() => setMobileTab("library")}
              className={\`flex flex-col items-center gap-1 transition-colors \${mobileTab === "library" ? "text-[#D4FF00]" : "text-white/50"}\`}
            >
              <Library className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-widest uppercase">Library</span>
            </button>`;

const replaceNav = targetNav + `
            <button 
              onClick={() => setMobileTab("downloads")}
              className={\`flex flex-col items-center gap-1 transition-colors \${mobileTab === "downloads" ? "text-[#D4FF00]" : "text-white/50"}\`}
            >
              <ArrowDownToLine className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-widest uppercase">Offline</span>
            </button>`;

code = code.replace(targetNav, replaceNav);

fs.writeFileSync('src/app/page.tsx', code);
