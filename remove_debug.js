const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');
const block = `      {debugLogs.length > 0 && (
        <div className="fixed top-0 left-0 z-[9999] bg-black/80 text-green-400 font-mono text-[10px] p-2 pointer-events-none w-full max-h-[200px] overflow-hidden break-all">
          {debugLogs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      )}`;
code = code.replace(block, '');
fs.writeFileSync('src/app/page.tsx', code);
