const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');
const lines = code.split('\n');

const startIdx = lines.findIndex(l => l.includes('  if (isAuthLoading) return <div className="fixed inset-0 bg-[#020005]" />;'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('          <h1 className="text-4xl md:text-6xl font-medium tracking-wide tracking-tight text-white mb-12 drop-shadow-xl">Who\'s listening?</h1>'));

if (startIdx !== -1 && endIdx !== -1) {
  // Find the exact end of the block
  let finalEnd = endIdx;
  let braces = 0;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes('if (!authUser) {')) braces++;
    if (lines[i].includes('if (!activeProfile) {')) braces++;
    if (lines[i].includes('    return (')) braces++;
    // We just know that the old code had an if(!authUser) block followed by if(!activeProfile) block.
    // It's safer to just find the `return () => clearTimeout(timeoutId);` which is earlier, wait no.
    // Let's just find the `      </div>\n    );\n  }` manually.
  }
}
