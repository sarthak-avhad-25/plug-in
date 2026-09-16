const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Remove useNativeAudio
code = code.replace(/const \[useNativeAudio, setUseNativeAudio\] = useState\(false\);\n/g, '');
code = code.replace(/setUseNativeAudio\((true|false)\);?/g, '');
code = code.replace(/if\s*\(useNativeAudio\s*&&\s*audioRef\.current\)/g, 'if (audioRef.current)');
code = code.replace(/if\s*\(useNativeAudio\)/g, 'if (true)');
code = code.replace(/useNativeAudio\]\);/g, ']);');
code = code.replace(/const currentAudioTime = useNativeAudio && audioRef\.current \? audioRef\.current\.currentTime : progress;/g, 'const currentAudioTime = audioRef.current ? audioRef.current.currentTime : progress;');

// 2. Remove playerRef and YouTube entirely
code = code.replace(/import YouTube, \{ YouTubePlayer \} from "react-youtube";\n/g, '');
code = code.replace(/const playerRef = useRef<YouTubePlayer \| null>\(null\);\n/g, '');
code = code.replace(/\{\/\* Hidden YouTube Player \*\/\}[\s\S]*?<\/div>/, '');

// Remove all playerRef invocations
code = code.replace(/if\s*\(playerRef\.current\)\s*playerRef\.current\.pauseVideo\(\);/g, '');
code = code.replace(/playerRef\.current\?\.pauseVideo\(\);/g, '');
code = code.replace(/if\s*\(playerRef\.current\)\s*playerRef\.current\.playVideo\(\);/g, '');
code = code.replace(/\} else if \(playerRef\.current\) \{[\s\S]*?\}/g, '}');
code = code.replace(/if \(playerRef\.current\) \{\s*playerRef\.current\.pauseVideo\(\);\s*\}/g, '');
code = code.replace(/if \(playerRef\.current\) playerRef\.current\.seekTo\(newTime, true\);/g, '');
code = code.replace(/if \(playerRef\.current\) playerRef\.current\.seekTo\(line\.time, true\);/g, '');
code = code.replace(/if \(playerRef\.current\) \{\s*playerRef\.current\.seekTo\(0, true\);\s*\}/g, '');
code = code.replace(/if \(playerRef\.current && typeof playerRef\.current\.seekTo === 'function'\) \{\s*playerRef\.current\.seekTo\(0, true\);\s*\}/g, '');
code = code.replace(/if \(playerRef\.current\) \{\s*playerRef\.current\.seekTo\(line\.time, true\);\s*setProgress\(line\.time\);\s*isUserScrolling\.current = false;\s*\}/g, 'setProgress(line.time);\n                                    isUserScrolling.current = false;');
code = code.replace(/if \(playerRef\.current\) \{\s*playerRef\.current\.seekTo\(newTime, true\);\s*\}/g, '');
code = code.replace(/\} else if \(playerRef\.current\) \{\s*playerRef\.current\.playVideo\(\);\s*\}/g, '}');

// Remove progressInterval completely as we only use onTimeUpdate now
code = code.replace(/const progressInterval = useRef<NodeJS\.Timeout \| null>\(null\);\n/g, '');
code = code.replace(/if \(progressInterval\.current\) clearInterval\(progressInterval\.current\);/g, '');

// Remove YouTube handlers
code = code.replace(/  const onReady = \(\w+: any\) => \{[\s\S]*?  \};\n/g, '');
code = code.replace(/  const onStateChange = \(\w+: any\) => \{[\s\S]*?  \};\n/g, '');
code = code.replace(/  const onYouTubeError = async \(\w+: any\) => \{[\s\S]*?  \};\n/g, '');

fs.writeFileSync('src/app/page.tsx', code);
