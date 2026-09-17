const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Wipe the `ref={lyricsContainerRef}` from JSX
code = code.replace(/ref=\{lyricsContainerRef\}/g, '');

// Wipe the `// Snap back immediately when timeout finishes` block inside handleUserInteraction
const snapRegex = /\/\/ Snap back immediately when timeout finishes[\s\S]*?\}\n        \}\n      \}/g;
code = code.replace(snapRegex, '');

// Wipe the setTimeout in the isLyricsExpanded useEffect
const expandRegex = /lastScrolledIndex\.current = -1; \/\/ force re-scroll[\s\S]*?\}\n      \}\n    \}, 100\);/g;
code = code.replace(expandRegex, '');

fs.writeFileSync('src/app/page.tsx', code);
