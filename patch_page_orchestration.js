const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const importTarget = `import { Onboarding } from "./Onboarding";`;
const importReplace = `import { Onboarding } from "./Onboarding";\nimport { ProfileSelector } from "./ProfileSelector";`;
code = code.replace(importTarget, importReplace);

const stateTarget = `  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
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

const stateReplace = `  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isProfileChecking, setIsProfileChecking] = useState(true);
  const [showProfileCreator, setShowProfileCreator] = useState(false);

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

const uiTarget = `  if (isProfileChecking) return <div className="fixed inset-0 bg-[#020005]" />;
  if (!activeProfile) {
    return (
      <Onboarding onComplete={(profile) => {
        setActiveProfile(profile);
        localStorage.setItem("music_active_profile", JSON.stringify(profile));
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 4000);
      }} />
    );
  }`;

const uiReplace = `  if (isProfileChecking) return <div className="fixed inset-0 bg-[#020005]" />;
  
  if (!activeProfile && profiles.length > 0 && !showProfileCreator) {
    return (
      <ProfileSelector 
        profiles={profiles}
        activeProfileId={activeProfile?.id}
        onSelect={(p) => {
          setActiveProfile(p);
          localStorage.setItem("music_active_profile", JSON.stringify(p));
          setShowGreeting(true);
          setTimeout(() => setShowGreeting(false), 4000);
        }}
        onAdd={() => setShowProfileCreator(true)}
        onEdit={(p, newName) => {
          const updated = profiles.map(prof => prof.id === p.id ? { ...prof, name: newName } : prof);
          saveProfiles(updated);
          if (activeProfile?.id === p.id) {
             const updatedActive = { ...p, name: newName };
             setActiveProfile(updatedActive);
             localStorage.setItem("music_active_profile", JSON.stringify(updatedActive));
          }
        }}
        onDelete={(p) => {
          const updated = profiles.filter(prof => prof.id !== p.id);
          saveProfiles(updated);
          localStorage.removeItem(\`frans_hals_playlists_\${p.id}\`);
          if (activeProfile?.id === p.id) {
             setActiveProfile(null);
             localStorage.removeItem("music_active_profile");
          }
        }}
      />
    );
  }

  if (!activeProfile || showProfileCreator) {
    return (
      <Onboarding onComplete={(profile) => {
        const updated = [...profiles, profile];
        saveProfiles(updated);
        setActiveProfile(profile);
        localStorage.setItem("music_active_profile", JSON.stringify(profile));
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 4000);
        setShowProfileCreator(false);
      }} />
    );
  }`;

code = code.replace(uiTarget, uiReplace);

const logoutTarget = `<button 
                  onClick={() => {
                    localStorage.removeItem("music_active_profile");
                    setActiveProfile(null);
                  }}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 px-4 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-md transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <Power className="w-4 h-4" /> Reset Profile
                </button>`;

const logoutReplace = `<button 
                  onClick={() => {
                    setActiveProfile(null);
                  }}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 px-4 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-md transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <Power className="w-4 h-4" /> Switch Profile
                </button>`;

code = code.replace(logoutTarget, logoutReplace);

fs.writeFileSync('src/app/page.tsx', code);
