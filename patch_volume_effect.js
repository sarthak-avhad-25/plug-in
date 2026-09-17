const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `  // Initialize YouTube API`;
const replaceStr = `  // Sync Volume
  useEffect(() => {
    const vol = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (playerRef.current && playerRef.current.setVolume) {
      try {
        playerRef.current.setVolume(vol * 100);
      } catch (e) {}
    }
  }, [volume, isMuted, currentSong]);

  // Initialize YouTube API`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
