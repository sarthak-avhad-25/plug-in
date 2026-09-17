const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetInjection = `  if (!isClient) return null; // Hydration mismatch prevention`;
const replacementInjection = `  // CRITICAL FIX: iOS Safari drops the transient user activation token if the 'ended' 
  // event is processed asynchronously by React's synthetic event batching.
  // We MUST attach a native DOM listener so playNextSong() executes in the EXACT 
  // same C++ call stack as the native media ended event!
  const latestPlaybackStateRef = useRef({ useNativeAudio, playNextSong, setPlaybackState });
  useEffect(() => {
    latestPlaybackStateRef.current = { useNativeAudio, playNextSong, setPlaybackState };
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleNativeEnded = () => {
      console.log("[NATIVE_ENDED_EVENT] Fired directly from DOM");
      const state = latestPlaybackStateRef.current;
      if (state.useNativeAudio) {
        state.setPlaybackState("idle");
        state.playNextSong();
      }
    };
    
    audio.addEventListener("ended", handleNativeEnded);
    return () => audio.removeEventListener("ended", handleNativeEnded);
  }, []);

  if (!isClient) return null; // Hydration mismatch prevention`;

code = code.replace(targetInjection, replacementInjection);

// I must remove the broken one that I injected earlier which was causing the TS error!
const badBlockStart = `  const [isClient, setIsClient] = useState(false);

  // CRITICAL FIX: iOS Safari drops the transient user activation token if the 'ended' `;
  
// I will just read the file, find the bad block and remove it.
