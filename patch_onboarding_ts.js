const fs = require('fs');
let code = fs.readFileSync('src/app/Onboarding.tsx', 'utf-8');

const target1 = `        if (res?.error) setError(res.error);`;
const replace1 = `        if (res && "error" in res) setError(res.error);`;

code = code.split(target1).join(replace1);

fs.writeFileSync('src/app/Onboarding.tsx', code);
