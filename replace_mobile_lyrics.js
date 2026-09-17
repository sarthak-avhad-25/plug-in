const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `                      {lyricsLoading ? (
                        <div className="flex items-center justify-center h-full text-[#D4FF00]"><Loader2 className="w-8 h-8 animate-spin" /></div>
                      ) : lyrics.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-white/30 font-bold uppercase tracking-widest">No lyrics found</div>
                      ) : (
                        lyrics.map((line, i) => {
                          const activeIndex = lyrics.reduce((acc, l, idx) => (progress >= l.time ? idx : acc), 0);
                          const isActive = i === activeIndex;
                          const isPast = i < activeIndex;
                          return (
                            <div 
                              key={i} 
                              onClick={() => {
                                if (useNativeAudio && audioRef.current) audioRef.current.currentTime = line.time;
                                if (playerRef.current) playerRef.current.seekTo(line.time, true);
                                setProgress(line.time);
                              }}
                              className={\`text-2xl md:text-3xl font-black tracking-tight transition-all duration-300 cursor-pointer \${isActive ? 'text-white scale-[1.02] origin-left drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : isPast ? 'text-white/30' : 'text-white/50'}\`}
                            >
                              {line.text}
                            </div>
                          );
                        })
                      )}`;

const replaceStr = `                      <LiveLyrics 
                        lyrics={lyrics} 
                        isLoading={lyricsLoading} 
                        progress={progress} 
                        onSeek={(time) => {
                          if (useNativeAudio && audioRef.current) audioRef.current.currentTime = time;
                          if (playerRef.current) playerRef.current.seekTo(time, true);
                          setProgress(time);
                        }}
                        isExpanded={true}
                      />`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync('src/app/page.tsx', code);
    console.log("Successfully replaced mobile lyrics block");
} else {
    console.error("Target string not found.");
}
