const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `      let targetId = song.id;
      let res = await fetch(\`/api/audio?v=\${song.id}\`, { method: 'GET' });
      
      if (!res.ok) {
        const altId = await getAlternativeSourceId(song.title, song.artist);
        if (altId) {
          targetId = altId;
          res = await fetch(\`/api/audio?v=\${targetId}\`, { method: 'GET' });
        }
      }`;

const replaceStr = `      let targetId = song.id;
      let res = await fetch(\`/api/download?v=\${song.id}\`, { method: 'GET' });
      
      if (!res.ok) {
        const altId = await getAlternativeSourceId(song.title, song.artist);
        if (altId) {
          targetId = altId;
          res = await fetch(\`/api/download?v=\${targetId}\`, { method: 'GET' });
        }
      }`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
