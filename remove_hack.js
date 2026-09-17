const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `    if (audioRef.current) {
      audioRef.current.play().catch(()=>{});
      audioRef.current.pause(); // Prime native audio synchronously
    }`;

code = code.replace(target, '');

fs.writeFileSync('src/app/page.tsx', code);
