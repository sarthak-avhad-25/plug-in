const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

code = code.replace(
  'className="w-full max-w-2xl mx-auto mt-12 mb-8',
  'className="w-[40%] max-w-2xl mx-auto mt-12 mb-8'
);

fs.writeFileSync('src/app/page.tsx', code);
