const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Remove the useState for otpStep
code = code.replace('  const [otpStep, setOtpStep] = useState(true);\n', '');

// Remove setOtpStep(true) when opening modal
code = code.replace('                  setOtpStep(true);\n', '');

// Replace the modal content
const modalTarget = `              <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">
                {otpStep ? "Security Check" : "Create Profile"}
              </h2>
              <p className="text-gray-400 mb-6">
                {otpStep 
                  ? "To create a new profile, please enter the Admin OTP sent to 7972143404." 
                  : "OTP Verified! Enter new profile name:"}
              </p>
              
              <input 
                type={otpStep ? "number" : "text"}
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                placeholder={otpStep ? "Enter OTP" : "Profile Name"}
                className="w-full bg-[#000000]/10 border border-white/20 rounded-[2rem] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/50 mb-6"
                autoFocus
              />
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="px-5 py-2.5 rounded-[2rem] font-medium tracking-wide text-gray-300 hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (otpStep) {
                      if (modalInput === "2525") {
                        setOtpStep(false);
                        setModalInput("");
                      } else {
                        alert("Incorrect OTP! Profile creation blocked.");
                      }
                    } else {
                      if (modalInput.trim()) {
                        const colors = [
                          "from-red-500 to-orange-500", "from-green-400 to-emerald-600", "from-pink-500 to-rose-500", 
                          "from-blue-400 to-indigo-600", "from-yellow-400 to-orange-500", "from-purple-500 to-fuchsia-600",
                          "from-teal-400 to-cyan-600", "from-rose-400 to-red-500"
                        ];
                        const emojis = ["🎸", "🥁", "🎹", "🎤", "🎷", "🎺", "🎧", "🎵", "👾", "🦊", "🐯", "🐼", "😎", "🚀", "🌟"];
                        const newP = { 
                          id: Date.now().toString(), 
                          name: modalInput.trim(), 
                          color: colors[Math.floor(Math.random() * colors.length)],
                          emoji: emojis[Math.floor(Math.random() * emojis.length)]
                        };
                        saveProfiles([...profiles, newP]);
                        setShowProfileModal(false);
                      }
                    }
                  }}
                  className="px-5 py-2.5 bg-[#D4FF00] text-[#000000] rounded-[2rem] font-bold hover:bg-gray-200 transition-colors"
                >
                  {otpStep ? "Verify OTP" : "Create"}
                </button>
              </div>`;

const modalReplace = `              <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">
                Create Profile
              </h2>
              <p className="text-gray-400 mb-6">
                Enter new profile name:
              </p>
              
              <input 
                type="text"
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                placeholder="Profile Name"
                className="w-full bg-[#000000]/10 border border-white/20 rounded-[2rem] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/50 mb-6"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (modalInput.trim()) {
                      const colors = [
                        "from-red-500 to-orange-500", "from-green-400 to-emerald-600", "from-pink-500 to-rose-500", 
                        "from-blue-400 to-indigo-600", "from-yellow-400 to-orange-500", "from-purple-500 to-fuchsia-600",
                        "from-teal-400 to-cyan-600", "from-rose-400 to-red-500"
                      ];
                      const emojis = ["🎸", "🥁", "🎹", "🎤", "🎷", "🎺", "🎧", "🎵", "👾", "🦊", "🐯", "🐼", "😎", "🚀", "🌟"];
                      const newP = { 
                        id: Date.now().toString(), 
                        name: modalInput.trim(), 
                        color: colors[Math.floor(Math.random() * colors.length)],
                        emoji: emojis[Math.floor(Math.random() * emojis.length)]
                      };
                      saveProfiles([...profiles, newP]);
                      setShowProfileModal(false);
                    }
                  }
                }}
              />
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="px-5 py-2.5 rounded-[2rem] font-medium tracking-wide text-gray-300 hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (modalInput.trim()) {
                      const colors = [
                        "from-red-500 to-orange-500", "from-green-400 to-emerald-600", "from-pink-500 to-rose-500", 
                        "from-blue-400 to-indigo-600", "from-yellow-400 to-orange-500", "from-purple-500 to-fuchsia-600",
                        "from-teal-400 to-cyan-600", "from-rose-400 to-red-500"
                      ];
                      const emojis = ["🎸", "🥁", "🎹", "🎤", "🎷", "🎺", "🎧", "🎵", "👾", "🦊", "🐯", "🐼", "😎", "🚀", "🌟"];
                      const newP = { 
                        id: Date.now().toString(), 
                        name: modalInput.trim(), 
                        color: colors[Math.floor(Math.random() * colors.length)],
                        emoji: emojis[Math.floor(Math.random() * emojis.length)]
                      };
                      saveProfiles([...profiles, newP]);
                      setShowProfileModal(false);
                    }
                  }}
                  className="px-5 py-2.5 bg-[#D4FF00] text-[#000000] rounded-[2rem] font-bold hover:bg-gray-200 transition-colors"
                >
                  Create
                </button>
              </div>`;

code = code.replace(modalTarget, modalReplace);
fs.writeFileSync('src/app/page.tsx', code);
