const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `              }).catch((err) => {
                console.log(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
                logDebug(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
                logDebug(\`Native play rejected after load: \${err.message}\`);
                setPlaybackState("error");
                setIsPlaying(false);
              });`;

const replacement = `              }).catch((err) => {
                console.log(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
                logDebug(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
                logDebug(\`Native play rejected after load: \${err.message}\`);
                shouldPlayRef.current = false;
                setPlaybackState("error");
                setIsPlaying(false);
              });`;

code = code.replace(target, replacement);
fs.writeFileSync('src/app/page.tsx', code);
