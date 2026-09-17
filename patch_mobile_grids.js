const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetHistory = `                      <div key={i} className="min-w-[140px] max-w-[140px] flex flex-col gap-3 snap-start" onClick={() => playSong(song)}>
                        <div className="w-[140px] h-[140px] relative rounded-2xl overflow-hidden shadow-lg shadow-black/50">
                          <img src={song.image} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 active:opacity-100 transition-opacity">
                            <Play className="w-10 h-10 fill-white text-white" />
                          </div>
                        </div>`;

const replaceHistory = `                      <div key={i} className="min-w-[140px] max-w-[140px] flex flex-col gap-3 snap-start relative group" onClick={() => playSong(song)}>
                        <div className="absolute top-2 right-2 z-10">
                          <button 
                            onClick={(e) => { e.stopPropagation(); downloads.some(d => d.id === song.id) ? handleRemoveDownload(song.id, e) : (downloadProgress[song.id] === undefined ? handleDownload(song, e) : null); }}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md active:bg-black/70 text-white"
                          >
                            {downloads.some(d => d.id === song.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-[#D4FF00]" />
                            ) : downloadProgress[song.id] !== undefined ? (
                              <div className="relative flex items-center justify-center w-4 h-4">
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                                {typeof downloadProgress[song.id] === 'number' && <span className="absolute text-[6px] font-bold text-white leading-none">{downloadProgress[song.id]}</span>}
                              </div>
                            ) : (
                              <ArrowDownToLine className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="w-[140px] h-[140px] relative rounded-2xl overflow-hidden shadow-lg shadow-black/50">
                          <img src={song.image} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 active:opacity-100 transition-opacity">
                            <Play className="w-10 h-10 fill-white text-white" />
                          </div>
                        </div>`;

code = code.replace(targetHistory, replaceHistory);
fs.writeFileSync('src/app/page.tsx', code);
