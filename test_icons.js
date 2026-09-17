const fs = require('fs');
const code = fs.readFileSync('src/app/page.tsx', 'utf-8');
const newIcons = 'Moon, Power, Maximize, Minimize, Expand';
console.log(code.includes('lucide-react'));
