const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `           playPromise.catch((err) => {
             console.log(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
             logDebug(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
             logDebug(\`Native play rejected: \${err.message}\`);
             if (playRequestIdRef.current === currentId) {
               setIsPlaying(false);
               setPlaybackState("paused");
             }
           });`;

const replacement = `           playPromise.catch((err) => {
             console.log(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
             logDebug(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
             logDebug(\`Native play rejected: \${err.message}\`);
             if (playRequestIdRef.current === currentId) {
               shouldPlayRef.current = false;
               setIsPlaying(false);
               setPlaybackState("paused");
             }
           });`;

code = code.replace(target, replacement);
fs.writeFileSync('src/app/page.tsx', code);
