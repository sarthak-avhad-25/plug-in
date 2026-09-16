const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Remove onReady
code = code.replace(/  const onReady = \(\w+: any\) => \{[\s\S]*?  \};\n/g, '');

// Remove onStateChange
code = code.replace(/  const onStateChange = \(\w+: any\) => \{[\s\S]*?  \};\n/g, '');

// Remove onYouTubeError
code = code.replace(/  const onYouTubeError = async \(\w+: any\) => \{[\s\S]*?  \};\n/g, '');

// Remove useNativeAudio references in onEnded, onLoadedMetadata, and setProgress
code = code.replace(/if\s*\(useNativeAudio\)\s*\{/g, '{');
code = code.replace(/if\s*\(useNativeAudio\s*&&\s*e\.currentTarget\.duration\)/g, 'if (e.currentTarget.duration)');

// Remove MediaSession playerRef references
code = code.replace(/\} else if \(playerRef\.current\) \{[\s\S]*?\}/g, '}');
code = code.replace(/\} else if \(playerRef\.current\) \{[\s\S]*?currentTime = playerRef\.current\.getCurrentTime\(\);\n\s*\}/g, '}');
code = code.replace(/if \(playerRef\.current\) \{\s*playerRef\.current\.seekTo\(newTime, true\);\s*\}/g, '');

// Remove timeline playerRef references
code = code.replace(/if \(playerRef\.current\) \{\s*playerRef\.current\.pauseVideo\(\);\s*\}/g, '');
code = code.replace(/if \(playerRef\.current\) playerRef\.current\.seekTo\(newTime, true\);/g, '');
code = code.replace(/if \(playerRef\.current\) playerRef\.current\.seekTo\(line\.time, true\);/g, '');
code = code.replace(/if \(playerRef\.current\)\s*\{\s*playerRef\.current\.seekTo\(line\.time, true\);\s*\}/g, '');
code = code.replace(/\} else if \(playerRef\.current\) \{\s*playerRef\.current\.playVideo\(\);\s*\}/g, '}');

// Remove progressInterval completely as we only use onTimeUpdate now
code = code.replace(/const progressInterval = useRef<NodeJS\.Timeout \| null>\(null\);\n/g, '');
code = code.replace(/if \(progressInterval\.current\) clearInterval\(progressInterval\.current\);/g, '');

fs.writeFileSync('src/app/page.tsx', code);
