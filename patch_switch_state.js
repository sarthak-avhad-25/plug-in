const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Add showProfileSelector state
code = code.replace(
  `  const [showProfileCreator, setShowProfileCreator] = useState(false);`,
  `  const [showProfileCreator, setShowProfileCreator] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);`
);

// 2. Change the Switch Profile button
const switchTarget = `<button 
                  onClick={() => {
                    setActiveProfile(null);
                  }}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 px-4 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-md transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <Power className="w-4 h-4" /> Switch Profile
                </button>`;

const switchReplace = `<button 
                  onClick={() => {
                    setShowProfileSelector(true);
                  }}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-md transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  Switch Profile
                </button>`;
code = code.replace(switchTarget, switchReplace);

// 3. Update the huge UI block conditions
const uiTarget = `  if (!activeProfile && profiles.length > 0 && !showProfileCreator) {
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

const uiReplace = `  if (showProfileSelector || (!activeProfile && profiles.length > 0 && !showProfileCreator)) {
    return (
      <ProfileSelector 
        profiles={profiles}
        activeProfileId={activeProfile ? activeProfile.id : undefined}
        onSelect={(p) => {
          setActiveProfile(p);
          localStorage.setItem("music_active_profile", JSON.stringify(p));
          setShowGreeting(true);
          setTimeout(() => setShowGreeting(false), 4000);
          setShowProfileSelector(false);
        }}
        onAdd={() => {
          setShowProfileCreator(true);
          setShowProfileSelector(false);
        }}
        onEdit={(p, newName) => {
          const updated = profiles.map(prof => prof.id === p.id ? { ...prof, name: newName } : prof);
          saveProfiles(updated);
          if (activeProfile && activeProfile.id === p.id) {
             const updatedActive = { ...p, name: newName };
             setActiveProfile(updatedActive);
             localStorage.setItem("music_active_profile", JSON.stringify(updatedActive));
          }
        }}
        onDelete={(p) => {
          const updated = profiles.filter(prof => prof.id !== p.id);
          saveProfiles(updated);
          localStorage.removeItem(\`frans_hals_playlists_\${p.id}\`);
          if (activeProfile && activeProfile.id === p.id) {
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
fs.writeFileSync('src/app/page.tsx', code);
