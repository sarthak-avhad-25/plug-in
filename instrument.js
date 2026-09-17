const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Instrument playSong
const playSongStartTarget = `  const playSong = async (song: Song, addToHistory: boolean = true, context: "radio" | "playlist" = "radio", overridePlaylistSongs?: Song[], e?: React.MouseEvent) => {
    const currentId = ++playRequestIdRef.current;`;
const playSongStartReplacement = `  const playSong = async (song: Song, addToHistory: boolean = true, context: "radio" | "playlist" = "radio", overridePlaylistSongs?: Song[], e?: React.MouseEvent) => {
    const currentId = ++playRequestIdRef.current;
    console.log(\`[TAP] trackId=\${song.id}\`);
    logDebug(\`[TAP] trackId=\${song.id}\`);
    console.log(\`[SELECT_TRACK] trackId=\${song.id}\`);
    logDebug(\`[SELECT_TRACK] trackId=\${song.id}\`);`;
code = code.replace(playSongStartTarget, playSongStartReplacement);

const fetchTarget = `      logDebug(\`Validating native source...\`);`;
const fetchReplacement = `      console.log(\`[RESOLVE_SOURCE_START] trackId=\${song.id}\`);
      logDebug(\`[RESOLVE_SOURCE_START] trackId=\${song.id}\`);
      logDebug(\`Validating native source...\`);`;
code = code.replace(fetchTarget, fetchReplacement);

const validTarget = `        logDebug(\`Native source valid (HTTP \${res.status})\`);
        setUseNativeAudio(true);
        if (audioRef.current) {
          audioRef.current.src = \`/api/audio?v=\${song.id}\`;
          audioRef.current.load();
          const playPromise = audioRef.current.play();`;
const validReplacement = `        logDebug(\`Native source valid (HTTP \${res.status})\`);
        console.log(\`[SOURCE_RESOLVED] url=/api/audio?v=\${song.id}\`);
        logDebug(\`[SOURCE_RESOLVED] url=/api/audio?v=\${song.id}\`);
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
          const playPromise = audioRef.current.play();`;
code = code.replace(validTarget, validReplacement);

const promiseTarget = `            playPromise.then(() => {
              if (shouldPlayRef.current) {`;
const promiseReplacement = `            playPromise.then(() => {
              console.log(\`[PLAY_PROMISE_RESOLVED]\`);
              logDebug(\`[PLAY_PROMISE_RESOLVED]\`);
              if (shouldPlayRef.current) {`;
code = code.replace(promiseTarget, promiseReplacement);

const rejectTarget = `            }).catch((err) => {
              logDebug(\`Native play rejected after load: \${err.message}\`);`;
const rejectReplacement = `            }).catch((err) => {
              console.log(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
              logDebug(\`[PLAY_PROMISE_REJECTED] name=\${err.name} message=\${err.message}\`);
              logDebug(\`Native play rejected after load: \${err.message}\`);`;
code = code.replace(rejectTarget, rejectReplacement);

// 2. Instrument audio events
const eventsTarget = `        onError={(e) => {
          const err = e.currentTarget.error;
          logDebug(\`Native audio error event! Code: \${err?.code} Msg: \${err?.message}\`, e.currentTarget);`;
const eventsReplacement = `        onError={(e) => {
          const err = e.currentTarget.error;
          console.log(\`[AUDIO_ERROR_EVENT]\`);
          logDebug(\`[AUDIO_ERROR_EVENT]\`);
          logDebug(\`Native audio error event! Code: \${err?.code} Msg: \${err?.message}\`, e.currentTarget);`;
code = code.replace(eventsTarget, eventsReplacement);

const onPlayTarget = `        onPlay={(e) => {
          logDebug(\`Native onPlay fired!\`, e.currentTarget);`;
const onPlayReplacement = `        onPlay={(e) => {
          console.log(\`[AUDIO_PLAY_EVENT]\`);
          logDebug(\`[AUDIO_PLAY_EVENT]\`);
          logDebug(\`Native onPlay fired!\`, e.currentTarget);`;
code = code.replace(onPlayTarget, onPlayReplacement);

const onPlayingTarget = `        onPlaying={(e) => {
          logDebug(\`Native onPlaying fired!\`, e.currentTarget);`;
const onPlayingReplacement = `        onPlaying={(e) => {
          console.log(\`[AUDIO_PLAYING_EVENT]\`);
          logDebug(\`[AUDIO_PLAYING_EVENT]\`);
          logDebug(\`Native onPlaying fired!\`, e.currentTarget);`;
code = code.replace(onPlayingTarget, onPlayingReplacement);

const onPauseTarget = `        onPause={(e) => {
          logDebug(\`Native onPause fired!\`, e.currentTarget);`;
const onPauseReplacement = `        onPause={(e) => {
          console.log(\`[AUDIO_PAUSE_EVENT]\`);
          logDebug(\`[AUDIO_PAUSE_EVENT]\`);
          logDebug(\`Native onPause fired!\`, e.currentTarget);`;
code = code.replace(onPauseTarget, onPauseReplacement);

const onWaitingTarget = `        onWaiting={(e) => {
          logDebug(\`Native onWaiting (buffering) fired!\`, e.currentTarget);`;
const onWaitingReplacement = `        onWaiting={(e) => {
          console.log(\`[AUDIO_WAITING_EVENT]\`);
          logDebug(\`[AUDIO_WAITING_EVENT]\`);
          logDebug(\`Native onWaiting (buffering) fired!\`, e.currentTarget);`;
code = code.replace(onWaitingTarget, onWaitingReplacement);

const onEndedTarget = `        onEnded={() => {
          if (useNativeAudio) {
            logDebug(\`Native onEnded fired!\`);`;
const onEndedReplacement = `        onEnded={() => {
          if (useNativeAudio) {
            console.log(\`[AUDIO_ENDED_EVENT]\`);
            logDebug(\`[AUDIO_ENDED_EVENT]\`);
            logDebug(\`Native onEnded fired!\`);`;
code = code.replace(onEndedTarget, onEndedReplacement);

const togglePlayPauseTarget = `        audioRef.current.pause();`;
const togglePlayPauseReplacement = `        console.log(\`[CALLING_AUDIO_PAUSE] from togglePlay\`);
        logDebug(\`[CALLING_AUDIO_PAUSE] from togglePlay\`);
        audioRef.current.pause();`;
code = code.replace(togglePlayPauseTarget, togglePlayPauseReplacement);

const togglePlayPlayTarget = `        audioRef.current.play().catch((err: any) => {`;
const togglePlayPlayReplacement = `        console.log(\`[CALLING_AUDIO_PLAY] from togglePlay\`);
        logDebug(\`[CALLING_AUDIO_PLAY] from togglePlay\`);
        audioRef.current.play().catch((err: any) => {`;
code = code.replace(togglePlayPlayTarget, togglePlayPlayReplacement);

fs.writeFileSync('src/app/page.tsx', code);
