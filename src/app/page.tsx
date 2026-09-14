"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Search, Loader2, ArrowRight, SkipBack, SkipForward, Heart, GripVertical, Headphones, Maximize2, Minimize2 } from "lucide-react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { searchYouTube, getArtistBackground, getSearchSuggestions, getSyncedLyrics, getTrendingWorldwide, getTrendingIndia, getRelatedSongs } from "./actions";
import type { SyncedLyric } from "./actions";

type Playlist = {
  id: string;
  name: string;
  songs: Song[];
};

type Song = {
  id: string;
  title: string;
  artist: string;
  image: string;
  duration?: string;
  seconds?: number | null;
};


const SongBox = ({ song, index, onPlay, isFavorite, onToggleFavorite }: { song: Song, index: number, onPlay: () => void, isFavorite: boolean, onToggleFavorite: (e: React.MouseEvent) => void }) => (
  <div 
    onClick={onPlay}
    className="p-3 md:p-4 hover:bg-white/10 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col md:flex-row md:items-center gap-4 group"
  >
    <div className="w-8 shrink-0 text-xl font-black opacity-40 group-hover:opacity-100 group-hover:text-white transition-colors">
      #{index + 1}
    </div>
    <div className="w-16 h-16 rounded-xl border border-white/20 group-hover:border-white/50 shrink-0 relative overflow-hidden bg-black shadow-lg">
      <img src={song.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={song.title} />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-[#FF3366]/80 transition-opacity">
        <Play className="w-6 h-6 text-white fill-white ml-1" />
      </div>
    </div>
    <div className="flex flex-col flex-1 overflow-hidden">
      <span className="text-xl md:text-2xl font-black uppercase tracking-tighter truncate leading-none mb-1">
        {song.title}
      </span>
      <span className="text-xs font-bold tracking-widest uppercase opacity-70 truncate">
        {song.artist}
      </span>
    </div>
    <button 
      onClick={onToggleFavorite}
      className="ml-auto p-2 opacity-50 group-hover:opacity-100 transition-opacity hover:scale-110"
    >
      <Heart className={`w-8 h-8 ${isFavorite ? 'fill-[#FF3366] text-[#FF3366]' : 'text-current'}`} />
    </button>
  </div>
);

export default function FransHalsMusicApp() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<SyncedLyric[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  const [artistQuery, setArtistQuery] = useState("");
  const [songQuery, setSongQuery] = useState("");
  
  const [artistSuggestions, setArtistSuggestions] = useState<string[]>([]);
  const [songSuggestions, setSongSuggestions] = useState<string[]>([]);
  
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [trendingWorldwide, setTrendingWorldwide] = useState<Song[]>([]);
  const [trendingIndia, setTrendingIndia] = useState<Song[]>([]);

  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([ { id: 'default', name: 'My Playlist', songs: [] } ]);
  const [activePlaylistId, setActivePlaylistId] = useState<string>('default');
  const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const savePlaylists = (newPlaylists: Playlist[]) => {
    setPlaylists(newPlaylists);
    localStorage.setItem("frans_hals_playlists", JSON.stringify(newPlaylists));
  };

  useEffect(() => {
    getTrendingWorldwide().then(setTrendingWorldwide);
    getTrendingIndia().then(setTrendingIndia);

    const saved = localStorage.getItem("frans_hals_playlists");
    if (saved) {
      try {
        setPlaylists(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const togglePlaylistSong = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPlaylists = playlists.map(p => {
      if (p.id === activePlaylistId) {
        const exists = p.songs.find(s => s.id === song.id);
        return { ...p, songs: exists ? p.songs.filter(s => s.id !== song.id) : [...p.songs, song] };
      }
      return p;
    });
    savePlaylists(newPlaylists);
  };
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const lastScrolledIndex = useRef(-1);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleUserInteraction = () => {
    isUserScrolling.current = true;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    
    scrollTimeout.current = setTimeout(() => {
      isUserScrolling.current = false;
      // Snap back immediately when timeout finishes
      if (lyricsContainerRef.current && lyrics.length > 0) {
        const activeIndex = lyrics.reduce((acc, l, idx) => (progress >= l.time ? idx : acc), 0);
        const innerWrapper = lyricsContainerRef.current.children[0];
        if (innerWrapper) {
          const activeElement = innerWrapper.children[activeIndex] as HTMLElement;
          if (activeElement) {
            const container = lyricsContainerRef.current;
            const targetScroll = activeElement.offsetTop - (container.clientHeight / 2) + (activeElement.clientHeight / 2);
            container.scrollTo({ top: targetScroll, behavior: "smooth" });
            lastScrolledIndex.current = activeIndex;
          }
        }
      }
    }, 5000);
  };

  // Auto-scroll lyrics
  useEffect(() => {
    if (lyricsContainerRef.current && lyrics.length > 0) {
      const activeIndex = lyrics.reduce((acc, l, idx) => (progress >= l.time ? idx : acc), 0);
      
      if (activeIndex !== lastScrolledIndex.current) {
        lastScrolledIndex.current = activeIndex;
        if (!isUserScrolling.current) {
          const innerWrapper = lyricsContainerRef.current.children[0];
          if (innerWrapper) {
            const activeElement = innerWrapper.children[activeIndex] as HTMLElement;
            if (activeElement) {
              const container = lyricsContainerRef.current;
              const targetScroll = activeElement.offsetTop - (container.clientHeight / 2) + (activeElement.clientHeight / 2);
              container.scrollTo({ top: targetScroll, behavior: "smooth" });
            }
          }
        }
      }
    }
  }, [progress, lyrics]);

  // Debounce logic for suggestions
  useEffect(() => {
    if (!artistQuery.trim()) {
      setArtistSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const suggestions = await getSearchSuggestions(artistQuery + " artist");
      setArtistSuggestions(suggestions.map(s => s.replace(" artist", "").replace(" singer", "")));
    }, 300);
    return () => clearTimeout(timer);
  }, [artistQuery]);

  useEffect(() => {
    if (!songQuery.trim()) {
      setSongSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const suggestions = await getSearchSuggestions(songQuery);
      setSongSuggestions(suggestions);
    }, 300);
    return () => clearTimeout(timer);
  }, [songQuery]);

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const onReady = (event: any) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(50);
  };

  const onStateChange = (event: any) => {
    if (event.data === 1) {
      setIsPlaying(true);
      setDuration(playerRef.current.getDuration());
      if (progressInterval.current) clearInterval(progressInterval.current);
      progressInterval.current = setInterval(() => {
        if (playerRef.current) setProgress(playerRef.current.getCurrentTime());
      }, 150);
    } else if (event.data === 2) {
      setIsPlaying(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
    } else if (event.data === 0) {
      setIsPlaying(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
      playNextSong();
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const executeFullSearch = async (queryToSearch: string, searchType: "artist" | "song" | "any" = "any") => {
    if (!queryToSearch.trim()) return;
    setHasSearched(true);
    setIsSearching(true);
    setArtistSuggestions([]);
    setSongSuggestions([]);
    
    const results = await searchYouTube(queryToSearch, searchType);
    setSearchResults(results);
    setIsSearching(false);
  };

  const [playbackHistory, setPlaybackHistory] = useState<Song[]>([]);
  const [relatedSongs, setRelatedSongs] = useState<Song[]>([]);
  const [artistBg, setArtistBg] = useState<string | null>(null);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [hasHeadphones, setHasHeadphones] = useState(false);

  useEffect(() => {
    const checkDevices = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        
        // Browsers hide device names for privacy until mic permission is granted!
        // We will try to read the names, if they are blank, we'll ask for permission once.
        let initialDevices = await navigator.mediaDevices.enumerateDevices();
        if (initialDevices.length > 0 && initialDevices.some(d => d.kind === 'audiooutput' && !d.label)) {
           try {
             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
             stream.getTracks().forEach(t => t.stop());
           } catch(e) {
             console.log("Mic permission denied, cannot read headphone names.");
           }
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
        
        let foundHeadphones = false;
        for (const d of audioOutputs) {
          const label = d.label.toLowerCase();
          if (label.includes('headphone') || label.includes('airpod') || label.includes('bluetooth') || label.includes('earbud') || label.includes('bose') || label.includes('sony') || label.includes('galaxy bud')) {
            foundHeadphones = true;
            break;
          }
        }
        
        // Fallback for hidden labels
        if (!foundHeadphones && audioOutputs.length > 1 && audioOutputs.some(d => !d.label)) {
          foundHeadphones = true; 
        }

        setHasHeadphones(foundHeadphones);
      } catch (error) {
        console.error("Error checking audio devices:", error);
      }
    };

    checkDevices();
    
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', checkDevices);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', checkDevices);
      };
    }
  }, []);
  const [playbackContext, setPlaybackContext] = useState<{ type: "radio" | "playlist", playlistId?: string, playlistSongs?: Song[] }>({ type: "radio" });

  const playSong = async (song: Song, addToHistory: boolean = true, context: "radio" | "playlist" = "radio", overridePlaylistSongs?: Song[]) => {
    if (context === "playlist" && overridePlaylistSongs) {
      setPlaybackContext({ type: "playlist", playlistSongs: overridePlaylistSongs });
    } else if (context === "playlist" && showPlaylist) {
      const p = playlists.find(p => p.id === activePlaylistId);
      setPlaybackContext({ type: "playlist", playlistId: activePlaylistId, playlistSongs: p ? p.songs : [] });
    } else {
      setPlaybackContext({ type: "radio" });
    }

    if (addToHistory && currentSong) {
      setPlaybackHistory((prev) => [...prev, currentSong]);
    }
    setCurrentSong(song);
    setLyrics([]);
    setLyricsLoading(true);
    lastScrolledIndex.current = -1;
    
    // Fetch related songs in the background
    getRelatedSongs(song.id).then(setRelatedSongs);
    
    const fetchedLyrics = await getSyncedLyrics(song.title, song.artist);
    setLyrics(fetchedLyrics);
    setLyricsLoading(false);
  };

  const playNextSong = () => {
    if (relatedSongs.length > 0) {
      // Pick a random song from related songs that isn't the current song
      const available = relatedSongs.filter(s => s.id !== currentSong?.id);
      if (available.length > 0) {
        const next = available[Math.floor(Math.random() * available.length)];
        playSong(next, true);
      }
    }
  };

  const playPreviousSong = () => {
    if (playbackHistory.length > 0) {
      const prev = playbackHistory[playbackHistory.length - 1];
      setPlaybackHistory((h) => h.slice(0, -1)); // pop
      playSong(prev, false); // don't add current to history when going back
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const newTime = (x / bounds.width) * duration;
    playerRef.current.seekTo(newTime, true);
    setProgress(newTime);
  };

  return (
    <div className="min-h-screen w-full flex flex-col-reverse md:flex-row-reverse bg-[#F4EFEA] text-[#024230] font-sans selection:bg-[#FF3366] selection:text-[#F4EFEA]">
      


      {/* Hidden YouTube Player */}
      <div className="hidden">
        {currentSong && (
          <YouTube
            videoId={currentSong.id}
            opts={{ height: "0", width: "0", playerVars: { autoplay: 1, controls: 0 } }}
            onReady={onReady}
            onStateChange={onStateChange}
          />
        )}
      </div>

      {/* LEFT COLUMN - SEARCH & UI */}
      <div className="w-full md:w-[50%] lg:w-[40%] flex flex-col border-t-4 md:border-t-0 md:border-l-4 border-[#024230] relative z-20 bg-[#111] text-white overflow-hidden drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
        {(!currentSong && !hasSearched) ? (
          <video 
            src="/mainbg.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-100 mix-blend-multiply brightness-75" 
          />
        ) : currentSong ? (
          <div className="absolute inset-0 w-full h-full z-0">
            <img 
              src={artistBg || currentSong.image} 
              className="absolute inset-0 w-full h-full object-cover opacity-60" 
              alt="Artist Background"
            />
          </div>
        ) : null}
        <div className="relative z-10 w-full h-full flex flex-col justify-start overflow-y-auto p-6 md:p-12">
          <header className="mb-6">
          <div className="flex justify-between items-end border-b-4 border-white/30 pb-4">
            <h1 
              onClick={() => { setHasSearched(false); setShowPlaylist(false); setArtistQuery(""); setSongQuery(""); setSearchResults([]); }}
              className="text-2xl font-black uppercase tracking-[0.2em] leading-none cursor-pointer hover:text-[#FF3366] transition-colors"
            >
              LISTEN WITH SARTHAK
            </h1>
          </div>
        </header>

<div className="flex flex-col justify-start gap-2 mt-2 mb-4">
          <div className="flex flex-col gap-2 w-full">
            
            {/* Artist Box */}
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if(artistQuery.trim()) { setArtistSuggestions([]); executeFullSearch(artistQuery, "artist"); }
              }} 
              className="relative w-full group"
            >
              <div className="border-2 border-white/40 bg-white/10 backdrop-blur-md shadow-[2px_2px_0_0_rgba(255,255,255,0.3)] group-focus-within:translate-y-px group-focus-within:translate-x-px group-focus-within:shadow-[0px_0px_0_0_#024230] transition-all duration-200">
                <div className="bg-white/20 text-white px-2 py-0.5 inline-block text-[10px] font-black uppercase tracking-widest border-r-2 border-b-2 border-white/40 backdrop-blur-xl">
                  Artist
                </div>
                <input
                  type="text"
                  placeholder="Who are you looking for?"
                  value={artistQuery}
                  onChange={(e) => setArtistQuery(e.target.value)}
                  className="w-full bg-transparent text-base font-bold px-3 py-1 outline-none placeholder:text-white/50 text-white"
                />
              </div>

              <AnimatePresence>
                {artistSuggestions.length > 0 && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-4 bg-black/60 backdrop-blur-xl border-2 border-white/30 shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] z-50 flex flex-col divide-y-2 divide-white/20"
                  >
                    {artistSuggestions.map((sug, i) => (
                      <li 
                        key={i} 
                        onClick={() => { setArtistQuery(sug); setArtistSuggestions([]); executeFullSearch(sug, "artist"); }}
                        className="px-6 py-4 cursor-pointer text-xl font-bold uppercase tracking-tight text-white hover:bg-white hover:text-black transition-colors flex justify-between items-center group/item"
                      >
                        {sug}
                        <ArrowRight className="w-6 h-6 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </form>

            {/* Song Box */}
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if(songQuery.trim()) { setSongSuggestions([]); executeFullSearch(songQuery, "song"); }
              }} 
              className="relative w-full group"
            >
              <div className="border-2 border-white/40 bg-white/10 backdrop-blur-md shadow-[2px_2px_0_0_rgba(255,255,255,0.3)] group-focus-within:translate-y-px group-focus-within:translate-x-px group-focus-within:shadow-[0px_0px_0_0_#024230] transition-all duration-200">
                <div className="bg-white/20 text-white px-2 py-0.5 inline-block text-[10px] font-black uppercase tracking-widest border-r-2 border-b-2 border-white/40 backdrop-blur-xl">
                  Track
                </div>
                <input
                  type="text"
                  placeholder="What is the song name?"
                  value={songQuery}
                  onChange={(e) => setSongQuery(e.target.value)}
                  className="w-full bg-transparent text-base font-bold px-3 py-1 outline-none placeholder:text-white/50 text-white"
                />
              </div>

              <AnimatePresence>
                {songSuggestions.length > 0 && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-4 bg-black/60 backdrop-blur-xl border-2 border-white/30 shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] z-50 flex flex-col divide-y-2 divide-white/20"
                  >
                    {songSuggestions.map((sug, i) => (
                      <li 
                        key={i} 
                        onClick={() => { setSongQuery(sug); setSongSuggestions([]); executeFullSearch(sug, "song"); }}
                        className="px-6 py-4 cursor-pointer text-xl font-bold uppercase tracking-tight text-white hover:bg-white hover:text-black transition-colors flex justify-between items-center group/item"
                      >
                        {sug}
                        <ArrowRight className="w-6 h-6 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </form>
          </div>
          
                  </div>

<AnimatePresence>
          {currentSong && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 48 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="w-full flex flex-col gap-4 overflow-hidden"
            >
              <div className="border border-white/20 bg-black/5 backdrop-blur-md p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex flex-col gap-4 hover:scale-[1.02] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.6)] transition-all duration-300 relative text-white rounded-2xl">
                 <div className="absolute top-3 right-3 bg-[#FF3366]/90 backdrop-blur-md text-white border border-white/30 px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase shadow-lg z-20">
                   Now Playing
                 </div>
                 <div className="flex gap-4">
                    <div className="relative w-24 h-24 shrink-0 rounded-full">
                       <motion.div 
                         className="w-24 h-24 bg-black rounded-full overflow-hidden absolute top-0 left-0"
                         animate={{ rotate: isPlaying ? 360 : 0 }}
                         transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                       >
                         <img src={currentSong.image} className="w-full h-full object-cover scale-[1.35]" alt="album art" />
                         <div className="absolute inset-0 m-auto w-3 h-3 bg-white border-2 border-[#024230] rounded-full z-10" />
                       </motion.div>
                    </div>
                    <div className="flex flex-col justify-center overflow-hidden w-full relative">
                       <div className="flex items-center gap-4">
                         <span className="text-2xl font-black uppercase tracking-tighter truncate">{currentSong.title}</span>
                         {isPlaying && (
                           <div className="flex items-end gap-1 h-6 shrink-0">
                             {[0.6, 0.4, 0.8, 0.5].map((speed, i) => (
                               <motion.div
                                 key={i}
                                 className="w-1.5 bg-[#FF3366] border border-[#024230]"
                                 animate={{ height: ["20%", "100%", "40%", "80%", "20%"] }}
                                 transition={{ repeat: Infinity, duration: speed, ease: "easeInOut" }}
                               />
                             ))}
                           </div>
                         )}
                       </div>
                       <span className="text-xs font-bold tracking-widest uppercase opacity-70 truncate text-gray-400">{currentSong.artist}</span>
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-4 w-full">
                    <div className="w-full flex flex-col gap-1 cursor-pointer" onClick={handleProgressClick}>
                       <div className="flex justify-between text-xs font-bold uppercase text-gray-300">
                         <span>{Math.floor(progress / 60)}:{(Math.floor(progress % 60)).toString().padStart(2, "0")}</span>
                         <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, "0")}</span>
                       </div>
                       <div className="h-2 w-full rounded-full bg-white/20 relative backdrop-blur-md overflow-hidden">
                         <motion.div 
                           className="absolute top-0 left-0 h-full bg-white rounded-full"
                           style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                         />
                       </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 w-full">
                      <button 
                        onClick={playPreviousSong}
                        className={`w-10 h-10 shrink-0 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all shadow-md hover:scale-105 ${playbackHistory.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={playbackHistory.length === 0}
                      >
                        <SkipBack className="w-4 h-4 fill-current" />
                      </button>

                      <button 
                        onClick={togglePlay}
                        className={`w-12 h-12 shrink-0 rounded-full bg-[#FF3366]/90 hover:bg-[#FF3366] backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all shadow-lg hover:scale-105 ${!isPlaying ? 'shadow-lg animate-pulse' : 'shadow-lg'}`}
                      >
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                      </button>

                      <button 
                        onClick={playNextSong}
                        className={`w-10 h-10 shrink-0 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all shadow-md hover:scale-105 ${relatedSongs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={relatedSongs.length === 0}
                      >
                        <SkipForward className="w-4 h-4 fill-current" />
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          togglePlaylistSong(currentSong, e);
                        }}
                        className="w-10 h-10 shrink-0 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-[#FF3366] flex items-center justify-center transition-all shadow-md hover:scale-105 group/fav"
                      >
                        <Heart className={`w-4 h-4 ${!!playlists.find(p => p.id === activePlaylistId)?.songs.find(s => s.id === currentSong.id) ? 'fill-current text-[#FF3366] group-hover/fav:text-white' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {hasHeadphones && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="w-10 h-10 shrink-0 rounded-full bg-blue-500/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg"
                            title="Headphones Connected"
                          >
                            <Headphones className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button 
                        onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
                        className="absolute right-0 p-2 text-white/40 hover:text-white transition-colors"
                        title="Toggle Lyrics Width"
                      >
                        {isLyricsExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                      </button>
                    </div>
                 </div>


                 {/* LYRICS BOX */}
                 <div 
                   ref={lyricsContainerRef}
                   onWheel={handleUserInteraction}
                   onTouchMove={handleUserInteraction}
                   onMouseDown={handleUserInteraction}
                   className="mt-4 border-t-2 border-[#333] pt-4 overflow-y-auto overflow-x-hidden relative bg-transparent scrollbar-hide" 
                   style={{ height: "180px" }}
                 >
                    {lyricsLoading ? (
                       <div className="w-full h-full flex flex-col items-center justify-center opacity-50">
                         <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
                         <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Lyrics</span>
                       </div>
                    ) : lyrics.length === 0 ? (
                       <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                         <span className="text-xs font-bold uppercase tracking-widest text-gray-400">No Lyrics Found</span>
                       </div>
                    ) : (
                       <div 
                         className="flex flex-col gap-3 w-full px-4 py-[75px]"
                       >
                         {lyrics.map((line, i) => {
                            const activeIndex = lyrics.reduce((acc, l, idx) => (progress >= l.time ? idx : acc), 0);
                            const isActive = i === activeIndex;
                            const isPast = i < activeIndex;
                            return (
                              <motion.div 
                                key={i} 
                                onClick={() => {
                                  if (playerRef.current) {
                                    playerRef.current.seekTo(line.time, true);
                                    setProgress(line.time);
                                    isUserScrolling.current = false;
                                    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
                                  }
                                }}
                                animate={{ 
                                  opacity: isActive ? 1 : isPast ? 0.5 : 0.7, 
                                  scale: isActive ? 1.05 : 0.95,
                                  x: isActive ? 20 : 0,
                                  letterSpacing: isActive ? '0.05em' : '-0.05em'
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                                className={`cursor-pointer font-black uppercase origin-left transition-colors hover:opacity-100 flex flex-wrap ${isLyricsExpanded ? "text-3xl md:text-5xl mb-6" : "text-xl md:text-3xl mb-4"}`}
                              >
                                {line.words ? line.words.map((w, wIdx) => {
                                  const isWordActive = isActive && progress >= w.time;
                                  return (
                                    <span 
                                      key={wIdx} 
                                      className="inline-block mr-2 md:mr-3 transition-all duration-150"
                                      style={{
                                        color: isWordActive ? '#FF3366' : (isActive ? '#fff' : '#999'),
                                        textShadow: isWordActive ? '2px 2px 0px #000' : '0px 0px 0px transparent',
                                        transform: isWordActive ? 'scale(1.05) translateY(-2px)' : 'scale(1) translateY(0px)'
                                      }}
                                    >
                                      {w.text}
                                    </span>
                                  )
                                }) : (
                                  <span style={{ color: isActive ? '#FF3366' : '#999' }}>
                                    {line.text}
                                  </span>
                                )}
                              </motion.div>
                            )
                         })}
                       </div>
                    )}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col mt-4">
<div className="w-full flex flex-col gap-4">
            <h3 className="text-xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] border-b-4 border-white/30 pb-2">Playlists</h3>
            {playlists.map(p => (
              <button 
                key={p.id}
                onClick={() => { setActivePlaylistId(p.id); setShowPlaylist(true); setHasSearched(false); setIsEditingPlaylist(false); }}
                className={`w-full border-2 border-white/40 p-4 text-2xl font-black uppercase tracking-tighter transition-all flex justify-between items-center ${showPlaylist && activePlaylistId === p.id ? 'bg-[#FF3366] text-[#F4EFEA] shadow-none translate-y-1 translate-x-1' : 'bg-white/10 backdrop-blur-md text-white shadow-[6px_6px_0_0_rgba(255,255,255,0.2)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_rgba(255,255,255,0.2)]'}`}
              >
                <span className="truncate pr-4 text-left">{p.name}</span>
                <span className="bg-[#024230] text-[#F4EFEA] px-3 py-1 rounded-full text-sm shrink-0">{p.songs.length}</span>
              </button>
            ))}
            <button 
              onClick={() => {
                const name = prompt("Enter playlist name:");
                if (name) {
                  const newP = { id: Date.now().toString(), name, songs: [] };
                  savePlaylists([...playlists, newP]);
                }
              }}
              className="w-full border-4 border-white/40 border-dashed p-4 text-xl font-black uppercase tracking-tighter hover:bg-white hover:text-black transition-colors"
            >
              + New Playlist
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* RIGHT COLUMN - RESULTS & PLAYER */}
      <div className="w-full md:w-[50%] lg:w-[60%] relative bg-gradient-to-br from-[#1a1a1a] via-[#050505] to-black shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] text-[#F4EFEA] overflow-hidden flex flex-col min-h-[50vh] md:min-h-screen">
        


        {/* Content Area */}
        <div className="relative z-10 flex-1 p-6 md:p-12 overflow-y-auto">
          {showPlaylist ? (() => {
            const activePlaylist = playlists.find(p => p.id === activePlaylistId);
            if (!activePlaylist) return null;
            return (
            <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto pb-32">
              <div className="flex flex-col gap-4 border-b-4 border-[#F4EFEA] pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-[#FF3366] truncate">{activePlaylist.name}</h3>
                  <div className="flex gap-4 shrink-0">
                    <button 
                      onClick={() => {
                        const newName = prompt("Rename playlist:", activePlaylist.name);
                        if (newName) {
                          savePlaylists(playlists.map(p => p.id === activePlaylistId ? { ...p, name: newName } : p));
                        }
                      }}
                      className="px-3 py-2 border-2 border-transparent hover:border-[#FF3366] transition-colors uppercase font-bold text-sm"
                    >Rename</button>
                    <button 
                      onClick={() => {
                        const shuffled = [...activePlaylist.songs].sort(() => Math.random() - 0.5);
                        savePlaylists(playlists.map(p => p.id === activePlaylistId ? { ...p, songs: shuffled } : p));
                      }}
                      className="px-3 py-2 border-2 border-transparent hover:border-[#FF3366] transition-colors uppercase font-bold text-sm"
                    >Shuffle</button>
                    <button 
                      onClick={() => setIsEditingPlaylist(!isEditingPlaylist)}
                      className={`px-3 py-2 border-2 transition-colors uppercase font-bold text-sm ${isEditingPlaylist ? 'border-[#FF3366] bg-[#FF3366] text-[#F4EFEA]' : 'border-transparent hover:border-[#FF3366]'}`}
                    >{isEditingPlaylist ? 'Done' : 'Edit'}</button>
                  </div>
                </div>
              </div>
              
              {activePlaylist.songs.length === 0 ? (
                <p className="text-2xl font-bold uppercase opacity-50">This playlist is empty. Add songs by clicking the heart icon!</p>
              ) : (
                <div className="flex flex-col bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
                  <div className="flex flex-col divide-y divide-white/10 p-2">
                    {activePlaylist.songs.map((song, index) => (
                      <div 
                        key={song.id} 
                        className={`relative group/box flex transition-all duration-200 ${draggedIndex === index ? 'opacity-30 scale-[0.98]' : 'opacity-100'}`}
                        draggable={isEditingPlaylist}
                        onDragStart={() => setDraggedIndex(index)}
                        onDragOver={(e) => {
                          e.preventDefault(); // Necessary to allow dropping
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedIndex === null || draggedIndex === index) return;
                          
                          const newSongs = [...activePlaylist.songs];
                          const [draggedItem] = newSongs.splice(draggedIndex, 1);
                          newSongs.splice(index, 0, draggedItem);
                          savePlaylists(playlists.map(p => p.id === activePlaylistId ? { ...p, songs: newSongs } : p));
                          setDraggedIndex(null);
                        }}
                        onDragEnd={() => setDraggedIndex(null)}
                      >
                        <div className="flex-1 pointer-events-auto">
                          <SongBox 
                            song={song} 
                            index={index} 
                            onPlay={() => !isEditingPlaylist && playSong(song, true, "playlist")} 
                            isFavorite={true} 
                            onToggleFavorite={(e) => togglePlaylistSong(song, e)} 
                          />
                        </div>
                        {isEditingPlaylist && (
                          <div className="absolute inset-y-0 right-12 flex items-center justify-center bg-black/40 backdrop-blur-md px-4 rounded-r-2xl border-l border-white/20 cursor-grab active:cursor-grabbing text-white/50 hover:text-white transition-colors">
                            <GripVertical className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            );
          })() : !hasSearched ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-12 w-full max-w-[1400px] mx-auto pb-32">
              
              {/* Worldwide Section */}
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between border-b-4 border-[#F4EFEA] pb-4">
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-[#FF3366]">Trending Worldwide</h3>
                </div>
                
                {trendingWorldwide.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin opacity-50" />
                  </div>
                ) : (
                  <div className="flex flex-col bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
                    <div className="flex flex-col divide-y divide-white/10 p-2">
                      {trendingWorldwide.map((song, index) => (
                      <SongBox 
                        key={song.id} 
                        song={song} 
                        index={index} 
                        onPlay={() => playSong(song)} 
                        isFavorite={!!playlists.find(p => p.id === activePlaylistId)?.songs.find(s => s.id === song.id)} 
                        onToggleFavorite={(e) => togglePlaylistSong(song, e)} 
                      />
                    ))}
                    </div>
                  </div>
                )}
              </div>

              {/* India Section */}
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between border-b-4 border-[#F4EFEA] pb-4">
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-[#FF3366]">Trending in India</h3>
                </div>
                
                {trendingIndia.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin opacity-50" />
                  </div>
                ) : (
                  <div className="flex flex-col bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
                    <div className="flex flex-col divide-y divide-white/10 p-2">
                      {trendingIndia.map((song, index) => (
                      <SongBox 
                        key={song.id} 
                        song={song} 
                        index={index} 
                        onPlay={() => playSong(song)} 
                        isFavorite={!!playlists.find(p => p.id === activePlaylistId)?.songs.find(s => s.id === song.id)} 
                        onToggleFavorite={(e) => togglePlaylistSong(song, e)} 
                      />
                    ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto pb-32">
              <div className="flex items-center justify-between border-b-4 border-[#F4EFEA] pb-4">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Results</h3>
                {isSearching && <Loader2 className="w-8 h-8 animate-spin" />}
              </div>
              
              {!isSearching && searchResults.length === 0 && (
                <p className="text-2xl font-bold uppercase opacity-50">No matches found.</p>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="flex flex-col bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
                  <div className="flex flex-col divide-y divide-white/10 p-2">
                    {searchResults.map((song, index) => (
                      <SongBox 
                        key={song.id} 
                        song={song} 
                        index={index} 
                        onPlay={() => playSong(song)} 
                        isFavorite={!!playlists.find(p => p.id === activePlaylistId)?.songs.find(s => s.id === song.id)} 
                        onToggleFavorite={(e) => togglePlaylistSong(song, e)} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
