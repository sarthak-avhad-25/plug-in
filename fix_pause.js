const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `        onPause={(e) => {
          console.log(\`[AUDIO_PAUSE_EVENT]\`);
          logDebug(\`[AUDIO_PAUSE_EVENT]\`);
          logDebug(\`Native onPause fired!\`, e.currentTarget);
          setIsPlaying(false);
          setPlaybackState("paused");
        }}`;

const replacement = `        onPause={(e) => {
          console.log(\`[AUDIO_PAUSE_EVENT]\`);
          logDebug(\`[AUDIO_PAUSE_EVENT]\`);
          logDebug(\`Native onPause fired!\`, e.currentTarget);
          
          // CRITICAL FIX: When audio.src is changed, the browser asynchronously fires a 'pause' event 
          // for the PREVIOUS track. This overrides the "loading" state of the NEW track, causing 
          // the UI to incorrectly show the Play button, forcing the user to tap again.
          // By ignoring onPause when readyState === 0 and we WANT to play, we prevent this race condition!
          if (e.currentTarget.readyState === 0 && shouldPlayRef.current) {
            logDebug(\`Ignoring onPause because readyState is 0 (src change artifact)\`);
            return;
          }
          
          setIsPlaying(false);
          setPlaybackState("paused");
        }}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/app/page.tsx', code);
