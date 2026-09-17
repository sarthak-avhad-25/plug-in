const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative pointer-events-none">
                      <div 
                        className="absolute top-0 left-0 h-full bg-[#D4FF00] transition-none"
                        style={{ width: \`\${duration ? ((isDraggingTimeline ? dragProgress : progress) / duration) * 100 : 0}%\` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-white/50 tabular-nums">
                    <span>{Math.floor((isDraggingTimeline ? dragProgress : progress) / 60)}:{(Math.floor((isDraggingTimeline ? dragProgress : progress) % 60)).toString().padStart(2, "0")}</span>
                    <span>-{Math.floor((duration - (isDraggingTimeline ? dragProgress : progress)) / 60)}:{(Math.floor((duration - (isDraggingTimeline ? dragProgress : progress)) % 60)).toString().padStart(2, "0")}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-between w-full">`;

const replaceStr = `                    <div className="w-full h-1.5 bg-white/10 rounded-full relative pointer-events-none transition-all duration-200">
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-[#D4FF00] transition-none"
                          style={{ width: \`\${duration ? ((isDraggingTimeline ? dragProgress : progress) / duration) * 100 : 0}%\` }}
                        />
                      </div>
                      <div 
                        className={\`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_#D4FF00] transition-opacity \${isDraggingTimeline ? 'opacity-100' : 'opacity-0'}\`}
                        style={{ left: \`calc(\${duration ? ((isDraggingTimeline ? dragProgress : progress) / duration) * 100 : 0}% - 8px)\` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-white/40 tracking-widest tabular-nums">
                    <span>{Math.floor((isDraggingTimeline ? dragProgress : progress) / 60)}:{(Math.floor((isDraggingTimeline ? dragProgress : progress) % 60)).toString().padStart(2, "0")}</span>
                    <span>-{Math.floor((duration - (isDraggingTimeline ? dragProgress : progress)) / 60)}:{(Math.floor((duration - (isDraggingTimeline ? dragProgress : progress)) % 60)).toString().padStart(2, "0")}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-between w-full px-2">`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
