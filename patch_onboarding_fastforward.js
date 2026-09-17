const fs = require('fs');
let code = fs.readFileSync('src/app/Onboarding.tsx', 'utf-8');

// Add useRef to imports
code = code.replace(
  'import { useState, useEffect, useRef } from "react";',
  'import { useState, useEffect, useRef } from "react";'
);
if (!code.includes('useRef')) {
  code = code.replace(
    'import { useState, useEffect } from "react";',
    'import { useState, useEffect, useRef } from "react";'
  );
}

const stateTarget = `  const [step, setStep] = useState<"welcome" | "transition_to_profile" | "create_profile" | "transition_to_app">("welcome");
  const [username, setUsername] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(AVATARS[0].id);
  
  useEffect(() => {
    // Wait on welcome screen, then trigger heavy cinematic transition
    const timer = setTimeout(() => {
      setStep("transition_to_profile");
      
      // Let transition play for a moment before switching to create profile
      setTimeout(() => {
        setStep("create_profile");
      }, 2500); // Heavy transition duration
      
    }, 4000); // Welcome text duration
    
    return () => clearTimeout(timer);
  }, []);`;

const stateReplace = `  const [step, setStep] = useState<"welcome" | "transition_to_profile" | "create_profile" | "transition_to_app">("welcome");
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
  };`;
code = code.replace(stateTarget, stateReplace);

// Attach onClick to the root div and pass down the fastForward prop to framer motion
const divTarget = `<div className="fixed inset-0 bg-[#020005] z-[9999] flex flex-col items-center justify-center overflow-hidden">`;
const divReplace = `<div 
      onClick={handleScreenClick}
      className={\`fixed inset-0 bg-[#020005] z-[9999] flex flex-col items-center justify-center overflow-hidden \${(step === "welcome" || step === "transition_to_profile") ? 'cursor-pointer' : ''}\`}
    >`;
code = code.replace(divTarget, divReplace);

// Now apply the 10x faster logic to framer animations
code = code.replace(
  `transition={{ duration: step.includes("transition") ? 2.5 : 8, repeat: step.includes("transition") ? 0 : Infinity, ease: "easeInOut" }}`,
  `transition={{ duration: fastForward ? 0.2 : (step.includes("transition") ? 2.5 : 8), repeat: step.includes("transition") ? 0 : Infinity, ease: "easeInOut" }}`
);
code = code.replace(
  `transition={{ duration: step.includes("transition") ? 2.5 : 10, repeat: step.includes("transition") ? 0 : Infinity, ease: "easeInOut" }}`,
  `transition={{ duration: fastForward ? 0.2 : (step.includes("transition") ? 2.5 : 10), repeat: step.includes("transition") ? 0 : Infinity, ease: "easeInOut" }}`
);
code = code.replace(
  `transition={{ duration: 1.5, ease: "easeInOut" }}`,
  `transition={{ duration: fastForward ? 0.15 : 1.5, ease: "easeInOut" }}`
);
code = code.replace(
  `transition={{ duration: 4, ease: "easeInOut" }}`,
  `transition={{ duration: fastForward ? 0.4 : 4, ease: "easeInOut" }}`
);
code = code.replace(
  `transition={{ delay: 1, duration: 1 }}`,
  `transition={{ delay: fastForward ? 0.1 : 1, duration: fastForward ? 0.1 : 1 }}`
);

fs.writeFileSync('src/app/Onboarding.tsx', code);
