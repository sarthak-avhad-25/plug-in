const fs = require('fs');
let code = fs.readFileSync('src/app/Onboarding.tsx', 'utf-8');

// 1. Container width & padding
// Make it wider horizontally, shorter vertically
code = code.replace('max-w-3xl px-6', 'max-w-5xl px-8');
code = code.replace('rounded-[3rem] p-10 md:p-16', 'rounded-[3rem] px-10 py-6 md:px-20 md:py-10');

// 2. Adjust text margins to save vertical space
code = code.replace('className="text-center mb-8"', 'className="text-center mb-4"');
code = code.replace('text-xl md:text-2xl text-white/50 mt-4', 'text-xl md:text-2xl text-white/50 mt-2');

// 3. Make avatars a single wide row (grid-cols-10 instead of 5) to drastically cut vertical height
code = code.replace('grid grid-cols-5 gap-4 md:gap-5 max-h-[30rem]', 'grid grid-cols-5 md:grid-cols-10 gap-3 md:gap-4 max-h-[16rem]');

// 4. Slightly shrink avatars so 10 can fit on one row gracefully without wrapping or clipping
code = code.replace('w-20 h-20 md:w-28 md:h-28', 'w-16 h-16 md:w-20 md:h-20');

// 5. Adjust input/button vertical spacing
code = code.replace('flex flex-col gap-6', 'flex flex-col gap-4');
code = code.replace('text-lg md:text-xl font-bold tracking-widest mb-4', 'text-lg md:text-xl font-bold tracking-widest mb-2');
code = code.replace('text-3xl font-black tracking-wide rounded-[2rem] py-8 mt-8', 'text-3xl font-black tracking-wide rounded-[2rem] py-6 mt-4');
code = code.replace('px-10 py-8', 'px-10 py-6');

fs.writeFileSync('src/app/Onboarding.tsx', code);
