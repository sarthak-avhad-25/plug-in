const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `            <div className="relative group/profile flex items-center">
              <button 
                className={\`w-10 h-10 rounded-full bg-gradient-to-br \${activeProfile.color} flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform flex-shrink-0 border-2 border-white/20\`}
                title={activeProfile.name}
              >
                {activeProfile.emoji}
              </button>`;

const replace = `            <div className="relative group/profile flex items-center">
              <button 
                onClick={() => setShowProfileSelector(true)}
                className={\`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform flex-shrink-0 border-2 border-white/20 \${!activeProfile.avatar ? \`bg-gradient-to-br \${activeProfile.color}\` : ''}\`}
                title={activeProfile.name}
              >
                {activeProfile.avatar ? (
                  <img src={activeProfile.avatar} alt={activeProfile.name} className="w-full h-full object-cover" />
                ) : (
                  activeProfile.emoji
                )}
              </button>`;

code = code.replace(target, replace);
fs.writeFileSync('src/app/page.tsx', code);
