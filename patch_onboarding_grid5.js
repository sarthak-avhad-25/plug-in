const fs = require('fs');
let code = fs.readFileSync('src/app/Onboarding.tsx', 'utf-8');

// Change grid-cols-10 back to grid-cols-5
// Current: grid grid-cols-5 md:grid-cols-10 gap-3 md:gap-4 max-h-[16rem] overflow-y-auto custom-scrollbar pr-2 py-2 w-full justify-items-center
// New: grid grid-cols-5 gap-4 md:gap-6 max-h-[24rem] overflow-y-auto custom-scrollbar pr-2 py-4 w-full justify-items-center
code = code.replace(
  'grid grid-cols-5 md:grid-cols-10 gap-3 md:gap-4 max-h-[16rem] overflow-y-auto custom-scrollbar pr-2 py-2',
  'grid grid-cols-5 gap-4 md:gap-6 max-h-[24rem] overflow-y-auto custom-scrollbar pr-2 py-4'
);

// We should also bump the avatar size up just slightly since 5 across a max-w-5xl is very spacious.
// Current: w-16 h-16 md:w-20 md:h-20
// Let's make it w-20 h-20 md:w-24 md:h-24
code = code.replace(
  'w-16 h-16 md:w-20 md:h-20 rounded-full',
  'w-20 h-20 md:w-28 md:h-28 rounded-full'
);

fs.writeFileSync('src/app/Onboarding.tsx', code);
