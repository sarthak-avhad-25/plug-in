const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `    logDebug(\`playSong: \${song.title}\`, audioRef.current);

    // STEP 3: INSTANT GESTURE PRIMING
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.unMute?.();
      playerRef.current.setVolume(100);
      playerRef.current.loadVideoById(song.id);
      playerRef.current.playVideo();
      playerRef.current.pauseVideo(); // Prime synchronously, NO setTimeout delay!
      logDebug(\`YouTube iframe primed instantly.\`);
    }
    


    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);`;

const replacement = `    logDebug(\`playSong: \${song.title}\`, audioRef.current);

    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/app/page.tsx', code);
