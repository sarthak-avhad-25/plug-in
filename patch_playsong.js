const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // STEP 3: INSTANT GESTURE PRIMING (DESKTOP ONLY)
    // On Mobile, priming the YouTube iframe consumes the strict 1-time user gesture, 
    // causing the native audio.play() to instantly reject with NotAllowedError!
    if (!isMobile && playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.unMute?.();
      playerRef.current.setVolume(100);
      playerRef.current.loadVideoById(song.id);
      playerRef.current.playVideo();
      playerRef.current.pauseVideo(); // Prime synchronously, NO setTimeout delay!
      logDebug(\`YouTube iframe primed instantly.\`);
    }
    
    if (isMobile) {
      console.log(\`[SOURCE_RESOLVED] url=/api/audio?v=\${song.id}\`);
      logDebug(\`[SOURCE_RESOLVED] url=/api/audio?v=\${song.id}\`);
      logDebug(\`Mobile fast-path: setting src instantly to retain user gesture.\`);
      setUseNativeAudio(true);
      if (audioRef.current) {
        console.log(\`[AUDIO_SRC_SET] currentSrc=/api/audio?v=\${song.id}\`);
        logDebug(\`[AUDIO_SRC_SET] currentSrc=/api/audio?v=\${song.id}\`);
        audioRef.current.src = \`/api/audio?v=\${song.id}\`;`;

const replacementStr = `    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const isDownloaded = downloads.some(d => d.id === song.id);
    let finalSrc = \`/api/audio?v=\${song.id}\`;
    
    if (isDownloaded) {
      try {
        const localRecord = await getDownload(song.id);
        if (localRecord) {
          if (currentObjectUrlRef.current) {
            URL.revokeObjectURL(currentObjectUrlRef.current);
          }
          finalSrc = URL.createObjectURL(localRecord.blob);
          currentObjectUrlRef.current = finalSrc;
        }
      } catch (err) {
        console.error("Failed to read from IndexedDB", err);
      }
    } else if (isOffline) {
       if (playRequestIdRef.current === currentId) {
         activePlayRequestIdRef.current = currentId;
         setIsPlaying(false);
         setPlaybackState("error");
       }
       return; // Cannot play non-downloaded song offline
    }

    // STEP 3: INSTANT GESTURE PRIMING (DESKTOP ONLY)
    if (!isMobile && playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.unMute?.();
      playerRef.current.setVolume(100);
      playerRef.current.loadVideoById(song.id);
      playerRef.current.playVideo();
      playerRef.current.pauseVideo(); 
      logDebug(\`YouTube iframe primed instantly.\`);
    }
    
    if (isMobile) {
      logDebug(\`Mobile fast-path: setting src instantly to retain user gesture.\`);
      setUseNativeAudio(true);
      if (audioRef.current) {
        audioRef.current.src = finalSrc;`;

code = code.replace(targetStr, replacementStr);

const targetDesktopSrc = `      try {
        console.log(\`[RESOLVE_SOURCE_START] trackId=\${song.id}\`);
      logDebug(\`[RESOLVE_SOURCE_START] trackId=\${song.id}\`);
      logDebug(\`Validating native source...\`);
        let res = await fetch(\`/api/audio?v=\${song.id}\`, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
        let targetId = song.id;

        if (!res.ok) {
          logDebug(\`Native source invalid (HTTP \${res.status}). Resolving alternative source...\`);
          const altId = await getAlternativeSourceId(song.title, song.artist);
          if (altId) {
             targetId = altId;
             res = await fetch(\`/api/audio?v=\${targetId}\`, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
          }
        }

        if (playRequestIdRef.current !== currentId) {
          logDebug(\`playSong aborted by newer request.\`);
          return; 
        }

        if (res.ok) {
          logDebug(\`Using native audio (valid source)\`);
          setUseNativeAudio(true);
          if (audioRef.current) {
            audioRef.current.src = \`/api/audio?v=\${targetId}\`;`;

const replacementDesktopSrc = `      try {
        let targetId = song.id;
        let isNativeValid = false;

        if (isDownloaded) {
          isNativeValid = true; // Local Blob is valid
        } else {
          console.log(\`[RESOLVE_SOURCE_START] trackId=\${song.id}\`);
          let res = await fetch(\`/api/audio?v=\${song.id}\`, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
          if (!res.ok) {
            const altId = await getAlternativeSourceId(song.title, song.artist);
            if (altId) {
              targetId = altId;
              res = await fetch(\`/api/audio?v=\${targetId}\`, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
              if (res.ok) {
                finalSrc = \`/api/audio?v=\${targetId}\`;
                isNativeValid = true;
              }
            }
          } else {
            isNativeValid = true;
          }
        }

        if (playRequestIdRef.current !== currentId) {
          logDebug(\`playSong aborted by newer request.\`);
          return; 
        }

        if (isNativeValid) {
          logDebug(\`Using native audio (valid source)\`);
          setUseNativeAudio(true);
          if (audioRef.current) {
            audioRef.current.src = finalSrc;`;

code = code.replace(targetDesktopSrc, replacementDesktopSrc);

fs.writeFileSync('src/app/page.tsx', code);
