const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `    if (isMobile) {
      logDebug(\`Mobile fast-path: setting src instantly to retain user gesture.\`);
      setUseNativeAudio(true);
      if (audioRef.current) {
        audioRef.current.src = \`/api/audio?v=\${song.id}\`;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
           playPromise.catch((err) => {
             logDebug(\`Native play rejected: \${err.message}\`);`;

const replacement = `    if (isMobile) {
      console.log(\`[SOURCE_RESOLVED] url=/api/audio?v=\${song.id}\`);
      logDebug(\`[SOURCE_RESOLVED] url=/api/audio?v=\${song.id}\`);
      logDebug(\`Mobile fast-path: setting src instantly to retain user gesture.\`);
      setUseNativeAudio(true);
      if (audioRef.current) {
        console.log(\`[AUDIO_SRC_SET] currentSrc=/api/audio?v=\${song.id}\`);
        logDebug(\`[AUDIO_SRC_SET] currentSrc=/api/audio?v=\${song.id}\`);
        audioRef.current.src = \`/api/audio?v=\${song.id}\`;
        
        console.log(\`[CALLING_AUDIO_LOAD]\`);
        logDebug(\`[CALLING_AUDIO_LOAD]\`);
        audioRef.current.load();
        
        console.log(\`[PLAY_CALL] paused=\${audioRef.current.paused} readyState=\${audioRef.current.readyState} networkState=\${audioRef.current.networkState}\`);
        logDebug(\`[PLAY_CALL] paused=\${audioRef.current.paused} readyState=\${audioRef.current.readyState} networkState=\${audioRef.current.networkState}\`);
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
           playPromise.then(() => {
              console.log(\`[PLAY_PROMISE_RESOLVED]\`);
              logDebug(\`[PLAY_PROMISE_RESOLVED]\`);
           }).catch((err) => {
             console.log(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
             logDebug(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
             logDebug(\`Native play rejected: \${err.message}\`);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/app/page.tsx', code);
