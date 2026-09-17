const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetHeader = `<div className="flex justify-between items-center border-b-4 border-white/30 pb-4">
            <h1 `;
const replaceHeader = `<div className="flex justify-start items-center gap-4 border-b-4 border-white/30 pb-4">
            <h1 `;

code = code.replace(targetHeader, replaceHeader);

fs.writeFileSync('src/app/page.tsx', code);
