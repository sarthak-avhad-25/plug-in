const fs = require('fs');
let code = fs.readFileSync('src/app/Onboarding.tsx', 'utf-8');

// Container width & padding
code = code.replace('max-w-xl', 'max-w-3xl');
code = code.replace('rounded-[2.5rem] p-8 md:p-12', 'rounded-[3rem] p-10 md:p-16');

// Text sizing
code = code.replace('text-4xl font-black', 'text-5xl font-black');

// Input field sizing
code = code.replace('text-2xl text-white font-black', 'text-3xl text-white font-black');
code = code.replace('px-8 py-6', 'px-10 py-8');
code = code.replace('rounded-[1.5rem]', 'rounded-[2rem]');
// Since 'rounded-[1.5rem]' was also used on the button, this will scale the button border radius too.

// Avatar grid sizing
code = code.replace('w-16 h-16 md:w-20 md:h-20', 'w-20 h-20 md:w-28 md:h-28');
code = code.replace('max-h-60', 'max-h-[30rem]');

// Submit button sizing
code = code.replace('text-2xl tracking-wide rounded-[1.5rem] py-6 mt-6', 'text-3xl font-black tracking-wide rounded-[2rem] py-8 mt-8');

fs.writeFileSync('src/app/Onboarding.tsx', code);
