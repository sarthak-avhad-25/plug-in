const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetSearch = `                    <div key={song.id} className="flex items-center gap-4 p-2 rounded-xl active:bg-white/5" onClick={() => playSong(song)}>
                      <img src={song.image} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-base font-bold text-white truncate">{song.title}</span>
                        <span className="text-sm text-white/50 truncate">{song.artist}</span>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 shrink-0">
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      </button>
                      <button 
                        onClick={(e) => openPlaylistMenu(song, e)}
                        className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 shrink-0"
                      >
                        <MoreHorizontal className="w-5 h-5 text-white/50" />
                      </button>
                    </div>`;

const replaceSearch = `                    <div key={song.id} className="flex items-center gap-4 p-2 rounded-xl active:bg-white/5" onClick={() => playSong(song)}>
                      <img src={song.image} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-base font-bold text-white truncate">{song.title}</span>
                        <span className="text-sm text-white/50 truncate">{song.artist}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); downloads.some(d => d.id === song.id) ? handleRemoveDownload(song.id, e) : (downloadProgress[song.id] === undefined ? handleDownload(song, e) : null); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 shrink-0"
                      >
                        {downloads.some(d => d.id === song.id) ? (
                          <CheckCircle2 className="w-4 h-4 text-[#D4FF00]" />
                        ) : downloadProgress[song.id] !== undefined ? (
                          <div className="relative flex items-center justify-center w-4 h-4">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                            {typeof downloadProgress[song.id] === 'number' && <span className="absolute text-[6px] font-bold text-white leading-none">{downloadProgress[song.id]}</span>}
                          </div>
                        ) : (
                          <ArrowDownToLine className="w-4 h-4 text-white/50" />
                        )}
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 shrink-0">
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openPlaylistMenu(song, e); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 shrink-0"
                      >
                        <MoreHorizontal className="w-5 h-5 text-white/50" />
                      </button>
                    </div>`;

code = code.replace(targetSearch, replaceSearch);
fs.writeFileSync('src/app/page.tsx', code);
