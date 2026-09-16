const fs = require('fs');

let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Remove useNativeAudio
code = code.replace(/const \[useNativeAudio, setUseNativeAudio\] = useState\(false\);\n/g, '');
code = code.replace(/setUseNativeAudio\((true|false)\);?/g, '');
code = code.replace(/if\s*\(useNativeAudio\s*&&\s*audioRef\.current\)/g, 'if (audioRef.current)');
code = code.replace(/if\s*\(useNativeAudio\)/g, 'if (true)');

// 2. Remove playerRef and YouTube entirely
code = code.replace(/import YouTube, \{ YouTubePlayer \} from "react-youtube";\n/g, '');
code = code.replace(/const playerRef = useRef<YouTubePlayer \| null>\(null\);\n/g, '');

// Remove the whole Hidden YouTube Player block
code = code.replace(/\{\/\* Hidden YouTube Player \*\/\}[\s\S]*?<\/div>/, '');
// Remove playerRef calls like playerRef.current?.pauseVideo();
code = code.replace(/if\s*\(playerRef\.current\)\s*playerRef\.current\.pauseVideo\(\);/g, '');
code = code.replace(/playerRef\.current\?\.pauseVideo\(\);/g, '');

fs.writeFileSync('src/app/page.tsx', code);
