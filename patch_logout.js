const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `            <button 
              onClick={() => {
                setActiveProfile(null);
                localStorage.removeItem("music_active_profile");
              }}
              className={\`w-10 h-10 rounded-none bg-gradient-to-br \${activeProfile.color} flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform flex-shrink-0 border-2 border-white/20\`}
              title="Switch Profile"
            >
              {activeProfile.emoji}
            </button>`;

const replaceStr = `            <div className="relative group/profile flex items-center">
              <button 
                className={\`w-10 h-10 rounded-full bg-gradient-to-br \${activeProfile.color} flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform flex-shrink-0 border-2 border-white/20\`}
                title={activeProfile.name}
              >
                {activeProfile.emoji}
              </button>
              
              <div className="absolute top-full right-0 mt-2 opacity-0 pointer-events-none group-hover/profile:opacity-100 group-hover/profile:pointer-events-auto transition-all duration-200 z-50">
                <button 
                  onClick={async () => {
                    await logout();
                    setAuthUser(null);
                    setActiveProfile(null);
                  }}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 px-4 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-md transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <Power className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
