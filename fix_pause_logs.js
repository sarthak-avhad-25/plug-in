const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

code = code.replace(
  `        if (useNativeAudio && audioRef.current) {
          audioRef.current.pause();
        }`,
  `        if (useNativeAudio && audioRef.current) {
          logDebug(\`[CALLING_AUDIO_PAUSE] from mediaSession\`);
          audioRef.current.pause();
        }`
);

code = code.replace(
  `                } else {
                  audioRef.current?.pause();
                }`,
  `                } else {
                  logDebug(\`[CALLING_AUDIO_PAUSE] from Desktop playPromise resolve\`);
                  audioRef.current?.pause();
                }`
);

fs.writeFileSync('src/app/page.tsx', code);
