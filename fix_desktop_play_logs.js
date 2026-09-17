const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `            audioRef.current.load();
            const playPromise = audioRef.current.play();`;

const replacement = `            audioRef.current.load();
            logDebug(\`[AUDIO_STATE_BEFORE] (Desktop playSong)\`, audioRef.current);
            logDebug(\`[CALLING_AUDIO_PLAY] from Desktop playSong\`);
            const playPromise = audioRef.current.play();`;

code = code.replace(target, replacement);

const targetReject = `              }).catch((err) => {
                logDebug(\`Native play rejected after load: \${err.message}\`);`;

const replacementReject = `              }).catch((err: any) => {
                logDebug(\`[PLAY_PROMISE_REJECTED] from Desktop playSong\\n  error.name: \${err.name}\\n  error.message: \${err.message}\`);`;

code = code.replace(targetReject, replacementReject);

fs.writeFileSync('src/app/page.tsx', code);
