const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Update logDebug to include the required state values
const targetLog = `  const logDebug = (msg: string, audio?: HTMLAudioElement | null) => {
    let audioState = "";
    if (audio) {
      audioState = \` [RS:\${audio.readyState} NS:\${audio.networkState} P:\${audio.paused} CT:\${audio.currentTime.toFixed(1)} DUR:\${audio.duration} SRC:\${audio.currentSrc.substring(0, 30)}]\`;
    }
    const fullMsg = \`[\${new Date().toLocaleTimeString()}] \${msg}\${audioState}\`;
    console.log("[AUDIO DEBUG]", fullMsg);
    setDebugLogs(prev => [...prev.slice(-9), fullMsg]);
  };`;

const replacementLog = `  const logDebug = (msg: string, audio?: HTMLAudioElement | null) => {
    let audioState = "";
    if (audio) {
      audioState = \`\\n  paused: \${audio.paused}\\n  readyState: \${audio.readyState}\\n  networkState: \${audio.networkState}\\n  currentSrc: \${audio.currentSrc}\\n  src: \${audio.src}\\n  error: \${audio.error ? audio.error.message : 'null'}\`;
    }
    const fullMsg = \`[\${new Date().toLocaleTimeString()}] \${msg}\${audioState}\`;
    console.log(fullMsg);
    setDebugLogs(prev => [...prev, fullMsg]);
  };`;

code = code.replace(targetLog, replacementLog);

// 2. Add state for the toggle
const targetState = `  const [debugLogs, setDebugLogs] = useState<string[]>([]);`;
const replacementState = `  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);`;

code = code.replace(targetState, replacementState);

// 3. Add the toggle button and the overlay
const targetUI = `<div className="min-h-screen bg-black text-white selection:bg-white/30 font-sans pb-32">`;
const replacementUI = `<div className="min-h-screen bg-black text-white selection:bg-white/30 font-sans pb-32">
      {/* HIDDEN DEBUG TOGGLE & OVERLAY */}
      <button 
        onClick={() => setShowDebug(!showDebug)} 
        className="fixed bottom-24 right-4 z-[999] w-12 h-12 bg-black/50 border border-white/20 rounded-full flex items-center justify-center text-xs opacity-50 active:opacity-100"
      >
        🛠️
      </button>
      {showDebug && (
        <div className="fixed inset-0 z-[1000] bg-black p-4 overflow-y-auto text-xs font-mono text-green-400">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-bold text-lg">DIAGNOSTIC LOGS</h2>
            <div className="flex gap-4">
              <button onClick={() => setDebugLogs([])} className="text-red-400 uppercase font-bold p-2 bg-white/10 rounded">Clear</button>
              <button onClick={() => setShowDebug(false)} className="text-white uppercase font-bold p-2 bg-white/10 rounded">Close</button>
            </div>
          </div>
          <div className="select-all">
            {debugLogs.map((log, i) => (
              <div key={i} className="mb-2 pb-2 border-b border-green-900/50 whitespace-pre-wrap">{log}</div>
            ))}
          </div>
        </div>
      )}`;

code = code.replace(targetUI, replacementUI);

// 4. Make sure togglePlay logs correctly
const targetToggle = `        console.log(\`[CALLING_AUDIO_PLAY] from togglePlay\`);
        logDebug(\`[CALLING_AUDIO_PLAY] from togglePlay\`);
        audioRef.current.play().catch((err: any) => {
          logDebug(\`togglePlay native play rejected: \${err.message}\`);`;

const replacementToggle = `        console.log(\`[CALLING_AUDIO_PLAY] from togglePlay\`);
        logDebug(\`[AUDIO_STATE_BEFORE] (togglePlay)\`, audioRef.current);
        logDebug(\`[CALLING_AUDIO_PLAY] from togglePlay\`);
        audioRef.current.play().then(() => {
          logDebug(\`[PLAY_PROMISE_RESOLVED] from togglePlay\`);
        }).catch((err: any) => {
          logDebug(\`[PLAY_PROMISE_REJECTED] from togglePlay\\n  error.name: \${err.name}\\n  error.message: \${err.message}\`);`;

code = code.replace(targetToggle, replacementToggle);

// 5. Make sure playSong logs correctly
const targetPlaySong = `      console.log(\`[CALLING_AUDIO_LOAD]\`);
      logDebug(\`[CALLING_AUDIO_LOAD]\`);
      audioRef.current.load();
      
      console.log(\`[PLAY_CALL] paused=\${audioRef.current.paused} readyState=\${audioRef.current.readyState} networkState=\${audioRef.current.networkState}\`);
      logDebug(\`[PLAY_CALL] paused=\${audioRef.current.paused} readyState=\${audioRef.current.readyState} networkState=\${audioRef.current.networkState}\`);
      const playPromise = audioRef.current.play();`;

const replacementPlaySong = `      console.log(\`[CALLING_AUDIO_LOAD]\`);
      logDebug(\`[CALLING_AUDIO_LOAD]\`);
      audioRef.current.load();
      
      logDebug(\`[AUDIO_STATE_BEFORE] (playSong)\`, audioRef.current);
      logDebug(\`[CALLING_AUDIO_PLAY] from playSong\`);
      const playPromise = audioRef.current.play();`;

code = code.replace(targetPlaySong, replacementPlaySong);

// 6. playSong catch
const targetCatch = `           console.log(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
           logDebug(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
           logDebug(\`Native play rejected: \${err.message}\`);`;

const replacementCatch = `           console.log(\`[PLAY_PROMISE_REJECTED] from playSong name=\${err.name} message=\${err.message}\`);
           logDebug(\`[PLAY_PROMISE_REJECTED] from playSong\\n  error.name: \${err.name}\\n  error.message: \${err.message}\`);`;

code = code.replace(targetCatch, replacementCatch);

// 7. playSong resolve
const targetResolve = `           playPromise.then(() => {
              console.log(\`[PLAY_PROMISE_RESOLVED]\`);
              logDebug(\`[PLAY_PROMISE_RESOLVED]\`);
           }).catch((err) => {`;

const replacementResolve = `           playPromise.then(() => {
              console.log(\`[PLAY_PROMISE_RESOLVED] from playSong\`);
              logDebug(\`[PLAY_PROMISE_RESOLVED] from playSong\`);
           }).catch((err) => {`;
           
code = code.replace(targetResolve, replacementResolve);

fs.writeFileSync('src/app/page.tsx', code);
