const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const importTarget = `import { Onboarding } from "./Onboarding";
import { logout, type AuthUser, getSessionUser } from "./auth";`;
const importReplace = `import { Onboarding } from "./Onboarding";`;
code = code.replace(importTarget, importReplace);

const stateTarget = `  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
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

const stateReplace = `  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
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
code = code.replace(stateTarget, stateReplace);

const authBlockStart = code.indexOf(`  if (isAuthLoading) return <div className="fixed inset-0 bg-[#020005]" />;`);
const fallbackStart = code.indexOf(`  // Fallback for types`);
const onboardingBlock = `  if (isProfileChecking) return <div className="fixed inset-0 bg-[#020005]" />;
  if (!activeProfile) {
    return (
      <Onboarding onComplete={(profile) => {
        setActiveProfile(profile);
        localStorage.setItem("music_active_profile", JSON.stringify(profile));
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 4000);
      }} />
    );
  }\n`;

if (authBlockStart !== -1 && fallbackStart !== -1) {
  code = code.substring(0, authBlockStart) + onboardingBlock + code.substring(fallbackStart);
}

const fallbackTypeStart = code.indexOf(`  // Fallback for types\n  if (!activeProfile) {`);
const fallbackTypeEnd = code.indexOf(`  return (`);

if (fallbackTypeStart !== -1 && fallbackTypeEnd !== -1) {
    code = code.substring(0, fallbackTypeStart) + code.substring(fallbackTypeEnd);
}


// Replace logout button logic with clear profile
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


const greetingTarget = `<span className="text-white font-medium">Welcome back, {authUser.name.split(' ')[0]}</span>`;
const greetingReplace = `<span className="text-white font-medium">Welcome back, {activeProfile.name.split(' ')[0]}</span>`;
code = code.replace(greetingTarget, greetingReplace);

const greetingCondTarget = `{showGreeting && authUser && (`;
const greetingCondReplace = `{showGreeting && activeProfile && (`;
code = code.replace(greetingCondTarget, greetingCondReplace);

fs.writeFileSync('src/app/page.tsx', code);
