const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `    try {
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
      
      const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (res.ok || isMobile) {
        // Enforce Native Audio on mobile for true background playback!
        logDebug(\`Using native audio (Mobile enforced or valid source)\`);
        setUseNativeAudio(true);
        if (audioRef.current) {
          audioRef.current.src = \`/api/audio?v=\${targetId}\`;
          audioRef.current.load();
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              if (shouldPlayRef.current) {
                setPlaybackState("playing");
                setIsPlaying(true);
                if (playerRef.current) playerRef.current.pauseVideo();
              } else {
                audioRef.current?.pause();
              }
            }).catch((err) => {
              logDebug(\`Native play rejected after load: \${err.message}\`);
              setPlaybackState("error");
            });
          }
        }
      } else {
        // Desktop fallback to YouTube IFrame if Invidious fails completely
        logDebug(\`Native source failed on Desktop. Invoking YouTube fallback.\`);
        setUseNativeAudio(false);
        if (shouldPlayRef.current && playerRef.current) {
          playerRef.current.playVideo();
        }
      }
    } catch (err: any) {
      if (playRequestIdRef.current !== currentId) return;
      
      logDebug(\`Validation failed/timed out (\${err.message}).\`);
      const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
         setUseNativeAudio(true);
         if (audioRef.current) {
           audioRef.current.src = \`/api/audio?v=\${song.id}\`;
           audioRef.current.load();
           audioRef.current.play().catch(()=>{});
         }
      } else {
         setUseNativeAudio(false);
         if (shouldPlayRef.current && playerRef.current) {
           playerRef.current.playVideo();
         }
      }
    }`;

const replacement = `    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      logDebug(\`Mobile fast-path: setting src instantly to retain user gesture.\`);
      setUseNativeAudio(true);
      if (audioRef.current) {
        audioRef.current.src = \`/api/audio?v=\${song.id}\`;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
           playPromise.catch((err) => {
             logDebug(\`Native play rejected: \${err.message}\`);
             if (playRequestIdRef.current === currentId) {
               setIsPlaying(false);
               setPlaybackState("paused");
             }
           });
        }
      }
    } else {
      try {
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
            audioRef.current.src = \`/api/audio?v=\${targetId}\`;
            audioRef.current.load();
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.then(() => {
                if (shouldPlayRef.current) {
                  // We ONLY do optimistic updates for desktop since YouTube fallback relies on it, 
                  // but for Native Audio let's still just rely on events where possible.
                  // Desktop works with it though, so leaving as is.
                  setPlaybackState("playing");
                  setIsPlaying(true);
                  if (playerRef.current) playerRef.current.pauseVideo();
                } else {
                  audioRef.current?.pause();
                }
              }).catch((err) => {
                logDebug(\`Native play rejected after load: \${err.message}\`);
                setPlaybackState("error");
                setIsPlaying(false);
              });
            }
          }
        } else {
          logDebug(\`Native source failed on Desktop. Invoking YouTube fallback.\`);
          setUseNativeAudio(false);
          if (shouldPlayRef.current && playerRef.current) {
            playerRef.current.playVideo();
          }
        }
      } catch (err: any) {
        if (playRequestIdRef.current !== currentId) return;
        
        logDebug(\`Validation failed/timed out (\${err.message}). Invoking YouTube fallback.\`);
        setUseNativeAudio(false);
        if (shouldPlayRef.current && playerRef.current) {
          playerRef.current.playVideo();
        }
      }
    }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/app/page.tsx', code);
