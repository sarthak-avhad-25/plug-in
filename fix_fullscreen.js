const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `  const toggleAppMode = async () => {
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
  };`;

const replacement = `  const toggleAppMode = async () => {
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

code = code.replace(target, replacement);

const targetEvent = `  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);`;

const replacementEvent = `  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);`;

code = code.replace(targetEvent, replacementEvent);

fs.writeFileSync('src/app/page.tsx', code);
