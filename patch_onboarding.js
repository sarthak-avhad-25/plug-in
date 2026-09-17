const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');
const lines = code.split('\n');

const startIdx = lines.findIndex(line => line.includes('  if (!activeProfile) {'));
const endIdx = lines.findIndex((line, i) => i > startIdx && line.includes('      </div>') && lines[i+1]?.includes('    );'));

if (startIdx !== -1 && endIdx !== -1) {
  const replaceCode = `  if (!authUser) {
    return (
      <Onboarding onComplete={(user) => {
        setAuthUser(user);
        // Map the real user to an activeProfile seamlessly to preserve app architecture
        const profile = { id: user.id, name: user.name, color: "from-blue-600 to-purple-700", emoji: "🎧" };
        setActiveProfile(profile);
        localStorage.setItem("music_active_profile", JSON.stringify(profile));
        
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 4000);
      }} />
    );
  }`;
  lines.splice(startIdx, endIdx - startIdx + 2, replaceCode);
  fs.writeFileSync('src/app/page.tsx', lines.join('\n'));
} else {
  console.log("Could not find block", startIdx, endIdx);
}
