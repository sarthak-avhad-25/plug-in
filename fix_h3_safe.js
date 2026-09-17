const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

code = code.replace(/<h3/g, '<h2').replace(/<\/h3>/g, '</h2>');
code = code.replace(/<motion\.h3/g, '<motion.h2').replace(/<\/motion\.h3>/g, '</motion.h2>');

fs.writeFileSync('src/app/page.tsx', code);
