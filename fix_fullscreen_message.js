const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetState = `  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScreenOffText, setShowScreenOffText] = useState(false);`;
const replacementState = `  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScreenOffText, setShowScreenOffText] = useState(false);
  const [showFullscreenError, setShowFullscreenError] = useState(false);
  const hasShownErrorRef = useRef(false);`;
code = code.replace(targetState, replacementState);

const targetFn = `  const toggleAppMode = async () => {
    const el = document.documentElement as any;
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      try {
        if (el.requestFullscreen) {
          await el.requestFullscreen({ navigationUI: "hide" });
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        }
      } catch (e) {
        console.warn("Fullscreen request failed", e);
      }
    } else {
      const doc = document as any;
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      }
    }
  };`;
const replacementFn = `  const toggleAppMode = async () => {
    const el = document.documentElement as any;
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      try {
        if (el.requestFullscreen) {
          await el.requestFullscreen({ navigationUI: "hide" });
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else {
          throw new Error("Fullscreen API not supported");
        }
      } catch (e) {
        console.warn("Fullscreen request failed", e);
        if (!hasShownErrorRef.current) {
          setShowFullscreenError(true);
          hasShownErrorRef.current = true;
          setTimeout(() => setShowFullscreenError(false), 3000);
        }
      }
    } else {
      const doc = document as any;
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      }
    }
  };`;
code = code.replace(targetFn, replacementFn);

const targetUI = `{/* MOBILE SCREEN OFF OVERLAY */}`;
const replacementUI = `{/* FULLSCREEN ERROR OVERLAY */}
      <AnimatePresence>
        {showFullscreenError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[env(safe-area-inset-top,20px)] left-4 right-4 z-[9999] bg-[#ff3333] text-white p-3 text-center text-sm font-bold rounded-xl shadow-xl pointer-events-none"
          >
            Fullscreen isn't available in this browser.
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* MOBILE SCREEN OFF OVERLAY */}`;
code = code.replace(targetUI, replacementUI);

fs.writeFileSync('src/app/page.tsx', code);
