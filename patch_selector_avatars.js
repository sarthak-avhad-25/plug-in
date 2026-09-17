const fs = require('fs');
let code = fs.readFileSync('src/app/ProfileSelector.tsx', 'utf-8');

const target = `                    <div className={\`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transition-transform duration-300 group-hover:scale-105 bg-gradient-to-br \${p.color}\`}>
                      {p.emoji}
                    </div>`;

const replace = `                    {p.avatar ? (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-xl transition-transform duration-300 group-hover:scale-105 shrink-0 border-2 border-transparent group-hover:border-white/20">
                        <img src={p.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={\`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transition-transform duration-300 group-hover:scale-105 bg-gradient-to-br \${p.color || "from-gray-600 to-gray-800"}\`}>
                        {p.emoji || "👤"}
                      </div>
                    )}`;

code = code.replace(target, replace);
fs.writeFileSync('src/app/ProfileSelector.tsx', code);
