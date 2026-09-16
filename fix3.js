const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// fix playPreviousSong
code = code.replace(/const currentAudioTime = useNativeAudio && audioRef\.current \? audioRef\.current\.currentTime : progress;/g, 'const currentAudioTime = audioRef.current ? audioRef.current.currentTime : progress;');
code = code.replace(/if \(playerRef\.current && typeof playerRef\.current\.seekTo === 'function'\) \{\s*playerRef\.current\.seekTo\(0, true\);\s*\}/g, '');

// fix useEffect
code = code.replace(/useNativeAudio\]\);/g, ']);');

// fix lyrics click
code = code.replace(/if \(playerRef\.current\) \{\s*playerRef\.current\.seekTo\(line\.time, true\);\s*setProgress\(line\.time\);\s*isUserScrolling\.current = false;\s*\}/g, 'setProgress(line.time);\n                                    isUserScrolling.current = false;');

fs.writeFileSync('src/app/page.tsx', code);
