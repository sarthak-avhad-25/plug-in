const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `              {/* Blurred Ambient Background */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <img src={currentSong.image} className="w-full h-full object-cover blur-[100px] opacity-40 scale-150" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#050505]/80 to-[#050505]" />
              </div>`;

const replaceStr = `              {/* Ambient Background */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#020005]">
                <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[120%] bg-blue-700/30 rounded-full blur-[100px] mix-blend-screen opacity-60" />
                <div className="absolute top-[20%] right-[5%] w-[80%] h-[80%] bg-fuchsia-600/30 rounded-full blur-[120px] mix-blend-screen opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                <img src={currentSong.image} className="absolute inset-0 w-full h-full object-cover blur-[150px] opacity-30 scale-150 mix-blend-screen" />
              </div>`;

code = code.replace(targetStr, replaceStr);

const infoTarget = `              {/* Controls & Info */}
              <div className="relative z-10 flex flex-col gap-6 p-8 pb-12">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col min-w-0 flex-1 pr-4">
                    <span className="text-2xl font-black text-white truncate">{currentSong.title}</span>
                    <span className="text-lg text-[#D4FF00] truncate">{currentSong.artist}</span>
                  </div>
                  <button 
                    onClick={(e) => toggleLike(currentSong, e)}
                    className="p-2 shrink-0"
                  >
                    <Heart className={\`w-7 h-7 \${playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong.id) ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-white'}\`} />
                  </button>
                </div>`;

const infoReplace = `              {/* Controls & Info */}
              <div className="relative z-10 flex flex-col gap-8 p-8 pb-12">
                <div className="flex items-end justify-between">
                  <div className="flex flex-col min-w-0 flex-1 pr-4">
                    <motion.span 
                      key={\`m-title-\${currentSong.id}\`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl font-black text-white truncate mb-1"
                    >
                      {currentSong.title}
                    </motion.span>
                    <motion.span 
                      key={\`m-artist-\${currentSong.id}\`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg font-medium text-white/50 truncate"
                    >
                      {currentSong.artist}
                    </motion.span>
                  </div>
                  <button 
                    onClick={(e) => toggleLike(currentSong, e)}
                    className="p-3 shrink-0 bg-white/5 rounded-full"
                  >
                    <Heart className={\`w-6 h-6 \${playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong.id) ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-white'}\`} />
                  </button>
                </div>`;

code = code.replace(infoTarget, infoReplace);
fs.writeFileSync('src/app/page.tsx', code);
