"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Search, Loader2, ArrowRight, SkipBack, SkipForward } from "lucide-react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { searchYouTube, getSearchSuggestions, getSyncedLyrics, getTrendingWorldwide, getTrendingIndia, getRelatedSongs } from "./actions";
import type { SyncedLyric } from "./actions";

type Song = {
  id: string;
  title: string;
  artist: string;
  image: string;
  duration?: string;
  seconds?: number;
};

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

  useEffect(() => {
    getTrendingWorldwide().then(setTrendingWorldwide);
    getTrendingIndia().then(setTrendingIndia);
  }, []);
  
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
      }, 1000);
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

  const playSong = async (song: Song, addToHistory: boolean = true) => {
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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F4EFEA] text-[#024230] font-sans selection:bg-[#FF3366] selection:text-[#F4EFEA]">
      
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
      <div className="w-full md:w-[50%] lg:w-[40%] p-6 md:p-12 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-[#024230] relative z-20 bg-[#F4EFEA]">
        
        <header className="mb-12">
          <div className="flex justify-between items-end border-b-4 border-[#024230] pb-4">
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
              LISTEN WITH SARTHAK
            </h1>
            <button 
              onClick={() => { setHasSearched(false); setArtistQuery(""); setSongQuery(""); setSearchResults([]); setCurrentSong(null); }}
              className="text-sm font-bold uppercase tracking-widest hover:text-[#FF3366] transition-colors"
            >
              Reset
            </button>
          </div>
        </header>

        <AnimatePresence>
          {currentSong && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 48 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="w-full flex flex-col gap-4 overflow-hidden"
            >
              <div className="border-4 border-[#024230] bg-white p-4 shadow-[8px_8px_0_0_#024230] flex flex-col gap-4">
                 <div className="flex gap-4">
                    <div className="w-24 h-24 shrink-0 border-4 border-[#024230] bg-[#FF3366]">
                       <img src={currentSong.image} className="w-full h-full object-cover mix-blend-multiply" alt="album art" />
                    </div>
                    <div className="flex flex-col justify-center overflow-hidden w-full">
                       <span className="text-2xl font-black uppercase tracking-tighter truncate">{currentSong.title}</span>
                       <span className="text-xs font-bold tracking-widest uppercase opacity-70 truncate text-[#024230]">{currentSong.artist}</span>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={playPreviousSong}
                        className={`w-10 h-10 shrink-0 border-4 border-[#024230] bg-[#F4EFEA] text-[#024230] hover:bg-[#024230] hover:text-[#F4EFEA] flex items-center justify-center transition-colors shadow-[4px_4px_0_0_#024230] hover:translate-y-1 hover:translate-x-1 hover:shadow-none ${playbackHistory.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={playbackHistory.length === 0}
                      >
                        <SkipBack className="w-4 h-4 fill-current" />
                      </button>

                      <button 
                        onClick={togglePlay}
                        className="w-12 h-12 shrink-0 border-4 border-[#024230] bg-[#FF3366] text-white hover:bg-[#024230] flex items-center justify-center transition-colors shadow-[4px_4px_0_0_#024230] hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
                      >
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                      </button>

                      <button 
                        onClick={playNextSong}
                        className={`w-10 h-10 shrink-0 border-4 border-[#024230] bg-[#F4EFEA] text-[#024230] hover:bg-[#024230] hover:text-[#F4EFEA] flex items-center justify-center transition-colors shadow-[4px_4px_0_0_#024230] hover:translate-y-1 hover:translate-x-1 hover:shadow-none ${relatedSongs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={relatedSongs.length === 0}
                      >
                        <SkipForward className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col gap-1 cursor-pointer" onClick={handleProgressClick}>
                       <div className="flex justify-between text-xs font-bold uppercase text-[#024230]">
                         <span>{Math.floor(progress / 60)}:{(Math.floor(progress % 60)).toString().padStart(2, "0")}</span>
                         <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, "0")}</span>
                       </div>
                       <div className="h-4 w-full border-4 border-[#024230] bg-[#F4EFEA] relative">
                         <motion.div 
                           className="absolute top-0 left-0 h-full bg-[#024230]"
                           style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                         />
                       </div>
                    </div>
                 </div>

                 {/* LYRICS BOX */}
                 <div 
                   ref={lyricsContainerRef}
                   onWheel={handleUserInteraction}
                   onTouchMove={handleUserInteraction}
                   onMouseDown={handleUserInteraction}
                   className="mt-2 border-t-4 border-[#024230] pt-4 overflow-y-auto overflow-x-hidden relative bg-[#F4EFEA] scrollbar-hide" 
                   style={{ height: "180px" }}
                 >
                    {lyricsLoading ? (
                       <div className="w-full h-full flex flex-col items-center justify-center opacity-50">
                         <Loader2 className="w-8 h-8 animate-spin text-[#024230] mb-2" />
                         <span className="text-xs font-bold uppercase tracking-widest text-[#024230]">Loading Lyrics</span>
                       </div>
                    ) : lyrics.length === 0 ? (
                       <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                         <span className="text-xs font-bold uppercase tracking-widest text-[#024230]">No Lyrics Found</span>
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
                                  opacity: isActive ? 1 : isPast ? 0.3 : 0.6, 
                                  scale: isActive ? 1.05 : 0.95,
                                  x: isActive ? 20 : 0,
                                  color: isActive ? '#FF3366' : '#024230',
                                  textShadow: isActive ? '4px 4px 0px #024230' : '0px 0px 0px transparent',
                                  letterSpacing: isActive ? '0.05em' : '-0.05em'
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                                className="cursor-pointer text-xl md:text-3xl font-black uppercase origin-left transition-colors hover:opacity-100"
                              >
                                {line.text}
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
        <div className="flex-1 flex flex-col justify-start gap-8 mt-8">
          <div className="flex flex-col gap-8 w-full">
            
            {/* Artist Box */}
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if(artistQuery.trim()) { setArtistSuggestions([]); executeFullSearch(artistQuery, "artist"); }
              }} 
              className="relative w-full group"
            >
              <div className="border-4 border-[#024230] bg-[#F4EFEA] shadow-[8px_8px_0_0_#024230] group-focus-within:translate-y-1 group-focus-within:translate-x-1 group-focus-within:shadow-[4px_4px_0_0_#024230] transition-all duration-200">
                <div className="bg-[#024230] text-[#F4EFEA] px-4 py-2 inline-block text-sm font-black uppercase tracking-widest border-r-4 border-b-4 border-[#024230]">
                  Artist
                </div>
                <input
                  type="text"
                  placeholder="Who are you looking for?"
                  value={artistQuery}
                  onChange={(e) => setArtistQuery(e.target.value)}
                  className="w-full bg-transparent text-3xl font-bold px-6 py-4 outline-none placeholder:text-[#024230]/30"
                />
              </div>

              <AnimatePresence>
                {artistSuggestions.length > 0 && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-4 bg-[#F4EFEA] border-4 border-[#024230] shadow-[8px_8px_0_0_#024230] z-50 flex flex-col divide-y-4 divide-[#024230]"
                  >
                    {artistSuggestions.map((sug, i) => (
                      <li 
                        key={i} 
                        onClick={() => { setArtistQuery(sug); setArtistSuggestions([]); executeFullSearch(sug, "artist"); }}
                        className="px-6 py-4 cursor-pointer text-xl font-bold uppercase tracking-tight hover:bg-[#FF3366] hover:text-[#F4EFEA] transition-colors flex justify-between items-center group/item"
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
              <div className="border-4 border-[#024230] bg-[#F4EFEA] shadow-[8px_8px_0_0_#024230] group-focus-within:translate-y-1 group-focus-within:translate-x-1 group-focus-within:shadow-[4px_4px_0_0_#024230] transition-all duration-200">
                <div className="bg-[#024230] text-[#F4EFEA] px-4 py-2 inline-block text-sm font-black uppercase tracking-widest border-r-4 border-b-4 border-[#024230]">
                  Track
                </div>
                <input
                  type="text"
                  placeholder="What is the song name?"
                  value={songQuery}
                  onChange={(e) => setSongQuery(e.target.value)}
                  className="w-full bg-transparent text-3xl font-bold px-6 py-4 outline-none placeholder:text-[#024230]/30"
                />
              </div>

              <AnimatePresence>
                {songSuggestions.length > 0 && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-4 bg-[#F4EFEA] border-4 border-[#024230] shadow-[8px_8px_0_0_#024230] z-50 flex flex-col divide-y-4 divide-[#024230]"
                  >
                    {songSuggestions.map((sug, i) => (
                      <li 
                        key={i} 
                        onClick={() => { setSongQuery(sug); setSongSuggestions([]); executeFullSearch(sug, "song"); }}
                        className="px-6 py-4 cursor-pointer text-xl font-bold uppercase tracking-tight hover:bg-[#FF3366] hover:text-[#F4EFEA] transition-colors flex justify-between items-center group/item"
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
      </div>

      {/* RIGHT COLUMN - RESULTS & PLAYER */}
      <div className="w-full md:w-[50%] lg:w-[60%] relative bg-[#024230] text-[#F4EFEA] overflow-hidden flex flex-col min-h-[50vh] md:min-h-screen">
        


        {/* Content Area */}
        <div className="relative z-10 flex-1 p-6 md:p-12 overflow-y-auto">
          {!hasSearched ? (
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
                  <div className="flex flex-col border-4 border-[#F4EFEA] bg-[#024230] shadow-[12px_12px_0_0_#FF3366]">
                    <div className="flex flex-col divide-y-4 divide-[#F4EFEA]">
                      {trendingWorldwide.map((song, index) => (
                        <div 
                          key={song.id}
                          onClick={() => playSong(song)}
                          className="p-3 md:p-4 hover:bg-[#F4EFEA] hover:text-[#024230] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center gap-4 group"
                        >
                          <div className="w-8 shrink-0 text-xl font-black opacity-50 group-hover:opacity-100 group-hover:text-[#FF3366] transition-colors">
                            #{index + 1}
                          </div>
                          <div className="w-16 h-16 border-[3px] border-[#F4EFEA] group-hover:border-[#024230] shrink-0 relative overflow-hidden bg-black">
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
                        </div>
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
                  <div className="flex flex-col border-4 border-[#F4EFEA] bg-[#024230] shadow-[12px_12px_0_0_#FF3366]">
                    <div className="flex flex-col divide-y-4 divide-[#F4EFEA]">
                      {trendingIndia.map((song, index) => (
                        <div 
                          key={song.id}
                          onClick={() => playSong(song)}
                          className="p-3 md:p-4 hover:bg-[#F4EFEA] hover:text-[#024230] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center gap-4 group"
                        >
                          <div className="w-8 shrink-0 text-xl font-black opacity-50 group-hover:opacity-100 group-hover:text-[#FF3366] transition-colors">
                            #{index + 1}
                          </div>
                          <div className="w-16 h-16 border-[3px] border-[#F4EFEA] group-hover:border-[#024230] shrink-0 relative overflow-hidden bg-black">
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
                        </div>
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
                <div className="flex flex-col border-4 border-[#F4EFEA] bg-[#024230] shadow-[12px_12px_0_0_#FF3366]">
                  <div className="flex flex-col divide-y-4 divide-[#F4EFEA]">
                    {searchResults.map((song, index) => (
                      <div 
                        key={song.id}
                        onClick={() => playSong(song)}
                        className="p-3 md:p-4 hover:bg-[#F4EFEA] hover:text-[#024230] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center gap-4 group"
                      >
                        <div className="w-8 shrink-0 text-xl font-black opacity-50 group-hover:opacity-100 group-hover:text-[#FF3366] transition-colors">
                          #{index + 1}
                        </div>
                        <div className="w-16 h-16 border-[3px] border-[#F4EFEA] group-hover:border-[#024230] shrink-0 relative overflow-hidden bg-black">
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
                      </div>
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
