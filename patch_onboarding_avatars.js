const fs = require('fs');
let code = fs.readFileSync('src/app/Onboarding.tsx', 'utf-8');

const oldAvatars = `const AVATARS = [
  { id: "a1", color: "from-blue-600 to-purple-700", emoji: "🎧" },
  { id: "a2", color: "from-fuchsia-600 to-pink-600", emoji: "🎸" },
  { id: "a3", color: "from-emerald-500 to-teal-500", emoji: "🎹" },
  { id: "a4", color: "from-orange-500 to-red-500", emoji: "🥁" },
  { id: "a5", color: "from-cyan-400 to-blue-500", emoji: "🎵" },
  { id: "a6", color: "from-yellow-400 to-orange-500", emoji: "✨" },
];`;

const newAvatars = `const AVATARS = Array.from({ length: 10 }).map((_, i) => ({
  id: \`pic-\${i + 1}\`,
  image: \`/avatars/avatar-\${i + 1}.png\`
}));`;

code = code.replace(oldAvatars, newAvatars);

const submitLogicTarget = `      const avatar = AVATARS.find(a => a.id === selectedAvatarId) || AVATARS[0];
      const profile = {
        id: crypto.randomUUID(),
        name: username.trim(),
        color: avatar.color,
        emoji: avatar.emoji
      };`;

const submitLogicReplace = `      const avatar = AVATARS.find(a => a.id === selectedAvatarId) || AVATARS[0];
      const profile = {
        id: crypto.randomUUID(),
        name: username.trim(),
        avatar: avatar.image
      };`;

code = code.replace(submitLogicTarget, submitLogicReplace);

const formTarget = `                <div className="flex justify-center mb-4">
                  <div className="grid grid-cols-3 gap-4">
                    {AVATARS.map(avatar => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        className={\`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all shadow-xl
                          bg-gradient-to-br \${avatar.color}
                          \${selectedAvatarId === avatar.id ? 'scale-110 ring-4 ring-[#D4FF00] z-10' : 'scale-90 opacity-60 hover:scale-100 hover:opacity-100'}
                        \`}
                      >
                        {avatar.emoji}
                      </button>
                    ))}
                  </div>
                </div>`;

const formReplace = `                <div className="flex justify-center mb-4 w-full overflow-hidden">
                  <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2 py-2 w-full justify-items-center">
                    {AVATARS.map(avatar => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        className={\`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden transition-all shadow-xl
                          \${selectedAvatarId === avatar.id ? 'scale-110 ring-4 ring-[#D4FF00] z-10 shadow-[0_0_20px_rgba(212,255,0,0.5)]' : 'scale-95 opacity-60 hover:scale-100 hover:opacity-100'}
                        \`}
                      >
                        <img src={avatar.image} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>`;

code = code.replace(formTarget, formReplace);

const appTransitionTarget = `              <div className={\`w-32 h-32 rounded-3xl flex items-center justify-center text-6xl bg-gradient-to-br \${AVATARS.find(a => a.id === selectedAvatarId)?.color}\`}>
                {AVATARS.find(a => a.id === selectedAvatarId)?.emoji}
              </div>`;

const appTransitionReplace = `              <div className="w-32 h-32 rounded-full overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                <img 
                  src={AVATARS.find(a => a.id === selectedAvatarId)?.image} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>`;

code = code.replace(appTransitionTarget, appTransitionReplace);

fs.writeFileSync('src/app/Onboarding.tsx', code);
