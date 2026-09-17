const fs = require('fs');
let code = fs.readFileSync('src/app/Onboarding.tsx', 'utf-8');

const importTarget = `import { Loader2, ArrowLeft } from "lucide-react";`;
const importReplace = `import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";`;
code = code.replace(importTarget, importReplace);

const stateTarget = `  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);`;
const stateReplace = `  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);`;
code = code.replace(stateTarget, stateReplace);

const formTarget = `                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                />
                {authMode === "signup" && (
                  <input
                    type="password"
                    required
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                  />
                )}`;

const formReplace = `                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {authMode === "signup" && (
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                    />
                  </div>
                )}`;

code = code.replace(formTarget, formReplace);
fs.writeFileSync('src/app/Onboarding.tsx', code);
