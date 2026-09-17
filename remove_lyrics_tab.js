const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Remove Lyrics tab button
code = code.replace(
  /<button onClick=\{\(\) => setPlayerTab\(playerTab === 'lyrics' \? null : 'lyrics'\)\}.*?Lyrics<\/button>/,
  ''
);

// Remove playerTab === 'lyrics' rendering block
const oldLyricsTabRegex = /\} : playerTab === 'lyrics' \? \([\s\S]*?\} : playerTab === 'related'/;
code = code.replace(oldLyricsTabRegex, '} : playerTab === \'related\'');

fs.writeFileSync('src/app/page.tsx', code);
