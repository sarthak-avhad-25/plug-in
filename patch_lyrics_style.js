const fs = require('fs');
let code = fs.readFileSync('src/app/components/LiveLyrics.tsx', 'utf-8');

// Update row styles
const targetRow = `              style={{
                opacity: isActive ? 1 : (isPast ? 0.3 : 0.4),
                transform: isActive ? 'scale(1.05)' : 'scale(0.95)',
                filter: isActive ? 'blur(0px)' : 'blur(0.5px)',
              }}`;
const replaceRow = `              style={{
                opacity: isActive ? 1 : 0.45,
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                filter: isActive ? 'blur(0px)' : 'blur(0.5px)',
              }}`;
code = code.replace(targetRow, replaceRow);

// Update word-by-word font weights and motion-reduce
const targetWord = `                    className="inline-block mr-2 md:mr-3 transition-all duration-300 ease-out"`;
const replaceWord = `                    className={\`inline-block mr-2 md:mr-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none \${isActive ? 'font-bold' : 'font-medium'}\`}`;
code = code.replace(targetWord, replaceWord);

// Update line-by-line font weights and motion-reduce
const targetLine = `                  className="inline-block transition-all duration-500 ease-out text-2xl md:text-4xl font-black tracking-tight leading-tight"`;
const replaceLine = `                  className={\`inline-block transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none text-2xl md:text-4xl tracking-tight leading-tight \${isActive ? 'font-bold' : 'font-medium'}\`}`;
code = code.replace(targetLine, replaceLine);

// Make row container motion-reduce aware and use cubic-bezier
const targetContainer = `              className="cursor-pointer transition-all duration-500 ease-out flex flex-wrap items-center justify-start origin-left"`;
const replaceContainer = `              className="cursor-pointer transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none flex flex-wrap items-center justify-start origin-left"`;
code = code.replace(targetContainer, replaceContainer);

fs.writeFileSync('src/app/components/LiveLyrics.tsx', code);
