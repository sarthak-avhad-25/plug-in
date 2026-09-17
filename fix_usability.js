const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Issue 14, 15, 20: Playlists header styling and level
const targetPlaylistsHeader = `<div className="w-full flex flex-col gap-4">
            <div className="border-2 border-white/40 bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white shadow-[2px_2px_0_0_rgba(255,255,255,0.3)] p-3 mb-2 flex items-center justify-center">
              <h3 className="text-xl font-medium tracking-wide  tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">Playlists</h3>
            </div>`;
const replacePlaylistsHeader = `<div className="w-full flex flex-col gap-4">
            <div className="mb-2 flex items-center justify-start px-2">
              <h2 className="text-xl font-medium tracking-wide tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">Playlists</h2>
            </div>`;
code = code.replace(targetPlaylistsHeader, replacePlaylistsHeader);

// Issue 18: Playlist buttons Grouping
// Move the song count closer to the playlist name or reduce the overall width.
const targetPlaylistButton = `<button 
                key={p.id}
                onClick={() => {
                  setActivePlaylistId(p.id);
                  setShowPlaylist(true);
                  if (mobileTab) setMobileTab("playlistView");
                }}
                className={\`w-full border-2 border-white/40 p-4 text-2xl font-medium tracking-wide  tracking-tight transition-all flex justify-between items-center \${activePlaylistId === p.id && showPlaylist ? 'bg-[#D4FF00] text-black shadow-[4px_4px_0_0_rgba(255,255,255,0.8)] border-[#D4FF00]' : 'bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(255,255,255,0.3)]'}\`}
              >
                <span className="truncate pr-4">{p.name}</span>
                <span className={\`text-sm font-bold tracking-widest \${activePlaylistId === p.id && showPlaylist ? 'text-black/50' : 'text-white/30'}\`}>{p.songs.length}</span>
              </button>`;
// We will change `justify-between` to `justify-start gap-4` to move the count closer
const replacePlaylistButton = `<button 
                key={p.id}
                onClick={() => {
                  setActivePlaylistId(p.id);
                  setShowPlaylist(true);
                  if (mobileTab) setMobileTab("playlistView");
                }}
                className={\`w-full border-2 border-white/40 p-4 text-2xl font-medium tracking-wide tracking-tight transition-all flex justify-start items-center gap-4 \${activePlaylistId === p.id && showPlaylist ? 'bg-[#D4FF00] text-black shadow-[4px_4px_0_0_rgba(255,255,255,0.8)] border-[#D4FF00]' : 'bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(255,255,255,0.3)]'}\`}
              >
                <span className="truncate">{p.name}</span>
                <span className={\`text-sm font-bold tracking-widest \${activePlaylistId === p.id && showPlaylist ? 'text-black/50' : 'text-white/30'}\`}>{p.songs.length}</span>
              </button>`;
code = code.replace(targetPlaylistButton, replacePlaylistButton);

fs.writeFileSync('src/app/page.tsx', code);
