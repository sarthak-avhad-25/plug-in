const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Find the bad block and replace it with just useState(false);
const badBlockStartStr = '  const [isClient, setIsClient] = useState(false);\\n\\n  // CRITICAL FIX: iOS Safari';
const badRegex = /  const \[isClient, setIsClient\] = useState\(false\);\n\n  \/\/ CRITICAL FIX: iOS Safari[\s\S]*?audio\.removeEventListener\("ended", handleNativeEnded\);\n  \}, \[\]\);/m;

code = code.replace(badRegex, '  const [isClient, setIsClient] = useState(false);');

fs.writeFileSync('src/app/page.tsx', code);
