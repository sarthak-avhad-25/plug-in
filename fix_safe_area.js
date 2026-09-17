const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// The main mobile container
const target1 = '<div className="flex md:hidden w-full h-[100dvh] flex-col bg-[#050505] text-[#F5F5F5] relative overflow-hidden font-sans">';
const replacement1 = '<div className="flex md:hidden w-full h-[100dvh] flex-col bg-[#050505] text-[#F5F5F5] relative overflow-hidden font-sans pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">';
code = code.replace(target1, replacement1);

// The FULL SCREEN PLAYER OVERLAY
const target2 = 'className="fixed inset-0 z-[100] bg-[#050505] flex flex-col"';
const replacement2 = 'className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"';
code = code.replace(target2, replacement2);

fs.writeFileSync('src/app/page.tsx', code);
