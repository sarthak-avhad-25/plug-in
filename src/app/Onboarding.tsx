"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createAccount, signIn, getSessionUser, checkGoogleAuth, getGoogleAuthUrl, type AuthUser } from "./auth";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";

export function Onboarding({ onComplete }: { onComplete: (user: AuthUser) => void }) {
  const [step, setStep] = useState<"loading" | "welcome" | "auth_options" | "signin" | "signup">("loading");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [googleError, setGoogleError] = useState("");
  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    Promise.all([getSessionUser(), checkGoogleAuth()]).then(([user, googleStatus]) => {
      setGoogleConfigured(googleStatus.configured);
      if (user) {
        onComplete(user);
      } else {
        setStep("welcome");
        setTimeout(() => setStep("auth_options"), 4000);
      }
    });
  }, [onComplete]);

  const handleGoogleClick = async () => {
    setGoogleError("");
    if (!googleConfigured) {
      setGoogleError("Google Sign-In is not currently configured for this environment. Please Continue with Email.");
      return;
    }
    
    setIsGoogleLoading(true);
    try {
      const url = await getGoogleAuthUrl();
      if (url) {
        window.location.href = url;
      } else {
        setGoogleError("Failed to initialize Google authentication.");
        setIsGoogleLoading(false);
      }
    } catch (e) {
      setGoogleError("An error occurred starting Google Auth.");
      setIsGoogleLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn(email, password);
      if (res && "error" in res) setError(res.error);
      else onComplete(await getSessionUser() as AuthUser);
    } catch (err) {
      setError("Sign in is temporarily unavailable. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name.trim() || name.length < 2) {
      setError("Please enter a valid full name.");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAccount(name, email, password);
      if (res && "error" in res) setError(res.error);
      else onComplete(await getSessionUser() as AuthUser);
    } catch (err) {
      setError("Sign up is temporarily unavailable. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateTo = (newStep: "auth_options" | "signin" | "signup") => {
    setError("");
    setStep(newStep);
  };

  if (step === "loading") {
    return <div className="fixed inset-0 bg-[#020005] z-[9999]" />;
  }

  return (
    <div className="fixed inset-0 bg-[#020005] z-[9999] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Cinematic Animated Neon Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen"
          animate={{ scale: [1, 1.2, 0.9, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[100px] mix-blend-screen"
          animate={{ scale: [1, 1.3, 0.8, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="relative z-10 flex flex-col items-center justify-center text-center px-6"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-black text-white tracking-widest mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              animate={{ letterSpacing: ["10px", "15px", "10px"] }}
              transition={{ duration: 4, ease: "easeInOut" }}
            >
              PLUGIN
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-lg md:text-2xl text-white/70 font-medium tracking-wide"
            >
              Your music. Your sound. Your space.
            </motion.p>
          </motion.div>
        )}

        {step === "auth_options" && (
          <motion.div
            key="auth_options"
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -40, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md px-6"
          >
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to PlugIn</h2>
              <p className="text-white/50 mb-10">Sign in to continue listening.</p>
              
              <button
                onClick={handleGoogleClick}
                disabled={isGoogleLoading}
                title={googleConfigured === false ? "Google configuration missing in .env.local" : "Continue with Google"}
                className={`w-full bg-white text-black font-bold text-lg rounded-xl py-4 transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(255,255,255,0.1)] ${googleConfigured === false ? 'opacity-70 hover:opacity-100 grayscale-[0.5]' : 'hover:scale-[1.02] active:scale-95'}`}
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
              </button>
              
              <AnimatePresence>
                {googleError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium"
                  >
                    {googleError}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex items-center gap-4 w-full my-8">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/30 text-sm font-medium">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              
              <button
                onClick={() => navigateTo("signin")}
                className="w-full bg-transparent border-2 border-white/20 text-white font-bold text-lg rounded-xl py-4 hover:border-white/50 active:scale-95 transition-all flex items-center justify-center"
              >
                Continue with Email
              </button>
            </div>
          </motion.div>
        )}

        {step === "signin" && (
          <motion.div
            key="signin"
            initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -40, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md px-6"
          >
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              
              <button 
                type="button"
                onClick={() => navigateTo("auth_options")}
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 font-medium"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
                <p className="text-white/50">Sign in to continue listening.</p>
              </div>

              <form onSubmit={handleSignIn} className="flex flex-col gap-4" autoComplete="off">
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                    autoComplete="off"
                  />
                </div>
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm font-medium px-2"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="text-right mt-1">
                  <button type="button" className="text-sm text-white/40 hover:text-white transition-colors">
                    Forgot password?
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#D4FF00] text-black font-bold text-lg rounded-xl py-4 mt-2 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(212,255,0,0.3)] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Signing in...</> : "Sign In"}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => navigateTo("signup")}
                  className="text-white/50 hover:text-white transition-colors text-sm font-medium"
                >
                  Don't have an account? Create account
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "signup" && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 40, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md px-6"
          >
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              
              <button 
                type="button"
                onClick={() => navigateTo("signin")}
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 font-medium"
              >
                <ArrowLeft className="w-5 h-5" /> Back to Sign In
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Create account</h2>
                <p className="text-white/50">Join the ultimate music experience.</p>
              </div>

              <form onSubmit={handleSignUp} className="flex flex-col gap-4" autoComplete="off">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(""); }}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                    autoComplete="off"
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                    autoComplete="off"
                  />
                </div>
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                    autoComplete="new-password"
                  />
                </div>
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm font-medium px-2"
                  >
                    {error}
                  </motion.div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#D4FF00] text-black font-bold text-lg rounded-xl py-4 mt-2 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(212,255,0,0.3)] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating account...</> : "Create Account"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
