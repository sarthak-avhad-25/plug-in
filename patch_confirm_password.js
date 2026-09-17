const fs = require('fs');
let code = fs.readFileSync('src/app/Onboarding.tsx', 'utf-8');

const stateTarget = `  const [password, setPassword] = useState("");
  const [error, setError] = useState("");`;
const stateReplace = `  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");`;

code = code.replace(stateTarget, stateReplace);

const submitTarget = `    try {
      if (authMode === "signup") {
        const res = await createAccount(name, email, password);`;
const submitReplace = `    try {
      if (authMode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setIsSubmitting(false);
          return;
        }
        const res = await createAccount(name, email, password);`;

code = code.replace(submitTarget, submitReplace);

const formTarget = `                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                />
                
                {authMode === "signin" && (`;
const formReplace = `                <input
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
                )}
                
                {authMode === "signin" && (`;

code = code.replace(formTarget, formReplace);
fs.writeFileSync('src/app/Onboarding.tsx', code);
