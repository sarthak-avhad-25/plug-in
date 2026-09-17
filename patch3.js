const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');
const lines = code.split('\n');

const startIdx = lines.findIndex(l => l.includes('  if (isAuthLoading) return <div className="fixed inset-0 bg-[#020005]" />;'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('                <span className="text-white text-xl font-medium tracking-wide group-hover:text-[#D4FF00] transition-colors">{p.name}</span>'));

if (startIdx !== -1 && endIdx !== -1) {
  // Find the exact end of the block
  let finalEnd = endIdx;
  for (let i = endIdx; i < lines.length; i++) {
    if (lines[i].includes('  }')) {
      finalEnd = i;
      break;
    }
  }

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
  }`;

  lines.splice(startIdx, finalEnd - startIdx + 1, newBlock);
  fs.writeFileSync('src/app/page.tsx', lines.join('\n'));
} else {
  console.log("Could not find start or end index:", startIdx, endIdx);
}
