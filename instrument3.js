const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

code = code.replace(/const playNextSong = \(\) => \{/g, 'const playNextSong = () => {\n    console.log(`[NEXT_TRACK] triggered`);\n    logDebug(`[NEXT_TRACK] triggered`);');

fs.writeFileSync('src/app/page.tsx', code);
