"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AVATARS = Array.from({ length: 10 }).map((_, i) => ({
  id: `pic-${i + 1}`,
  image: `/avatars/avatar-${i + 1}.png`
}));

export function Onboarding({ onComplete }: { onComplete: (profile: any) => void }) {
  const [step, setStep] = useState<"welcome" | "transition_to_profile" | "create_profile" | "transition_to_app">("welcome");
  const [username, setUsername] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(AVATARS[0].id);
  const [fastForward, setFastForward] = useState(false);
  
  const timer1 = useRef<NodeJS.Timeout | null>(null);
  const timer2 = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (fastForward) {
      if (timer1.current) clearTimeout(timer1.current);
      if (timer2.current) clearTimeout(timer2.current);
      setStep("create_profile");
      return;
    }

    timer1.current = setTimeout(() => {
      setStep("transition_to_profile");
      timer2.current = setTimeout(() => {
        setStep("create_profile");
      }, 2500);
    }, 4000);
    
    return () => {
      if (timer1.current) clearTimeout(timer1.current);
      if (timer2.current) clearTimeout(timer2.current);
    };
  }, [fastForward]);

  const handleScreenClick = () => {
    if (step === "welcome" || step === "transition_to_profile") {
      setFastForward(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setStep("transition_to_app");
    
    setTimeout(() => {
      const avatar = AVATARS.find(a => a.id === selectedAvatarId) || AVATARS[0];
      const profile = {
        id: crypto.randomUUID(),
        name: username.trim(),
        avatar: avatar.image
      };
      onComplete(profile);
    }, 3000); // Heavy entering duration
  };

  return (
    <div 
      onClick={handleScreenClick}
      className={`fixed inset-0 bg-[#020005] z-[9999] flex flex-col items-center justify-center overflow-hidden ${(step === "welcome" || step === "transition_to_profile") ? 'cursor-pointer' : ''}`}
    >
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={
            step === "transition_to_profile" || step === "transition_to_app" 
              ? { scale: [1, 2, 1.5], opacity: [0.3, 0.9, 0.5], rotate: 90 } 
              : { scale: [1, 1.2, 0.9, 1], opacity: [0.3, 0.6, 0.3], rotate: 0 }
          }
          transition={{ duration: fastForward ? 0.2 : (step.includes("transition") ? 2.5 : 8), repeat: step.includes("transition") ? 0 : Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={
            step === "transition_to_profile" || step === "transition_to_app" 
              ? { scale: [1, 2.5, 1.2], opacity: [0.2, 0.8, 0.4], rotate: -90 } 
              : { scale: [1, 1.3, 0.8, 1], opacity: [0.2, 0.5, 0.2], rotate: 0 }
          }
          transition={{ duration: fastForward ? 0.2 : (step.includes("transition") ? 2.5 : 10), repeat: step.includes("transition") ? 0 : Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] bg-[#D4FF00]/20 rounded-full blur-[100px] mix-blend-screen"
        />
        
        {/* Light sweep effect during transitions */}
        <AnimatePresence>
          {(step === "transition_to_profile" || step === "transition_to_app") && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "100%", opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: fastForward ? 0.15 : 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 blur-3xl mix-blend-overlay"
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <AnimatePresence mode="wait">
        
        {/* WELCOME TO PLUGIN */}
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(30px)", rotate: 5 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="relative z-10 flex flex-col items-center justify-center text-center px-6"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-black text-white tracking-widest mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              animate={{ letterSpacing: ["10px", "15px", "10px"] }}
              transition={{ duration: fastForward ? 0.4 : 4, ease: "easeInOut" }}
            >
              PLUGIN
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: fastForward ? 0.1 : 1, duration: fastForward ? 0.1 : 1 }}
              className="text-lg md:text-2xl text-white/70 font-medium tracking-wide"
            >
              Your music. Your sound. Your space.
            </motion.p>
          </motion.div>
        )}

        {/* PROFILE CREATION */}
        {step === "create_profile" && (
          <motion.div
            key="create_profile"
            initial={{ opacity: 0, y: 100, scale: 0.8, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(20px)", z: 100 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="relative z-10 w-full max-w-5xl px-8"
          >
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] px-10 py-6 md:px-20 md:py-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              <div className="text-center mb-4">
                <h2 className="text-5xl font-black text-white mb-2">Create your profile</h2>
                <p className="text-xl md:text-2xl text-white/50 mt-2">Tell us what we should call you.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
                <div className="flex justify-center mb-4 w-full overflow-hidden">
                  <div className="grid grid-cols-5 gap-4 md:gap-6 max-h-[24rem] overflow-y-auto custom-scrollbar pr-2 py-4 w-full justify-items-center">
                    {AVATARS.map(avatar => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        className={`w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden transition-all shadow-xl
                          ${selectedAvatarId === avatar.id ? 'scale-110 ring-4 ring-[#D4FF00] z-10 shadow-[0_0_20px_rgba(212,255,0,0.5)]' : 'scale-95 opacity-60 hover:scale-100 hover:opacity-100'}
                        `}
                      >
                        <img src={avatar.image} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 text-lg md:text-xl font-bold tracking-widest mb-2 pl-2">USERNAME</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-[2rem] px-10 py-6 text-3xl text-white font-black placeholder:text-white/20 focus:outline-none focus:border-[#D4FF00] transition-colors text-center shadow-inner"
                    autoComplete="off"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!username.trim()}
                  className="w-full bg-[#D4FF00] text-black font-black text-3xl font-black tracking-wide rounded-[2rem] py-6 mt-4 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center shadow-[0_0_30px_rgba(212,255,0,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                >
                  Enter PlugIn
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ENTERING APP */}
        {step === "transition_to_app" && (
          <motion.div
            key="transition_to_app"
            className="relative z-10 flex flex-col items-center justify-center text-center px-6"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 5], opacity: [0, 1, 0] }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            >
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                <img 
                  src={AVATARS.find(a => a.id === selectedAvatarId)?.image} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h2 className="text-4xl font-bold text-white mt-6 drop-shadow-xl">{username}</h2>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
