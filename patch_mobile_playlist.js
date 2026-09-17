const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetMP = `                  {activePlaylist.songs.map((song, i) => (
                    <div key={song.id} className="flex items-center gap-4 p-2 rounded-xl active:bg-white/5">
                      <div className="flex-1 min-w-0" onClick={() => playSong(song, true, "playlist", activePlaylist.songs)}>
                        <div className="flex items-center gap-4">
                          <img src={song.image} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-base font-bold text-white truncate">{song.title}</span>
                            <span className="text-sm text-white/50 truncate">{song.artist}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => openPlaylistMenu(song, e)}
                        className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 shrink-0"
                      >
                        <MoreHorizontal className="w-5 h-5 text-white/50" />
                      </button>
                    </div>
                  ))}`;

const replaceMP = `                  {activePlaylist.songs.map((song, i) => (
                    <div key={song.id} className="flex items-center gap-4 p-2 rounded-xl active:bg-white/5">
                      <div className="flex-1 min-w-0" onClick={() => playSong(song, true, "playlist", activePlaylist.songs)}>
                        <div className="flex items-center gap-4">
                          <img src={song.image} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-base font-bold text-white truncate">{song.title}</span>
                            <span className="text-sm text-white/50 truncate">{song.artist}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); downloads.some(d => d.id === song.id) ? handleRemoveDownload(song.id, e) : (downloadProgress[song.id] === undefined ? handleDownload(song, e) : null); }}
                        className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 shrink-0"
                      >
                        {downloads.some(d => d.id === song.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-[#D4FF00]" />
                        ) : downloadProgress[song.id] !== undefined ? (
                          <div className="relative flex items-center justify-center w-5 h-5">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                            {typeof downloadProgress[song.id] === 'number' && <span className="absolute text-[8px] font-bold text-white leading-none">{downloadProgress[song.id]}</span>}
                          </div>
                        ) : (
                          <ArrowDownToLine className="w-5 h-5 text-white/50" />
                        )}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openPlaylistMenu(song, e); }}
                        className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 shrink-0"
                      >
                        <MoreHorizontal className="w-5 h-5 text-white/50" />
                      </button>
                    </div>
                  ))}`;

code = code.replace(targetMP, replaceMP);
fs.writeFileSync('src/app/page.tsx', code);
