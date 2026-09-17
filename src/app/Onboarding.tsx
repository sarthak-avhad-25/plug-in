"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createAccount, signIn, getSessionUser, type AuthUser } from "./auth";
import { Loader2 } from "lucide-react";

export function Onboarding({ onComplete }: { onComplete: (user: AuthUser) => void }) {
  const [step, setStep] = useState<"loading" | "welcome" | "auth">("loading");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getSessionUser().then(user => {
      if (user) {
        onComplete(user);
      } else {
        // Not logged in -> show welcome animation
        setStep("welcome");
        // Auto transition to auth screen after cinematic delay
        setTimeout(() => setStep("auth"), 4000);
      }
    });
  }, [onComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      if (authMode === "signup") {
        const res = await createAccount(name, email, password);
        if (res && "error" in res) setError(res.error);
        else onComplete(await getSessionUser() as AuthUser);
      } else {
        const res = await signIn(email, password);
        if (res && "error" in res) setError(res.error);
        else onComplete(await getSessionUser() as AuthUser);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

        {step === "auth" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md px-6"
          >
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {authMode === "signin" ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-white/50">
                  {authMode === "signin" ? "Sign in to continue listening." : "Join the ultimate music experience."}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {authMode === "signup" && (
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                  />
                )}
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4FF00] transition-colors"
                />
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#D4FF00] text-black font-bold text-lg rounded-xl py-4 mt-4 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(212,255,0,0.3)]"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (authMode === "signin" ? "Sign In" : "Create Account")}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => { setAuthMode(authMode === "signin" ? "signup" : "signin"); setError(""); }}
                  className="text-white/50 hover:text-white transition-colors text-sm font-medium"
                >
                  {authMode === "signin" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
