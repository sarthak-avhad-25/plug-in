const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);`;
const replaceStr = `  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
