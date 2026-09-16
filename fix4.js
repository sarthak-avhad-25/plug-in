const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

code = code.replace(/if\s*\(useNativeAudio\s*&&\s*e\.currentTarget\.duration\)/g, 'if (e.currentTarget.duration)');
code = code.replace(/if \(playerRef\.current\) \{\s*playerRef\.current\.seekTo\(line\.time, true\);\s*setProgress\(line\.time\);\s*isUserScrolling\.current = false;\s*\}/g, 'setProgress(line.time);\n                                    isUserScrolling.current = false;');
code = code.replace(/if \(playerRef\.current\) playerRef\.current\.seekTo\(newTime, true\);/g, '');

fs.writeFileSync('src/app/page.tsx', code);
