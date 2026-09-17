const fs = require('fs');
let code = fs.readFileSync('src/app/Onboarding.tsx', 'utf-8');

// Container width & padding
code = code.replace('max-w-lg', 'max-w-xl');
code = code.replace('rounded-[2rem] p-8 md:p-10', 'rounded-[2.5rem] p-8 md:p-12');

// Text sizing
code = code.replace('text-3xl font-bold', 'text-4xl font-black');

// Input field sizing
code = code.replace('text-xl text-white font-bold', 'text-2xl text-white font-black');
code = code.replace('px-6 py-5', 'px-8 py-6');
code = code.replace('rounded-2xl', 'rounded-[1.5rem]');

// Avatar grid sizing
// We have: w-14 h-14 md:w-16 md:h-16 rounded-full
code = code.replace('w-14 h-14 md:w-16 md:h-16 rounded-full', 'w-16 h-16 md:w-20 md:h-20 rounded-full');
// And: max-h-48 -> max-h-60
code = code.replace('max-h-48', 'max-h-60');

// Submit button sizing
code = code.replace('text-xl rounded-2xl py-5 mt-4', 'text-2xl tracking-wide rounded-[1.5rem] py-6 mt-6');

fs.writeFileSync('src/app/Onboarding.tsx', code);
