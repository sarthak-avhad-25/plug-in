const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Remove auth imports
code = code.replace(
  `import { Onboarding } from "./Onboarding";\nimport { logout, type AuthUser, getSessionUser } from "./auth";`,
  `import { Onboarding } from "./Onboarding";`
);

// 2. State replacement
const oldStateBlock = `  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  useEffect(() => {
    getSessionUser().then(user => {
      if (user) {
        setAuthUser(user);
        const profile = { id: user.id, name: user.name, color: "from-blue-600 to-purple-700", emoji: "🎧" };
        setActiveProfile(profile);
      }
      setIsAuthLoading(false);
    });
  }, []);`;

const newStateBlock = `  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isProfileChecking, setIsProfileChecking] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("music_active_profile");
    if (saved) {
      try {
        setActiveProfile(JSON.parse(saved));
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 4000);
      } catch (e) {
        console.error("Failed to parse saved profile");
      }
    }
    setIsProfileChecking(false);
  }, []);`;
code = code.replace(oldStateBlock, newStateBlock);

// 3. Greeting replacement
code = code.replace(`{showGreeting && authUser && (`, `{showGreeting && activeProfile && (`);
code = code.replace(`{authUser.name.split(' ')[0]}`, `{activeProfile.name.split(' ')[0]}`);

// 4. Logout replacement
const logoutTarget = `<button 
                  onClick={async () => {
                    await logout();
                    setAuthUser(null);
                    setActiveProfile(null);
                  }}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 px-4 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-md transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <Power className="w-4 h-4" /> Sign Out
                </button>`;
const logoutReplace = `<button 
                  onClick={() => {
                    localStorage.removeItem("music_active_profile");
                    setActiveProfile(null);
                  }}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 px-4 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-md transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <Power className="w-4 h-4" /> Reset Profile
                </button>`;
code = code.replace(logoutTarget, logoutReplace);


// 5. Huge UI block replacement
const startStr = `  if (isAuthLoading) return <div className="fixed inset-0 bg-[#020005]" />;`;
const endStr = `  return (
    <div className="min-h-screen`;

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const newBlock = `  if (isProfileChecking) return <div className="fixed inset-0 bg-[#020005]" />;
  if (!activeProfile) {
    return (
      <Onboarding onComplete={(profile) => {
        setActiveProfile(profile);
        localStorage.setItem("music_active_profile", JSON.stringify(profile));
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 4000);
      }} />
    );
  }

`;
  code = code.substring(0, startIdx) + newBlock + code.substring(endIdx);
} else {
  console.log("Could not find start or end bounds!");
}

fs.writeFileSync('src/app/page.tsx', code);
