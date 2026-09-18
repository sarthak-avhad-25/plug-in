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
    }, 3000);
  };

  return (
    <div 
      onClick={handleScreenClick}
      className={`fixed inset-0 bg-[#020202] z-[9999] flex flex-col items-center justify-center overflow-hidden ${(step === "welcome" || step === "transition_to_profile") ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none mix-blend-overlay" />

      <AnimatePresence mode="wait">
        
        {/* WELCOME TO PLUGIN */}
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)", y: -50 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="relative z-10 w-full h-full flex flex-col justify-between p-12"
          >
            <div className="flex justify-between items-start w-full">
               <motion.span 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1 }}
                 className="text-[10px] font-black tracking-[0.4em] text-[#D4FF00] uppercase"
               >
                 SYSTEM BOOT
               </motion.span>
               <motion.span 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1.2 }}
                 className="text-[10px] font-black tracking-[0.4em] text-white/50 uppercase"
               >
                 V 0.9.1
               </motion.span>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <motion.h1 
                className="text-[120px] md:text-[200px] font-black text-white tracking-tighter leading-[0.8] mix-blend-difference"
                animate={{ letterSpacing: ["-5px", "0px", "-5px"] }}
                transition={{ duration: fastForward ? 0.4 : 6, ease: "easeInOut" }}
              >
                PLUGIN
              </motion.h1>
            </div>
            
            <div className="flex justify-end w-full">
              <motion.span 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: fastForward ? 0.1 : 2 }}
                 className="text-[12px] font-black tracking-[0.4em] text-white/50 uppercase border-b border-white/20 pb-1"
               >
                 A NEW SOUND
               </motion.span>
            </div>
          </motion.div>
        )}

        {/* PROFILE CREATION */}
        {step === "create_profile" && (
          <motion.div
            key="create_profile"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="relative z-10 w-full h-full flex flex-col justify-between p-6 md:p-12"
          >
            <div className="flex flex-col gap-2 relative">
               <span className="text-[10px] font-black tracking-[0.4em] text-white/30 absolute -top-4 right-0">IDENTITY</span>
               <h2 className="text-[64px] font-black tracking-tighter text-white leading-[0.8] uppercase w-3/4">CREATE<br/>PROFILE</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full max-w-xl mx-auto" autoComplete="off">
              <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide -mx-6 px-6 snap-x">
                {AVATARS.map((avatar, i) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={`min-w-[120px] h-[160px] snap-center overflow-hidden transition-all duration-500
                      ${selectedAvatarId === avatar.id ? 'scale-110 shadow-[0_20px_40px_rgba(255,255,255,0.1)] grayscale-0' : 'scale-95 grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}
                    `}
                  >
                    <img src={avatar.image} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 text-[10px] font-black mix-blend-difference text-white tracking-widest">{String(i+1).padStart(2,'0')}</div>
                  </button>
                ))}
              </div>

              <div className="flex flex-col border-b border-white/20 pb-2 relative mt-4">
                <input
                  type="text"
                  required
                  placeholder="ENTER ALIAS"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-transparent text-[48px] text-white font-black tracking-tighter placeholder:text-white/20 focus:outline-none uppercase"
                  autoComplete="off"
                />
              </div>
              
              <button
                type="submit"
                disabled={!username.trim()}
                className="w-full bg-[#D4FF00] text-black font-black text-2xl tracking-tighter uppercase py-8 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 mix-blend-screen"
              >
                INITIALIZE
              </button>
            </form>
            
            <div className="text-center text-[10px] font-black tracking-[0.4em] text-white/30 uppercase mt-4">
               SECURE LOCAL STORAGE
            </div>
          </motion.div>
        )}

        {/* ENTERING APP */}
        {step === "transition_to_app" && (
          <motion.div
            key="transition_to_app"
            className="relative z-10 w-full h-full flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1, 4], opacity: [0, 1, 0] }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <div className="w-[300px] h-[400px] overflow-hidden grayscale">
                <img 
                  src={AVATARS.find(a => a.id === selectedAvatarId)?.image} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h2 className="text-[64px] font-black text-white mt-6 tracking-tighter uppercase mix-blend-difference absolute top-1/2 -translate-y-1/2">{username}</h2>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
