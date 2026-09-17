const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target1 = `        console.log(\`[CALLING_AUDIO_LOAD]\`);
        logDebug(\`[CALLING_AUDIO_LOAD]\`);
        audioRef.current.load();
        
        console.log(\`[PLAY_CALL] paused=\${audioRef.current.paused} readyState=\${audioRef.current.readyState} networkState=\${audioRef.current.networkState}\`);`;

const replacement1 = `        console.log(\`[PLAY_CALL] paused=\${audioRef.current.paused} readyState=\${audioRef.current.readyState} networkState=\${audioRef.current.networkState}\`);`;

code = code.replace(target1, replacement1);

fs.writeFileSync('src/app/page.tsx', code);
