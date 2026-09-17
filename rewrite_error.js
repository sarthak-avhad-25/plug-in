const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `        onError={(e) => {
          const err = e.currentTarget.error;
          logDebug(\`Native audio error event! Code: \${err?.code} Msg: \${err?.message}\`, e.currentTarget);
          setPlaybackState("error");
          
          if (shouldPlayRef.current && playerRef.current && currentSong) {
            logDebug(\`Fallback to YouTube inside onError\`);
            playerRef.current.playVideo();
          }
        }}`;

const replacement = `        onError={async (e) => {
          const err = e.currentTarget.error;
          logDebug(\`Native audio error event! Code: \${err?.code} Msg: \${err?.message}\`, e.currentTarget);
          
          const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          
          if (isMobile && currentSong) {
             setPlaybackState("loading");
             logDebug(\`Attempting to resolve alternative source for Mobile...\`);
             const altId = await getAlternativeSourceId(currentSong.title, currentSong.artist);
             if (altId && audioRef.current) {
                 audioRef.current.src = \`/api/audio?v=\${altId}\`;
                 audioRef.current.load();
                 audioRef.current.play().catch((e) => {
                     setPlaybackState("error");
                     setIsPlaying(false);
                 });
             } else {
                 setPlaybackState("error");
                 setIsPlaying(false);
             }
          } else {
             setPlaybackState("error");
             if (shouldPlayRef.current && playerRef.current && currentSong) {
               logDebug(\`Fallback to YouTube inside onError\`);
               playerRef.current.playVideo();
             }
          }
        }}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/app/page.tsx', code);
