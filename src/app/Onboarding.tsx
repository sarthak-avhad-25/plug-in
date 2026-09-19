"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus } from "lucide-react";

const AVATARS = Array.from({ length: 10 }).map((_, i) => ({
  id: `pic-${i + 1}`,
  image: `/avatars/avatar-${i + 1}.png`
}));

export function Onboarding({ onComplete, existingProfiles = [], onSelectExisting, mode = 'default' }: { onComplete: (profile: any) => void; existingProfiles?: any[]; onSelectExisting?: (profile: any) => void; mode?: 'default' | 'create_new'; }) {
  const [step, setStep] = useState<"welcome" | "profile_choice" | "new_profile_transition" | "create_profile" | "transition_to_app" | "select_profile">(mode === 'create_new' ? "new_profile_transition" : "welcome");
  const [username, setUsername] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(AVATARS[0].id);
  
  const timer1 = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step === "welcome") {
      timer1.current = setTimeout(() => {
        if (existingProfiles.length > 0) {
          setStep("select_profile");
        } else {
          setStep("profile_choice");
        }
      }, 4000);
    } else if (step === "new_profile_transition") {
      timer1.current = setTimeout(() => {
        setStep("create_profile");
      }, 1500);
    }

    return () => {
      if (timer1.current) clearTimeout(timer1.current);
    };
  }, [step, existingProfiles.length]);

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

  const handleSelectExistingProfile = (profile: any) => {
    setSelectedAvatarId(AVATARS.find(a => a.image === profile.avatar)?.id || AVATARS[0].id);
    setUsername(profile.name);
    setStep("transition_to_app");
    setTimeout(() => {
      if (onSelectExisting) {
        onSelectExisting(profile);
      } else {
        onComplete(profile);
      }
    }, 3000);
  };

  return (
    <div 
      className={`fixed inset-0 bg-[#020202] z-[9999] flex flex-col items-center justify-center overflow-hidden`}
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
                transition={{ duration: 6, ease: "easeInOut" }}
              >
                PLUGIN
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="text-sm md:text-lg font-bold tracking-[0.3em] text-[#D4FF00] uppercase mt-6"
              >
                Tune In. Zone Out.
              </motion.p>
            </div>
            
            <div className="flex justify-end w-full">
              <motion.span 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 2 }}
                 className="text-[12px] font-black tracking-[0.4em] text-white/50 uppercase border-b border-white/20 pb-1"
               >
                 A NEW SOUND
               </motion.span>
            </div>
          </motion.div>
        )}

        {/* PROFILE CHOICE (NEW USER) */}
        {step === "profile_choice" && (
          <motion.div
            key="profile_choice"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-12 p-12"
          >
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-[32px] md:text-[48px] font-black tracking-tighter text-white uppercase leading-[1]">
                WELCOME TO <span className="text-[#D4FF00]">PLUGIN</span>
              </h2>
              <p className="text-xs md:text-sm font-bold tracking-[0.2em] text-white/50 uppercase">
                Let's get you set up.
              </p>
            </div>
            
            <div className="flex flex-col gap-6 w-full max-w-sm">
              <button
                onClick={() => setStep("new_profile_transition")}
                className="w-full py-6 bg-[#D4FF00] text-black font-black tracking-tighter text-2xl uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,255,0,0.2)] hover:shadow-[0_0_30px_rgba(212,255,0,0.4)]"
              >
                CREATE PROFILE
              </button>
              
              <button
                onClick={() => setStep("select_profile")}
                className="w-full py-6 bg-transparent border border-white/20 text-white font-black tracking-tighter text-xl uppercase hover:bg-white/5 hover:border-white/50 active:scale-95 transition-all"
              >
                EXISTING PROFILES
              </button>
            </div>
          </motion.div>
        )}

        {/* NEW PROFILE TRANSITION */}
        {step === "new_profile_transition" && (
          <motion.div
            key="new_profile_transition"
            className="relative z-10 w-full h-full flex items-center justify-center"
          >
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute h-1 bg-[#D4FF00] rounded-full shadow-[0_0_20px_#D4FF00]"
              style={{ width: '200px' }}
            />
            
            <motion.div
              initial={{ opacity: 0, filter: "blur(20px)", scale: 0.8 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="absolute flex flex-col items-center justify-center text-center mix-blend-difference"
            >
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-[48px] md:text-[64px] font-black text-white tracking-tighter uppercase leading-none"
              >
                CREATE YOUR SPACE.
              </motion.h2>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-[48px] md:text-[64px] font-black text-[#D4FF00] tracking-tighter uppercase leading-none mt-2"
              >
                MAKE IT YOURS.
              </motion.h2>
            </motion.div>
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
               <motion.button 
                 type="button"
                 onClick={() => setStep("select_profile")}
                 initial={{ opacity: 0, y: -10, scale: 0.97 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                 className="absolute top-0 right-0 md:-top-4 md:right-0 z-50 flex items-center gap-2 px-5 py-3 md:px-4 md:py-2 bg-black border border-[#D4FF00]/30 rounded-xl text-white/90 hover:text-[#D4FF00] hover:border-[#D4FF00]/80 hover:bg-[#111] hover:-translate-y-0.5 hover:scale-105 shadow-[0_0_15px_rgba(212,255,0,0.1)] hover:shadow-[0_0_20px_rgba(212,255,0,0.3)] transition-all duration-300 cursor-pointer active:scale-95"
               >
                 <Users className="w-4 h-4 md:w-3.5 md:h-3.5" />
                 <span className="text-[11px] md:text-[10px] font-black tracking-[0.2em] uppercase mt-0.5">EXISTING PROFILES</span>
               </motion.button>
               <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter text-white leading-[0.8] uppercase w-3/4 mt-16 md:mt-0">CREATE<br/>PROFILE</h2>
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

        {/* PROFILE SELECTION */}
        {step === "select_profile" && (
          <motion.div
            key="select_profile"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="relative z-10 w-full h-full flex flex-col p-6 md:p-12"
          >
            <div className="flex flex-col gap-2 relative">
               <button 
                 type="button"
                 onClick={() => setStep("new_profile_transition")}
                 className="text-[11px] md:text-[10px] font-black tracking-[0.4em] text-white/50 hover:text-white absolute top-0 right-0 md:-top-4 md:right-0 py-3 md:py-0 px-2 md:px-0 transition-colors uppercase cursor-pointer z-50 active:scale-95 flex items-center gap-2"
               >
                 <Plus className="w-3 h-3" /> CREATE NEW
               </button>
               <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter text-white leading-[0.8] uppercase w-3/4 mb-8 md:mb-12 mt-16 md:mt-0">SELECT<br/>PROFILE</h2>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full mt-[-10%]">
               
               {existingProfiles.length === 0 ? (
                 <div className="text-center flex flex-col items-center gap-6">
                   <div className="text-white/40 text-xl font-bold tracking-widest uppercase">No saved profiles found.</div>
                   <button 
                     onClick={() => setStep("new_profile_transition")}
                     className="px-8 py-4 bg-[#D4FF00] hover:bg-[#D4FF00]/80 text-black font-black tracking-widest uppercase rounded-full transition-colors"
                   >
                     CREATE PROFILE
                   </button>
                 </div>
               ) : (
                 <div className="flex flex-wrap justify-center gap-8 md:gap-12 w-full max-w-5xl mx-auto">
                   {existingProfiles.map(profile => (
                     <button
                       key={profile.id}
                       onClick={() => handleSelectExistingProfile(profile)}
                       className="flex flex-col items-center gap-6 group hover:scale-105 active:scale-95 transition-all"
                     >
                       <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-[#D4FF00] transition-colors bg-[#111] grayscale group-hover:grayscale-0 shadow-2xl">
                         <img src={profile.avatar || AVATARS[0].image} alt={profile.name} className="w-full h-full object-cover" />
                       </div>
                       <span className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase group-hover:text-[#D4FF00] transition-colors">{profile.name}</span>
                     </button>
                   ))}
                 </div>
               )}
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
