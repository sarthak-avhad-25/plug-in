const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `  const togglePlay = () => {
    if (useNativeAudio && audioRef.current) {
      if (isPlaying) {
        shouldPlayRef.current = false;
        setIsPlaying(false);
        setPlaybackState("paused");
        audioRef.current.pause();
      } else {
        shouldPlayRef.current = true;
        setPlaybackState("playing"); // Optimistic
        audioRef.current.play().catch((err: any) => {
          logDebug(\`togglePlay native play rejected: \${err.message}\`);
          setIsPlaying(false);
          setPlaybackState("error");
        });
      }
    } else {`;

const replacement = `  const togglePlay = () => {
    if (useNativeAudio && audioRef.current) {
      if (isPlaying) {
        shouldPlayRef.current = false;
        audioRef.current.pause();
        // UI updates via onPause event
      } else {
        shouldPlayRef.current = true;
        audioRef.current.play().catch((err: any) => {
          logDebug(\`togglePlay native play rejected: \${err.message}\`);
          setIsPlaying(false);
          setPlaybackState("paused");
        });
        // UI updates via onPlay event
      }
    } else {`;

code = code.replace(target, replacement);

fs.writeFileSync('src/app/page.tsx', code);
