const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetList = `            {playlists.map(p => (
              <button 
                key={p.id}
                onClick={() => { setActivePlaylistId(p.id); setShowPlaylist(true); setShowDownloads(false); setHasSearched(false); setIsEditingPlaylist(false); }}
                className={\`w-full border-2 border-white/40 p-4 text-2xl font-medium tracking-wide tracking-tight transition-all flex justify-between items-center \${showPlaylist && activePlaylistId === p.id ? 'bg-[#D4FF00] text-[#000000] shadow-none translate-y-1 translate-x-1' : 'bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white shadow-sm hover:translate-y-1 hover:translate-x-1 hover:shadow-sm'}\`}
              >
                <span className="truncate pr-4 text-left">{p.name}</span>
                <span className="bg-[#1d1d1f] text-white px-3 py-1 rounded-full text-sm shrink-0">{p.songs.length}</span>
              </button>
            ))}`;

const replaceList = targetList + `
            <button 
              onClick={() => { setShowDownloads(true); setShowPlaylist(false); setHasSearched(false); }}
              className={\`w-full border-2 border-white/40 p-4 text-2xl font-medium tracking-wide tracking-tight transition-all flex justify-between items-center \${showDownloads ? 'bg-[#D4FF00] text-[#000000] shadow-none translate-y-1 translate-x-1' : 'bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white shadow-sm hover:translate-y-1 hover:translate-x-1 hover:shadow-sm'}\`}
            >
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5" />
                <span className="truncate text-left">Downloads</span>
              </div>
              <span className="bg-[#1d1d1f] text-white px-3 py-1 rounded-full text-sm shrink-0">{downloads.length}</span>
            </button>`;

code = code.replace(targetList, replaceList);

// Also add the view for showDownloads right next to showPlaylist
const targetView = `          {showPlaylist ? (() => {`;
const replaceView = `          {showDownloads && (
            <div className="w-full flex flex-col pt-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <ArrowDownToLine className="w-8 h-8 text-[#D4FF00]" />
                  <h2 className="text-4xl font-black tracking-tight text-white">Downloads</h2>
                </div>
                <div className="text-white/40 text-sm font-medium">
                  {downloads.length} songs • {(downloads.reduce((acc, d) => acc + d.size, 0) / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>
              <div className="flex flex-col gap-2 relative">
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
          
          {showPlaylist ? (() => {`;

code = code.replace(targetView, replaceView);

fs.writeFileSync('src/app/page.tsx', code);
