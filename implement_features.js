const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Add Power import
code = code.replace(
  'import { Play, Pause, Search, Loader2, ArrowRight, SkipBack, SkipForward, Heart, GripVertical, Headphones, Maximize2, Minimize2, Trash2, Info, Home, Library, Compass, ChevronDown, MoreHorizontal, ListMusic, Quote, Check, Plus , Shuffle, Repeat, Volume2, Share} from "lucide-react";',
  'import { Play, Pause, Search, Loader2, ArrowRight, SkipBack, SkipForward, Heart, GripVertical, Headphones, Maximize2, Minimize2, Trash2, Info, Home, Library, Compass, ChevronDown, MoreHorizontal, ListMusic, Quote, Check, Plus , Shuffle, Repeat, Volume2, Share, Power } from "lucide-react";'
);

// 2. Add state
const stateInjection = `  const [lyricsLoading, setLyricsLoading] = useState(false);
  
  const [isScreenOff, setIsScreenOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScreenOffText, setShowScreenOffText] = useState(false);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleAppMode = async () => {
    if (!document.fullscreenElement) {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen({ navigationUI: "hide" });
        }
      } catch (e) {
        console.warn("Fullscreen request failed", e);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  const enterScreenOff = () => {
    setIsScreenOff(true);
    setShowScreenOffText(true);
    setTimeout(() => setShowScreenOffText(false), 2000);
  };

  const handleScreenOffPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setIsScreenOff(false);
    }
    lastTapRef.current = now;
  };`;
code = code.replace(`  const [lyricsLoading, setLyricsLoading] = useState(false);`, stateInjection);

// 3. Mobile Header
const mobileHeaderTarget = `          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-white">
              {mobileTab === 'home' && "Plug-In"}
              {mobileTab === 'discover' && "Discover"}
              {mobileTab === 'search' && "Search"}
              {mobileTab === 'library' && "Library"}
            </h1>
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-xl shadow-lg border border-white/10 text-white cursor-pointer" onClick={() => setShowProfileModal(true)}>
              {activeProfile ? activeProfile.emoji : '👤'}
            </div>
          </div>`;

const mobileHeaderReplacement = `          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-white">
              {mobileTab === 'home' && "Plug-In"}
              {mobileTab === 'discover' && "Discover"}
              {mobileTab === 'search' && "Search"}
              {mobileTab === 'library' && "Library"}
            </h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleAppMode}
                className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-lg border border-white/10 text-white/70 active:scale-95 active:text-white transition-all"
                aria-label={isFullscreen ? "Exit app mode" : "Enter app mode"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={enterScreenOff}
                className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-lg border border-white/10 text-white/70 active:scale-95 active:text-white transition-all"
                aria-label="Turn screen off"
              >
                <Power className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-xl shadow-lg border border-white/10 text-white cursor-pointer" onClick={() => setShowProfileModal(true)}>
                {activeProfile ? activeProfile.emoji : '👤'}
              </div>
            </div>
          </div>`;
code = code.replace(mobileHeaderTarget, mobileHeaderReplacement);

// 4. Mobile Player Header
const playerHeaderTarget = `              {/* Header */}
              <div className="relative z-10 flex items-center justify-between p-6 pt-12">
                <button onClick={() => setShowMobilePlayer(false)} className="p-2 -ml-2 text-white/70 active:text-white">
                  <ChevronDown className="w-8 h-8" />
                </button>
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">Now Playing</span>
                <button 
                  onClick={(e) => openPlaylistMenu(currentSong, e)}
                  className="p-2 -mr-2 text-white/70 active:text-white"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              </div>`;

const playerHeaderReplacement = `              {/* Header */}
              <div className="relative z-10 flex items-center justify-between p-6 pt-12">
                <button onClick={() => setShowMobilePlayer(false)} className="p-2 -ml-2 text-white/70 active:text-white">
                  <ChevronDown className="w-8 h-8" />
                </button>
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">Now Playing</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleAppMode}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/70 active:scale-95 active:text-white transition-all"
                    aria-label={isFullscreen ? "Exit app mode" : "Enter app mode"}
                  >
                    {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </button>
                  <button 
                    onClick={enterScreenOff}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/70 active:scale-95 active:text-white transition-all"
                    aria-label="Turn screen off"
                  >
                    <Power className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={(e) => openPlaylistMenu(currentSong, e)}
                    className="p-2 -mr-2 text-white/70 active:text-white"
                  >
                    <MoreHorizontal className="w-6 h-6" />
                  </button>
                </div>
              </div>`;
code = code.replace(playerHeaderTarget, playerHeaderReplacement);

// 5. Screen Off Overlay
const overlayTarget = `      {/* HIDDEN DEBUG TOGGLE & OVERLAY */}`;
const overlayReplacement = `      {/* MOBILE SCREEN OFF OVERLAY */}
      <AnimatePresence>
        {isScreenOff && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-[9999] bg-black flex items-center justify-center touch-none"
            onPointerDown={handleScreenOffPointerDown}
            style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
          >
            <AnimatePresence>
              {showScreenOffText && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-white/30 text-sm font-bold tracking-widest uppercase pointer-events-none"
                >
                  Double tap to wake
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* HIDDEN DEBUG TOGGLE & OVERLAY */}`;
code = code.replace(overlayTarget, overlayReplacement);

fs.writeFileSync('src/app/page.tsx', code);
