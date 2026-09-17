const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// I will locate the "Clean Navigation Section" and the "AnimatePresence" block that renders the tabs, and replace it with a stacked layout.
const targetLayout = `                   {/* Clean Navigation Section */}
                   <div className="flex items-center justify-between w-full border-t border-white/10 pt-6">`;

const replaceLayout = `                   {/* LYRICS SECTION - ALWAYS VISIBLE DIRECTLY UNDER PLAYER */}
                   <div className="w-full border-t border-white/10 pt-8 mt-4">
                     <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">Live Lyrics</h3>
                     <LiveLyrics 
                       lyrics={lyrics} 
                       isLoading={lyricsLoading} 
                       progress={progress} 
                       onSeek={(time) => {
                         if (playerRef.current) {
                           playerRef.current.seekTo(time, true);
                           setProgress(time);
                         }
                       }}
                     />
                   </div>

                   {/* Clean Navigation Section for Queue / Related */}
                   <div className="flex items-center justify-between w-full border-t border-white/10 pt-6 mt-8">`;

code = code.replace(targetLayout, replaceLayout);

fs.writeFileSync('src/app/page.tsx', code);
