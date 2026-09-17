const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Imports
const importTarget = `import { loadProfiles, saveProfilesServer, loadActiveProfile, saveActiveProfileServer, loadPlaylistsServer, savePlaylistsServer, deletePlaylistsServer } from "./storage";`;
const importReplace = `import { loadProfiles, saveProfilesServer, loadActiveProfile, saveActiveProfileServer, loadPlaylistsServer, savePlaylistsServer, deletePlaylistsServer } from "./storage";
import { Onboarding } from "./Onboarding";
import { logout, type AuthUser, getSessionUser } from "./auth";`;
code = code.replace(importTarget, importReplace);

// 2. State
const stateTarget = `  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);`;
const stateReplace = `  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
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
code = code.replace(stateTarget, stateReplace);

// 3. UI replacement
const uiTarget = `  if (!activeProfile) {
    return (
      <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-center selection:bg-[#D4FF00] selection:text-white relative overflow-hidden">
        {/* Netflix style ambient background */}`;

const uiReplace = `  if (isAuthLoading) return <div className="fixed inset-0 bg-[#020005]" />;
  if (!authUser) {
    return (
      <Onboarding onComplete={(user) => {
        setAuthUser(user);
        const profile = { id: user.id, name: user.name, color: "from-blue-600 to-purple-700", emoji: "🎧" };
        setActiveProfile(profile);
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 4000);
      }} />
    );
  }
  // Fallback for types
  if (!activeProfile) {
    return (
      <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-center selection:bg-[#D4FF00] selection:text-white relative overflow-hidden">
        {/* Netflix style ambient background */}`;

code = code.replace(uiTarget, uiReplace);
fs.writeFileSync('src/app/page.tsx', code);
