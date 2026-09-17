const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetDisc = `                  {trendingWorldwide.map(song => (
                    <div key={song.id} className="flex flex-col gap-2" onClick={() => playSong(song)}>
                      <div className="aspect-square relative rounded-2xl overflow-hidden">
                        <img src={song.image} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-bold text-white truncate">{song.title}</span>
                      <span className="text-xs text-white/50 truncate">{song.artist}</span>
                    </div>
                  ))}`;

const replaceDisc = `                  {trendingWorldwide.map(song => (
                    <div key={song.id} className="flex flex-col gap-2 relative group" onClick={() => playSong(song)}>
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
                      <div className="aspect-square relative rounded-2xl overflow-hidden">
                        <img src={song.image} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-bold text-white truncate">{song.title}</span>
                      <span className="text-xs text-white/50 truncate">{song.artist}</span>
                    </div>
                  ))}`;

code = code.replace(targetDisc, replaceDisc);
fs.writeFileSync('src/app/page.tsx', code);
