const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');
code = code.replace(/  };\s*setLyrics\(\[\]\);/g, '    setLyrics([]);');
fs.writeFileSync('src/app/page.tsx', code);
