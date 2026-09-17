const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Add imports
code = code.replace(
  `import { Play, Pause, Search, Loader2, ArrowRight, SkipBack, SkipForward, Heart, GripVertical, Headphones, Maximize2, Minimize2, Trash2, Info, Home, Library, Compass, ChevronDown, MoreHorizontal, ListMusic, Quote, Check, Plus , Shuffle, Repeat, Volume2, Share, Power } from "lucide-react";`,
  `import { Play, Pause, Search, Loader2, ArrowRight, SkipBack, SkipForward, Heart, GripVertical, Headphones, Maximize2, Minimize2, Trash2, Info, Home, Library, Compass, ChevronDown, MoreHorizontal, ListMusic, Quote, Check, Plus , Shuffle, Repeat, Volume2, Share, Power, ArrowDownToLine, CheckCircle2, XCircle, WifiOff } from "lucide-react";
import { saveDownload, getDownload, removeDownload, getAllDownloads, type DownloadedSong } from "./offlineDb";`
);

// 2. Add Mobile Tab enum update
code = code.replace(
  `const [mobileTab, setMobileTab] = useState<"home" | "discover" | "search" | "library" | "playlistView">("home");`,
  `const [mobileTab, setMobileTab] = useState<"home" | "discover" | "search" | "library" | "playlistView" | "downloads">("home");`
);

// 3. Add states near playlists
const targetStates = `  const [playlists, setPlaylists] = useState<Playlist[]>([ { id: 'default', name: 'My Playlist', songs: [] } ]);`;
const replaceStates = `  const [playlists, setPlaylists] = useState<Playlist[]>([ { id: 'default', name: 'My Playlist', songs: [] } ]);
  const [downloads, setDownloads] = useState<DownloadedSong[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number | 'indeterminate'>>({});
  const [downloadErrors, setDownloadErrors] = useState<Record<string, string>>({});
  const [isOffline, setIsOffline] = useState(false);
  const currentObjectUrlRef = useRef<string | null>(null);`;
code = code.replace(targetStates, replaceStates);

// 4. Add useEffect for offline and downloads
const targetUseEffect = `  useEffect(() => {
    setIsClient(true);`;
const replaceUseEffect = `  useEffect(() => {
    setIsClient(true);
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    getAllDownloads().then(setDownloads).catch(console.error);
    `;
code = code.replace(targetUseEffect, replaceUseEffect);

// 5. Inject download handlers inside component before togglePlay
const targetHandlers = `  const togglePlay = () => {`;
const replaceHandlers = `  const handleDownload = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloads.some(d => d.id === song.id)) return;
    if (downloadProgress[song.id] !== undefined) return;

    setDownloadProgress(prev => ({ ...prev, [song.id]: 'indeterminate' }));
    setDownloadErrors(prev => { const n = {...prev}; delete n[song.id]; return n; });

    try {
      let targetId = song.id;
      let res = await fetch(\`/api/audio?v=\${song.id}\`, { method: 'GET' });
      
      if (!res.ok) {
        const altId = await getAlternativeSourceId(song.title, song.artist);
        if (altId) {
          targetId = altId;
          res = await fetch(\`/api/audio?v=\${targetId}\`, { method: 'GET' });
        }
      }

      if (!res.ok || !res.body) throw new Error("Failed to fetch audio");

      const contentLength = res.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      let loaded = 0;
      const reader = res.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loaded += value.length;
          if (total) {
            setDownloadProgress(prev => ({ ...prev, [song.id]: Math.round((loaded / total) * 100) }));
          }
        }
      }

      const blob = new Blob(chunks, { type: res.headers.get('content-type') || 'audio/mpeg' });
      await saveDownload(song, blob);
      
      setDownloads(await getAllDownloads());
      setDownloadProgress(prev => { const n = {...prev}; delete n[song.id]; return n; });
    } catch (err: any) {
      console.error("Download error:", err);
      setDownloadErrors(prev => ({ ...prev, [song.id]: "Failed" }));
      setDownloadProgress(prev => { const n = {...prev}; delete n[song.id]; return n; });
      if (err.name === 'QuotaExceededError' || err.message.includes('Quota')) {
        alert("Not enough storage to download this song.");
      }
    }
  };

  const handleRemoveDownload = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeDownload(songId);
      setDownloads(await getAllDownloads());
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlay = () => {`;
code = code.replace(targetHandlers, replaceHandlers);

fs.writeFileSync('src/app/page.tsx', code);
