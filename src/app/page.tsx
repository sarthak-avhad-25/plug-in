"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Search, Loader2, ArrowRight, SkipBack, SkipForward, Heart, GripVertical, Headphones, Maximize2, Minimize2, Trash2, Info, Home, Library, Compass, ChevronDown, MoreHorizontal, ListMusic } from "lucide-react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { searchYouTube, getArtistBackground, getSearchSuggestions, getSyncedLyrics, getTrendingWorldwide, getTrendingIndia, getRelatedSongs } from "./actions";
import type { SyncedLyric } from "./actions";
import { loadProfiles, saveProfilesServer, loadActiveProfile, saveActiveProfileServer, loadPlaylistsServer, savePlaylistsServer, deletePlaylistsServer } from "./storage";

type Profile = {
  id: string;
  name: string;
  color: string;
  emoji: string;
};

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


const SongBox = ({ song, index, onPlay, isFavorite, onToggleFavorite }: { song: Song, index: number, onPlay: (e: React.MouseEvent) => void, isFavorite: boolean, onToggleFavorite: (e: React.MouseEvent) => void }) => (
  <div 
    onClick={(e) => onPlay(e)}
    className="p-2 md:p-4 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all duration-500 transform hover:scale-[1.02] md:hover:scale-110 hover:shadow-2xl cursor-pointer flex flex-row items-center gap-3 md:gap-4 group"
  >
    <div className="w-8 shrink-0 text-sm md:text-xl font-bold md:font-black opacity-40 group-hover:opacity-100 group-hover:text-white transition-colors text-center">
      {index + 1}
    </div>
    <div className="w-12 h-12 md:w-16 md:h-16 rounded-md md:rounded-xl border border-white/10 md:border-white/20 group-hover:border-white/50 shrink-0 relative overflow-hidden bg-black shadow-md md:shadow-lg">
      <img src={song.image} className="w-full h-full object-cover opacity-90 md:opacity-80 group-hover:opacity-100 transition-opacity" alt={song.title} />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 md:bg-[#FF3366]/80 transition-opacity">
        <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-white ml-1" />
      </div>
    </div>
    <div className="flex flex-col flex-1 overflow-hidden border-b border-white/5 md:border-transparent pb-2 md:pb-0 h-full justify-center">
      <span className="text-sm md:text-base font-semibold md:font-black tracking-normal md:uppercase md:tracking-tighter truncate leading-none mb-1 transform transition-all duration-300 md:duration-500 group-hover:scale-105 group-hover:text-white">
        {song.title}
      </span>
      <span className="text-xs font-normal md:font-bold md:tracking-widest md:uppercase opacity-60 md:opacity-70 truncate">
        {song.artist}
      </span>
    </div>
    <button 
      onClick={onToggleFavorite}
      className="ml-auto p-2 opacity-50 group-hover:opacity-100 transition-opacity md:hover:scale-110"
    >
      <Heart className={`w-5 h-5 md:w-8 md:h-8 ${isFavorite ? 'fill-[#FC3C44] text-[#FC3C44]' : 'text-current'}`} />
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

  const [isClient, setIsClient] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

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
  const [playlistMenu, setPlaylistMenu] = useState<{song: Song, x: number, y: number} | null>(null);
  const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isLightBg, setIsLightBg] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [showInlineSearch, setShowInlineSearch] = useState(false);
  const [inlineSearchQuery, setInlineSearchQuery] = useState("");
  const [inlineSearchResults, setInlineSearchResults] = useState<Song[]>([]);
  const [isInlineSearching, setIsInlineSearching] = useState(false);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [hasHeadphones, setHasHeadphones] = useState(false);

  // Mobile specific state
  const [mobileTab, setMobileTab] = useState<"home" | "search" | "library">("home");
  const [showMobilePlayer, setShowMobilePlayer] = useState(false);

  const savePlaylists = (newPlaylists: Playlist[]) => {
    setPlaylists(newPlaylists);
    if (activeProfile) {
      localStorage.setItem(`frans_hals_playlists_${activeProfile.id}`, JSON.stringify(newPlaylists));
      // Persist to Redis in the background (fire-and-forget)
      savePlaylistsServer(activeProfile.id, newPlaylists);
    }
  };

  useEffect(() => {
    const fetchTrending = async () => {
      const today = new Date().toLocaleDateString();
      const cached = localStorage.getItem('music_trending_cache');
      
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.date === today && parsed.worldwide && parsed.india) {
            setTrendingWorldwide(parsed.worldwide);
            setTrendingIndia(parsed.india);
            return; // Cache is fresh for today
          }
        } catch(e) {}
      }
      
      // Fetch fresh data if no cache or day changed
      const ww = await getTrendingWorldwide();
      const ind = await getTrendingIndia();
      setTrendingWorldwide(ww);
      setTrendingIndia(ind);
      
      localStorage.setItem('music_trending_cache', JSON.stringify({
        date: today,
        worldwide: ww,
        india: ind
      }));
    };

    fetchTrending();
    
    // Schedule an automatic refresh at exactly 12:00 AM (midnight)
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0).getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      localStorage.removeItem('music_trending_cache');
      fetchTrending();
      // Set a daily interval after the first midnight
      setInterval(() => {
        localStorage.removeItem('music_trending_cache');
        fetchTrending();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  // Load playlists whenever the active profile changes
  useEffect(() => {
    if (!activeProfile) {
      setPlaylists([]);
      return;
    }
    const profileKey = `frans_hals_playlists_${activeProfile.id}`;
    let saved = localStorage.getItem(profileKey);
    
    // Migration for the original 'sarthak' profile or fallback
    if (!saved && activeProfile.name.toLowerCase().includes("sarthak")) {
      saved = localStorage.getItem("frans_hals_playlists");
      if (saved) {
        localStorage.setItem(profileKey, saved); // migrate
      }
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlaylists(parsed);
        // Also push to Redis to keep it in sync
        savePlaylistsServer(activeProfile.id, parsed);
      } catch (e) {
        setPlaylists([]);
      }
    } else {
      // No local data — try loading from Redis (cloud backup)
      loadPlaylistsServer(activeProfile.id).then(serverPlaylists => {
        if (serverPlaylists && serverPlaylists.length > 0) {
          setPlaylists(serverPlaylists);
          // Cache in localStorage for faster subsequent loads
          localStorage.setItem(profileKey, JSON.stringify(serverPlaylists));
        } else {
          setPlaylists([]);
        }
      });
    }
  }, [activeProfile]);

// Inactivity detection: hide search sections after 15 seconds of inactivity
useEffect(() => {
  let timeout: NodeJS.Timeout;
  const resetTimer = () => {
    setIsInactive(false);
    clearTimeout(timeout);
    timeout = setTimeout(() => setIsInactive(true), 5000);
  };
  // initialise timer
  resetTimer();
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keydown', resetTimer);
  window.addEventListener('scroll', resetTimer);
  window.addEventListener('touchstart', resetTimer);
  return () => {
    clearTimeout(timeout);
    window.removeEventListener('mousemove', resetTimer);
    window.removeEventListener('keydown', resetTimer);
    window.removeEventListener('scroll', resetTimer);
    window.removeEventListener('touchstart', resetTimer);
  };
}, []);


  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("music_profiles");
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfiles(parsed);
      // Sync to Redis in background
      saveProfilesServer(parsed);
    } else {
      // No local profiles — try loading from Redis
      loadProfiles().then(serverProfiles => {
        if (serverProfiles && serverProfiles.length > 0) {
          setProfiles(serverProfiles);
          localStorage.setItem("music_profiles", JSON.stringify(serverProfiles));
        }
      });
    }
    const savedActive = localStorage.getItem("music_active_profile");
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        setActiveProfile(parsed);
        // Sync to Redis in background
        saveActiveProfileServer(parsed);
      } catch(e) {}
    } else {
      // No local active profile — try loading from Redis
      loadActiveProfile().then(serverActive => {
        if (serverActive) {
          setActiveProfile(serverActive);
          localStorage.setItem("music_active_profile", JSON.stringify(serverActive));
        }
      });
    }
  }, []);

  const saveProfiles = (newProfiles: Profile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem("music_profiles", JSON.stringify(newProfiles));
    // Persist to Redis in the background
    saveProfilesServer(newProfiles);
  };

  const togglePlaylistSong = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlists.length > 1) {
      setPlaylistMenu({ song, x: e.clientX, y: e.clientY });
    } else {
      const p = playlists[0];
      const exists = p.songs.find(s => s.id === song.id);
      const newPlaylists = playlists.map(pl => 
        pl.id === p.id 
          ? { ...pl, songs: exists ? pl.songs.filter(s => s.id !== song.id) : [...pl.songs, song] } 
          : pl
      );
      savePlaylists(newPlaylists);
    }
  };
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [useNativeAudio, setUseNativeAudio] = useState(false);

  const lastScrolledIndex = useRef(-1);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleUserInteraction = () => {
    isUserScrolling.current = true;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    
    scrollTimeout.current = setTimeout(() => {
      isUserScrolling.current = false;
      lastScrolledIndex.current = -1; // Force immediate resync on next progress tick
      
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
    }, 3000); // Reduced timeout to 3s for better responsiveness
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
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setArtistSuggestions([]);
        setSongSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    // If native audio is handling sound, mute YouTube (keep it for state events only)
    if (useNativeAudio) {
      playerRef.current.setVolume(0);
    } else {
      playerRef.current.setVolume(50);
    }
  };

  const onStateChange = (event: any) => {
    if (event.data === 1) {
      setIsPlaying(true);
      setDuration(playerRef.current.getDuration());
      if (progressInterval.current) clearInterval(progressInterval.current);
      progressInterval.current = setInterval(() => {
        if (useNativeAudio && audioRef.current) {
          setProgress(audioRef.current.currentTime);
        } else if (playerRef.current) {
          setProgress(playerRef.current.getCurrentTime());
        }
      }, 150);
      // Start native audio playback in sync
      if (useNativeAudio && audioRef.current) {
        audioRef.current.currentTime = playerRef.current.getCurrentTime();
        audioRef.current.play().catch(() => {});
      }
    } else if (event.data === 2) {
      setIsPlaying(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
      // Pause native audio when YouTube pauses
      if (useNativeAudio && audioRef.current) {
        audioRef.current.pause();
      }
    } else if (event.data === 0) {
      setIsPlaying(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (useNativeAudio && audioRef.current) {
        audioRef.current.pause();
      }
      playNextSong();
    }
  };




  const togglePlay = () => {
    if (useNativeAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        playerRef.current?.pauseVideo();
      } else {
        audioRef.current.play().catch(() => {});
        playerRef.current?.playVideo();
      }
    } else {
      if (!playerRef.current) return;
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    }
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

  useEffect(() => {
    if (!currentSong) return;
    setArtistBg(null); // Reset while fetching
    getArtistBackground(currentSong.artist).then(bg => {
      if (bg) setArtistBg(bg);
    });
  }, [currentSong]);

  useEffect(() => {
    if (!currentSong) {
      setIsLightBg(false);
      return;
    }
    const imgUrl = artistBg || currentSong.image;
    if (!imgUrl) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i+1];
          b += data[i+2];
        }
        const pixels = data.length / 4;
        r /= pixels;
        g /= pixels;
        b /= pixels;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        setIsLightBg(brightness > 160);
      } catch (e) {
        setIsLightBg(false);
      }
    };
    img.src = imgUrl;
  }, [currentSong, artistBg]);

  // Re-scroll when expanding/collapsing
  useEffect(() => {
    lastScrolledIndex.current = -1; // force re-scroll
    setTimeout(() => { // wait for layout height transition
      if (lyricsContainerRef.current && lyrics.length > 0 && !isUserScrolling.current) {
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
    }, 100);
  }, [isLyricsExpanded]);

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

  const [clickOrigin, setClickOrigin] = useState<{x: number, y: number} | null>(null);

  const playSong = async (song: Song, addToHistory: boolean = true, context: "radio" | "playlist" = "radio", overridePlaylistSongs?: Song[], e?: React.MouseEvent) => {
    if (e) {
      setClickOrigin({ x: e.clientX, y: e.clientY });
    } else {
      setClickOrigin(null);
    }

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
    if (playbackContext.type === "playlist") {
      let actualSongs = playbackContext.playlistSongs || [];
      if (playbackContext.playlistId) {
        const p = playlists.find(pl => pl.id === playbackContext.playlistId);
        if (p) actualSongs = p.songs;
      }
      if (actualSongs.length > 0) {
        const idx = actualSongs.findIndex(s => s.id === currentSong?.id);
        if (idx !== -1) {
          if (isShuffleOn && actualSongs.length > 1) {
            let randomIdx;
            do {
              randomIdx = Math.floor(Math.random() * actualSongs.length);
            } while (randomIdx === idx);
            playSong(actualSongs[randomIdx], true, "playlist", actualSongs);
          } else {
            const nextIdx = (idx + 1) % actualSongs.length;
            playSong(actualSongs[nextIdx], true, "playlist", actualSongs);
          }
          return;
        }
      }
    }

    if (relatedSongs.length > 0) {
      const available = relatedSongs.filter(s => s.id !== currentSong?.id);
      if (available.length > 0) {
        const next = available[Math.floor(Math.random() * available.length)];
        playSong(next, true, "radio");
      }
    }
  };

  const playPreviousSong = () => {
    if (playbackContext.type === "playlist" && !isShuffleOn) {
      let actualSongs = playbackContext.playlistSongs || [];
      if (playbackContext.playlistId) {
        const p = playlists.find(pl => pl.id === playbackContext.playlistId);
        if (p) actualSongs = p.songs;
      }
      if (actualSongs.length > 0) {
        const idx = actualSongs.findIndex(s => s.id === currentSong?.id);
        if (idx !== -1) {
          const prevIdx = (idx - 1 + actualSongs.length) % actualSongs.length;
          playSong(actualSongs[prevIdx], false, "playlist", actualSongs);
          return;
        }
      }
    }

    if (playbackHistory.length > 0) {
      const prev = playbackHistory[playbackHistory.length - 1];
      setPlaybackHistory((h) => h.slice(0, -1)); // pop
      playSong(prev, false, playbackContext.type); 
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const newTime = (x / bounds.width) * duration;
    if (useNativeAudio && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, true);
    }
    setProgress(newTime);
  };

  // Keep references to latest song actions for MediaSession (avoids stale closures)
  const mediaActions = useRef({ playNextSong, playPreviousSong });
  useEffect(() => {
    mediaActions.current = { playNextSong, playPreviousSong };
  });

  // Load native audio stream for background playback support
  useEffect(() => {
    if (!currentSong) return;
    const audioUrl = `/api/audio?v=${currentSong.id}`;
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      // Test if native audio works; if so, mute YouTube
      audioRef.current.oncanplaythrough = () => {
        setUseNativeAudio(true);
        if (playerRef.current) {
          playerRef.current.setVolume(0);
        }
      };
      audioRef.current.onerror = () => {
        // Fallback: native audio failed, use YouTube audio
        setUseNativeAudio(false);
        if (playerRef.current) {
          playerRef.current.setVolume(50);
        }
      };
    }
  }, [currentSong]);

  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        artwork: [{ src: currentSong.image, sizes: '512x512', type: 'image/jpeg' }]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (useNativeAudio && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
        if (playerRef.current) playerRef.current.playVideo();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (useNativeAudio && audioRef.current) {
          audioRef.current.pause();
        }
        if (playerRef.current) playerRef.current.pauseVideo();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        mediaActions.current.playPreviousSong();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        mediaActions.current.playNextSong();
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skip = details.seekOffset ?? 10;
        let currentTime = 0;
        if (useNativeAudio && audioRef.current) {
          currentTime = audioRef.current.currentTime;
        } else if (playerRef.current) {
          currentTime = playerRef.current.getCurrentTime();
        }
        const newTime = Math.max(0, currentTime - skip);
        if (useNativeAudio && audioRef.current) {
          audioRef.current.currentTime = newTime;
        }
        if (playerRef.current) {
          playerRef.current.seekTo(newTime, true);
        }
        setProgress(newTime);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skip = details.seekOffset ?? 10;
        let currentTime = 0;
        if (useNativeAudio && audioRef.current) {
          currentTime = audioRef.current.currentTime;
        } else if (playerRef.current) {
          currentTime = playerRef.current.getCurrentTime();
        }
        const newTime = Math.min(duration, currentTime + skip);
        if (useNativeAudio && audioRef.current) {
          audioRef.current.currentTime = newTime;
        }
        if (playerRef.current) {
          playerRef.current.seekTo(newTime, true);
        }
        setProgress(newTime);
      });
    }
  }, [currentSong, useNativeAudio]);

  if (!isClient) return null; // Hydration mismatch prevention

  if (!activeProfile) {
    return (
      <div className="min-h-screen w-full bg-[#111] flex flex-col items-center justify-center selection:bg-[#FF3366] selection:text-[#F4EFEA] relative overflow-hidden">
        {/* Netflix style ambient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111]/50 to-[#111] z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF3366]/20 via-[#111]/50 to-[#111] z-0 pointer-events-none opacity-50" />
        
        <div className="relative z-20 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-12 drop-shadow-xl">Who's listening?</h1>
          
          <div className="flex flex-wrap justify-center gap-6 max-w-5xl px-4">
            {profiles.map(p => (
              <div key={p.id} className="flex flex-col items-center gap-4 group cursor-pointer" onClick={() => {
                setActiveProfile(p);
                localStorage.setItem("music_active_profile", JSON.stringify(p));
                saveActiveProfileServer(p);
              }}>
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-6xl shadow-xl group-hover:scale-105 group-hover:ring-4 ring-white transition-all duration-300 relative overflow-hidden`}>
                  <span className="relative z-10">{p.emoji}</span>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to completely delete the profile "${p.name}"? This will permanently delete all of their playlists too!`)) {
                        const newProfiles = profiles.filter(prof => prof.id !== p.id);
                        saveProfiles(newProfiles);
                        localStorage.removeItem(`frans_hals_playlists_${p.id}`); // Clean up their private playlists
                        deletePlaylistsServer(p.id); // Clean up from Redis too
                      }
                    }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-400 group-hover:text-white text-xl font-bold transition-colors">{p.name}</span>
              </div>
            ))}
            
            {profiles.length < 10 && (
              <div 
                className="flex flex-col items-center gap-4 group cursor-pointer"
                onClick={() => {
                  const otp = prompt("SECURITY CHECK: To create a new profile, please enter the Admin OTP sent to 7972143404.");
                  if (otp !== "2525") {
                    if (otp !== null) alert("Incorrect OTP! Profile creation blocked.");
                    return;
                  }
                  
                  const name = prompt("OTP Verified! Enter new profile name:");
                  if (name) {
                    const colors = [
                      "from-red-500 to-orange-500", "from-green-400 to-emerald-600", "from-pink-500 to-rose-500", 
                      "from-blue-400 to-indigo-600", "from-yellow-400 to-orange-500", "from-purple-500 to-fuchsia-600",
                      "from-teal-400 to-cyan-600", "from-rose-400 to-red-500"
                    ];
                    const emojis = ["🎸", "🥁", "🎹", "🎤", "🎷", "🎺", "🎧", "🎵", "👾", "🦊", "🐯", "🐼", "😎", "🚀", "🌟"];
                    const newP = { 
                      id: Date.now().toString(), 
                      name, 
                      color: colors[Math.floor(Math.random() * colors.length)],
                      emoji: emojis[Math.floor(Math.random() * emojis.length)]
                    };
                    saveProfiles([...profiles, newP]);
                  }
                }}
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl border-2 border-gray-600 flex items-center justify-center text-6xl text-gray-600 group-hover:border-white group-hover:text-white group-hover:scale-105 transition-all duration-300">
                  +
                </div>
                <span className="text-gray-400 group-hover:text-white text-xl font-bold transition-colors">Add Profile</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row-reverse bg-[#F4EFEA] text-[#024230] font-sans selection:bg-[#FF3366] selection:text-[#F4EFEA]">
      {playlistMenu && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setPlaylistMenu(null)} />
          <div 
            className="fixed z-[101] bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] p-3 flex flex-col gap-2 min-w-[180px] origin-top"
            style={{ 
              top: Math.min(playlistMenu.y, (typeof window !== 'undefined' ? window.innerHeight : 800) - (playlists.length * 40 + 50)), 
              left: Math.max(10, playlistMenu.x - 180) 
            }}
          >
            <div className="text-[10px] font-black uppercase text-white/50 px-2 pb-1 border-b border-white/10 tracking-widest">Add to Playlist</div>
            {playlists.map(p => {
              const hasSong = p.songs.some(s => s.id === playlistMenu.song.id);
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    const newPlaylists = playlists.map(pl => {
                      if (pl.id === p.id) {
                        return { ...pl, songs: hasSong ? pl.songs.filter(s => s.id !== playlistMenu.song.id) : [...pl.songs, playlistMenu.song] };
                      }
                      return pl;
                    });
                    savePlaylists(newPlaylists);
                    setPlaylistMenu(null);
                  }}
                  className="flex items-center justify-between px-3 py-2 text-white hover:bg-white/10 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                >
                  <span className="truncate pr-4">{p.name}</span>
                  {hasSong ? <Heart className="w-4 h-4 shrink-0 fill-[#FF3366] text-[#FF3366]" /> : <Heart className="w-4 h-4 shrink-0 text-white/30" />}
                </button>
              );
            })}
          </div>
        </>
      )}


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
      {/* Native audio element for background/lock-screen playback */}
      <audio ref={audioRef} playsInline preload="auto" style={{display:"none"}} />

      {/* LEFT COLUMN - SEARCH & UI */}
      <div id="left-column" className="hidden md:flex w-full md:w-[50%] lg:w-[40%] flex-col border-t-4 md:border-t-0 md:border-l-4 border-[#024230] relative z-20 bg-[#111] text-white overflow-visible drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-30 pointer-events-none bg-[length:200%_200%] animate-[gradientMove_15s_linear_infinite]" />
  <style jsx>{`
    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `}</style>
        {(!currentSong && !hasSearched) ? (
          <div className="absolute inset-0 z-0 bg-black pointer-events-none" />
        ) : currentSong ? (
          <div className="absolute inset-0 w-full h-full z-0 bg-black overflow-hidden">
            <img 
              src={artistBg || currentSong.image} 
              className="absolute inset-0 w-full h-full object-cover opacity-100 transition-all duration-1000" 
              alt="Artist Background"
            />
          </div>
        ) : null}
        <div className="relative z-10 w-full h-full flex flex-col justify-start overflow-y-auto p-6 md:p-12 scroll-smooth">
          <header className="mb-6">
          <div className="flex justify-between items-center border-b-4 border-white/30 pb-4">
            <h1 
              onClick={() => { setHasSearched(false); setShowPlaylist(false); setArtistQuery(""); setSongQuery(""); setSearchResults([]); }}
              className={`text-2xl font-black uppercase tracking-[0.2em] leading-none cursor-pointer transition-colors ${isLightBg ? 'text-black drop-shadow-md hover:text-[#FF3366]' : 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] hover:text-[#FF3366]'}`}
            >
              LISTEN WITH {activeProfile.name}
            </h1>
            <button 
              onClick={() => {
                setActiveProfile(null);
                localStorage.removeItem("music_active_profile");
              }}
              className={`w-10 h-10 rounded-md bg-gradient-to-br ${activeProfile.color} flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform flex-shrink-0 border-2 border-white/20`}
              title="Switch Profile"
            >
              {activeProfile.emoji}
            </button>
          </div>
        </header>

        <div 
          className={`flex flex-col justify-start gap-2 mt-2 transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isInactive ? 'max-h-0 opacity-0 mb-0 pointer-events-none overflow-hidden' : 'max-h-[800px] opacity-100 mb-4 overflow-visible'}`}
        >
              <div className="flex flex-col gap-2 w-full relative z-[60] search-container">
            
            {/* Artist Box */}
            <div className="flex items-start gap-2 px-1 mb-1 text-white/40">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              <p className="text-[9px] font-bold uppercase tracking-widest leading-tight">
                Disclaimer: Exact spelling is required. Incorrect spelling sometimes may lead to no results.
              </p>
            </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (artistQuery.trim()) { setArtistSuggestions([]); executeFullSearch(artistQuery, "artist"); }
          }}
          className="relative w-full group"
        >
          <div className="border-2 border-white/40 bg-black/50 backdrop-blur-xl shadow-[2px_2px_0_0_rgba(255,255,255,0.3)] group-focus-within:translate-y-px group-focus-within:translate-x-px group-focus-within:shadow-[0px_0px_0_0_#024230] transition-all duration-200">
            <div className="bg-black/50 text-white px-2 py-0.5 inline-block text-[10px] font-black uppercase tracking-widest border-r-2 border-b-2 border-white/40 backdrop-blur-xl">Artist</div>
            <input
              type="text"
              placeholder="Who are you looking for?"
              value={artistQuery}
              onChange={(e) => setArtistQuery(e.target.value)}
              className="w-full bg-transparent text-base font-bold px-3 py-1 outline-none placeholder:text-white/70 text-white"
            />
          </div>
          <AnimatePresence>
            {artistSuggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="md:absolute md:top-full md:left-0 w-full mt-2 md:mt-4 bg-black/50 backdrop-blur-xl border-2 border-white/30 shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] z-50 flex flex-col divide-y-2 divide-white/20"
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
              <div className="border-2 border-white/40 bg-black/50 backdrop-blur-xl shadow-[2px_2px_0_0_rgba(255,255,255,0.3)] group-focus-within:translate-y-px group-focus-within:translate-x-px group-focus-within:shadow-[0px_0px_0_0_#024230] transition-all duration-200">
                <div className="bg-black/50 text-white px-2 py-0.5 inline-block text-[10px] font-black uppercase tracking-widest border-r-2 border-b-2 border-white/40 backdrop-blur-xl">
                  Track
                </div>
                <input
                  type="text"
                  placeholder="What is the song name?"
                  value={songQuery}
                  onChange={(e) => setSongQuery(e.target.value)}
                  className="w-full bg-transparent text-base font-bold px-3 py-1 outline-none placeholder:text-white/70 text-white"
                />
              </div>

              <AnimatePresence>
                {songSuggestions.length > 0 && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="md:absolute md:top-full md:left-0 w-full mt-2 md:mt-4 bg-black/50 backdrop-blur-xl border-2 border-white/30 shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] z-50 flex flex-col divide-y-2 divide-white/20"
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
              key={currentSong.id}
              initial={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.8 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 48, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.5, filter: "blur(10px)" }}
              transition={{ type: "spring", damping: 15, stiffness: 120, mass: 0.6 }}
              className="w-full flex flex-col gap-4 overflow-visible origin-center relative z-50"
            >
               <div className={`border-2 border-white/40 bg-black/50 backdrop-blur-xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex flex-col gap-4 hover:scale-[1.02] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.6)] transition-all duration-300 relative text-white rounded-2xl`}>
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
                       <span className="text-xs font-bold tracking-widest uppercase opacity-90 truncate text-white">{currentSong.artist}</span>
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
                        <Heart className={`w-4 h-4 transition-colors ${playlists.some(p => p.songs.some(s => s.id === currentSong?.id)) ? 'fill-[#FF3366] text-[#FF3366]' : 'text-white group-hover/fav:text-[#FF3366]'}`} />
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

                      <div className="flex items-center justify-between px-4 py-2 border-t-2 border-[#333]">
  <h2 className="text-lg font-bold text-white">Lyrics</h2>
  <button
    onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
    className="p-1 text-white hover:text-[#FF3366] transition-colors"
    title="Toggle Lyrics Height"
  >
    {isLyricsExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
  </button>
</div>
                    </div>
                 </div>


                 {/* LYRICS BOX */}
                 <div 
                   ref={lyricsContainerRef}
                   onWheel={handleUserInteraction}
                   onTouchMove={handleUserInteraction}
                   onMouseDown={handleUserInteraction}
                   className={`mt-4 border-t-2 border-[#333] pt-4 overflow-y-auto overflow-x-hidden relative scrollbar-hide scroll-smooth transition-all duration-500 ${isLyricsExpanded ? 'bg-black/40 backdrop-blur-sm -mx-6 px-6 rounded-3xl' : 'bg-transparent'}`} 
                   style={{ height: isLyricsExpanded ? '70vh' : '180px' }}
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
                                  opacity: isActive ? 1 : isPast ? (isLyricsExpanded ? 0.8 : 0.5) : (isLyricsExpanded ? 0.9 : 0.7), 
                                  scale: isActive ? 1.05 : 0.95,
                                  x: isActive ? 20 : 0,
                                  letterSpacing: isActive ? '0.05em' : '-0.05em'
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                                className="cursor-pointer font-black uppercase origin-left transition-colors hover:opacity-100 flex flex-wrap text-xl md:text-3xl mb-4"
                              >
                                {line.words ? line.words.map((w, wIdx) => {
                                  const isWordActive = isActive && progress >= w.time;
                                  return (
                                    <span 
                                      key={wIdx} 
                                      className="inline-block mr-2 md:mr-3 transition-all duration-150"
                                      style={{
                                        color: isWordActive ? '#FF3366' : (isActive ? '#fff' : (isLyricsExpanded ? '#ccc' : '#999')),
                                        textShadow: isLyricsExpanded 
                                          ? (isWordActive ? '2px 2px 0px #000, 0 0 10px rgba(0,0,0,0.8)' : '1px 1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)') 
                                          : (isWordActive ? '2px 2px 0px #000' : '0px 0px 0px transparent'),
                                        transform: isWordActive ? 'scale(1.05) translateY(-2px)' : 'scale(1) translateY(0px)'
                                      }}
                                    >
                                      {w.text}
                                    </span>
                                  )
                                }) : (
                                  <span 
                                    style={{ 
                                      color: isActive ? '#FF3366' : (isLyricsExpanded ? '#ccc' : '#999'),
                                      textShadow: isLyricsExpanded ? '1px 1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)' : 'none'
                                    }}
                                  >
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
            <div className="border-2 border-white/40 bg-black/50 backdrop-blur-xl shadow-[2px_2px_0_0_rgba(255,255,255,0.3)] p-3 mb-2 flex items-center justify-center">
              <h3 className="text-xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">Playlists</h3>
            </div>
            {playlists.map(p => (
              <button 
                key={p.id}
                onClick={() => { setActivePlaylistId(p.id); setShowPlaylist(true); setHasSearched(false); setIsEditingPlaylist(false); }}
                className={`w-full border-2 border-white/40 p-4 text-2xl font-black uppercase tracking-tighter transition-all flex justify-between items-center ${showPlaylist && activePlaylistId === p.id ? 'bg-[#FF3366] text-[#F4EFEA] shadow-none translate-y-1 translate-x-1' : 'bg-black/50 backdrop-blur-xl text-white shadow-[6px_6px_0_0_rgba(255,255,255,0.2)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_0_rgba(255,255,255,0.2)]'}`}
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
              className="w-full border-4 border-white/40 border-dashed p-4 text-xl font-black uppercase tracking-tighter bg-black/50 backdrop-blur-xl text-white hover:bg-white hover:text-black transition-colors"
            >
              + New Playlist
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* RIGHT COLUMN - RESULTS & PLAYER */}
      <div className="hidden md:flex w-full md:w-[50%] lg:w-[60%] relative bg-gradient-to-br from-[#1a1a1a] via-[#050505] to-black shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] text-[#F4EFEA] overflow-hidden flex-col min-h-[50vh] md:min-h-screen">
        


        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div 
            className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[#FF3366]/40 blur-[100px]"
            animate={{ y: [0, -120, 50, 0], x: [0, 50, -50, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-[30%] -right-[10%] w-[600px] h-[600px] rounded-full bg-purple-600/30 blur-[120px]"
            animate={{ y: [0, -120, 50, 0], x: [0, 50, -50, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
          />
          <motion.div 
            className="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] rounded-full bg-indigo-500/30 blur-[100px]"
            animate={{ y: [0, -120, 50, 0], x: [0, 50, -50, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        {/* Content Area */}
        <div 
          className={`relative z-10 flex-1 p-6 md:p-12 overflow-y-auto scroll-smooth will-change-transform transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isInactive ? '-translate-y-16 scale-[1.02]' : 'translate-y-0 scale-100'}`}
        >
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
                      onClick={() => setIsShuffleOn(!isShuffleOn)}
                      className={`px-3 py-2 border-2 transition-colors uppercase font-bold text-sm ${isShuffleOn ? 'border-[#FF3366] bg-[#FF3366] text-[#F4EFEA]' : 'border-transparent hover:border-[#FF3366]'}`}
                    >Shuffle: {isShuffleOn ? 'ON' : 'OFF'}</button>
                    <button 
                      onClick={() => setIsEditingPlaylist(!isEditingPlaylist)}
                      className={`px-3 py-2 border-2 transition-colors uppercase font-bold text-sm ${isEditingPlaylist ? 'border-[#FF3366] bg-[#FF3366] text-[#F4EFEA]' : 'border-transparent hover:border-[#FF3366]'}`}
                    >{isEditingPlaylist ? 'Done' : 'Edit'}</button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete the playlist "${activePlaylist.name}"?`)) {
                          savePlaylists(playlists.filter(p => p.id !== activePlaylistId));
                          setShowPlaylist(false);
                          setActivePlaylistId('default');
                        }
                      }}
                      className="px-3 py-2 border-2 border-transparent hover:border-red-500 hover:text-red-500 transition-colors uppercase font-bold text-sm"
                    >Delete</button>
                  </div>
                </div>
              </div>
              
              {activePlaylist.songs.length === 0 ? (
                <p className="text-2xl font-bold uppercase opacity-50">This playlist is empty. Add songs by clicking the heart icon!</p>
              ) : (
                <div className="flex flex-col bg-black/50 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
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

              <div className="mt-8 flex flex-col gap-4 mb-24">
                <button 
                  onClick={() => setShowInlineSearch(!showInlineSearch)}
                  className="flex items-center gap-2 self-start hover:text-[#FF3366] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-[#FF3366] text-white flex items-center justify-center transition-colors">
                    <span className="text-xl font-bold mb-1">+</span>
                  </div>
                  <span className="text-lg font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] text-white group-hover:text-[#FF3366]">Add more songs</span>
                </button>
                
                <AnimatePresence>
                  {showInlineSearch && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-4 overflow-hidden"
                    >
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!inlineSearchQuery.trim()) return;
                          setIsInlineSearching(true);
                          const results = await searchYouTube(inlineSearchQuery, "any");
                          setInlineSearchResults(results);
                          setIsInlineSearching(false);
                        }}
                        className="w-full mt-2 group"
                      >
                        <div className="border-2 border-white/40 bg-black/50 backdrop-blur-xl shadow-[2px_2px_0_0_rgba(255,255,255,0.3)] group-focus-within:translate-y-px group-focus-within:translate-x-px group-focus-within:shadow-[0px_0px_0_0_#024230] transition-all duration-200">
                           <div className="bg-black/50 text-white px-2 py-0.5 inline-block text-[10px] font-black uppercase tracking-widest border-r-2 border-b-2 border-white/40 backdrop-blur-xl">Search</div>
                           <input
                             type="text"
                             autoFocus
                             placeholder="Search for songs to add..."
                             value={inlineSearchQuery}
                             onChange={(e) => setInlineSearchQuery(e.target.value)}
                             className="w-full bg-transparent text-base font-bold px-3 py-2 outline-none placeholder:text-white/50 text-white"
                           />
                        </div>
                        <button type="submit" className="hidden">Submit</button>
                      </form>

                      {isInlineSearching && (
                        <div className="flex justify-center py-4">
                          <Loader2 className="w-8 h-8 animate-spin opacity-50" />
                        </div>
                      )}

                      {inlineSearchResults.length > 0 && !isInlineSearching && (
                        <div className="flex flex-col bg-black/50 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
                          <div className="flex flex-col divide-y divide-white/10 p-2">
                            {inlineSearchResults.map((song, i) => {
                              const alreadyInPlaylist = activePlaylist.songs.some(s => s.id === song.id);
                              return (
                                <div className="flex items-center group/box transition-all duration-200" key={song.id}>
                                  <div className="flex-1 pointer-events-auto">
                                    <SongBox 
                                      song={song} 
                                      index={i} 
                                      onPlay={(e) => playSong(song, true, "radio", undefined, e)} 
                                      isFavorite={playlists.some(p => p.songs.some(s => s.id === song.id))} 
                                      onToggleFavorite={(e) => togglePlaylistSong(song, e)} 
                                    />
                                  </div>
                                  <button 
                                    onClick={() => {
                                      if (alreadyInPlaylist) return;
                                      savePlaylists(playlists.map(p => p.id === activePlaylistId ? { ...p, songs: [...p.songs, song] } : p));
                                    }}
                                    className={`shrink-0 mx-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${alreadyInPlaylist ? 'bg-[#FF3366]/20 text-[#FF3366] cursor-not-allowed' : 'bg-white/20 hover:bg-[#FF3366] text-white hover:scale-110 shadow-md'}`}
                                  >
                                    <span className="text-xl font-bold mb-1">{alreadyInPlaylist ? '✓' : '+'}</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
            );
          })() : !hasSearched ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-12 w-full max-w-[1400px] mx-auto pb-32">
              
              {/* Worldwide Section */}
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between border-b-4 border-[#F4EFEA] pb-4 overflow-hidden">
                  <motion.h3 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                    className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-xl"
                  >
                    Trending Worldwide
                  </motion.h3>
                </div>
                
                {trendingWorldwide.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin opacity-50" />
                  </div>
                ) : (
                  <div className="flex flex-col bg-black/50 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
                    <div className="flex flex-col divide-y divide-white/10 p-2">
                      {trendingWorldwide.map((song, index) => (
                      <SongBox 
                        key={song.id} 
                        song={song} 
                        index={index} 
                        onPlay={() => playSong(song)} 
                        isFavorite={playlists.some(p => p.songs.some(s => s.id === song.id))} 
                        onToggleFavorite={(e) => togglePlaylistSong(song, e)} 
                      />
                    ))}
                    </div>
                  </div>
                )}
              </div>

              {/* India Section */}
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between border-b-4 border-[#F4EFEA] pb-4 overflow-hidden">
                  <motion.h3 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-xl"
                  >
                    Trending in India
                  </motion.h3>
                </div>
                
                {trendingIndia.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin opacity-50" />
                  </div>
                ) : (
                  <div className="flex flex-col bg-black/50 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
                    <div className="flex flex-col divide-y divide-white/10 p-2">
                      {trendingIndia.map((song, index) => (
                      <SongBox 
                        key={song.id} 
                        song={song} 
                        index={index} 
                        onPlay={() => playSong(song)} 
                        isFavorite={playlists.some(p => p.songs.some(s => s.id === song.id))} 
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
                <div className="flex flex-col bg-black/50 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
                  <div className="flex flex-col divide-y divide-white/10 p-2">
                    {searchResults.map((song, index) => (
                      <SongBox 
                        key={song.id} 
                        song={song} 
                        index={index} 
                        onPlay={(e) => playSong(song, true, "radio", undefined, e)}
                        isFavorite={playlists.some(p => p.songs.some(s => s.id === song.id))} 
                        onToggleFavorite={(e) => togglePlaylistSong(song, e)} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="w-full flex justify-center pt-12 pb-24 mt-auto opacity-30 hover:opacity-100 transition-opacity">
            <span className="text-xs font-black tracking-[0.4em] uppercase text-white drop-shadow-md">
              Developed by Sarthak Avhad
            </span>
          </div>
        </div>


      </div>

      {/* MOBILE VIEW (Apple Music Style) */}
      <div className="flex md:hidden w-full h-[100dvh] flex-col bg-black text-white relative overflow-hidden">
        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto pb-32 px-4 scrollbar-hide pt-12">
          {mobileTab === "home" && (
            <div className="flex flex-col gap-8">
              <h1 className="text-3xl font-bold tracking-tight">Listen Now</h1>
              
              {/* Trending Worldwide */}
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Trending Worldwide</h2>
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                  {trendingWorldwide.length === 0 ? (
                     <div className="flex justify-center py-8 w-full"><Loader2 className="w-8 h-8 animate-spin text-[#FC3C44]" /></div>
                  ) : trendingWorldwide.map(song => (
                    <div key={song.id} className="min-w-[150px] max-w-[150px] flex flex-col gap-2 snap-start" onClick={() => playSong(song)}>
                      <img src={song.image} className="w-[150px] h-[150px] rounded-xl object-cover shadow-sm" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold truncate">{song.title}</span>
                        <span className="text-xs text-white/60 truncate">{song.artist}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending India */}
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Trending in India</h2>
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                  {trendingIndia.length === 0 ? (
                     <div className="flex justify-center py-8 w-full"><Loader2 className="w-8 h-8 animate-spin text-[#FC3C44]" /></div>
                  ) : trendingIndia.map(song => (
                    <div key={song.id} className="min-w-[150px] max-w-[150px] flex flex-col gap-2 snap-start" onClick={() => playSong(song)}>
                      <img src={song.image} className="w-[150px] h-[150px] rounded-xl object-cover shadow-sm" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold truncate">{song.title}</span>
                        <span className="text-xs text-white/60 truncate">{song.artist}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mobileTab === "search" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-bold tracking-tight">Search</h1>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                <input 
                  type="text" 
                  placeholder="Artists, Songs, Lyrics" 
                  value={songQuery}
                  onChange={(e) => {
                    setSongQuery(e.target.value);
                    setHasSearched(false);
                    if (e.target.value.trim().length > 1) {
                       getSearchSuggestions(e.target.value).then(setSongSuggestions);
                    } else {
                       setSongSuggestions([]);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const executeFullSearch = async () => {
                        if (!songQuery.trim()) return;
                        setIsSearching(true);
                        setHasSearched(true);
                        setSongSuggestions([]);
                        try {
                          const results = await searchYouTube(songQuery, "any");
                          setSearchResults(results);
                        } finally {
                          setIsSearching(false);
                        }
                      };
                      executeFullSearch();
                    }
                  }}
                  className="w-full bg-[#1C1C1E] rounded-xl py-3 pl-10 pr-4 text-base font-semibold outline-none focus:bg-[#2C2C2E] transition-colors"
                />
                {songSuggestions.length > 0 && !hasSearched && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#2C2C2E]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl max-h-[40vh] overflow-y-auto">
                    {songSuggestions.map((s, i) => (
                      <div 
                        key={i} 
                        className="px-4 py-3 flex items-center gap-3 border-b border-white/5 last:border-none active:bg-white/10"
                        onClick={() => {
                          setSongQuery(s);
                          setSongSuggestions([]);
                          setHasSearched(true);
                          setIsSearching(true);
                          searchYouTube(s, "any").then(res => {
                            setSearchResults(res);
                            setIsSearching(false);
                          });
                        }}
                      >
                        <Search className="w-4 h-4 text-white/50" />
                        <span className="text-sm font-medium">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {isSearching ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#FC3C44]" /></div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-2 mt-4">
                  <h2 className="text-xl font-bold mb-2">Results</h2>
                  {searchResults.map((song, i) => (
                    <div key={song.id} className="flex items-center gap-3 active:bg-white/10 p-2 rounded-lg" onClick={(e) => playSong(song, true, "radio", undefined, e)}>
                      <img src={song.image} className="w-12 h-12 rounded-md object-cover" />
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-base font-semibold truncate">{song.title}</span>
                        <span className="text-sm text-white/50 truncate">{song.artist}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); togglePlaylistSong(song, e); }} className="p-2">
                        <Heart className={`w-5 h-5 ${playlists.some(p => p.songs.some(s => s.id === song.id)) ? 'fill-[#FC3C44] text-[#FC3C44]' : 'text-white/50'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {mobileTab === "library" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-bold tracking-tight">Library</h1>
              <div className="flex flex-col bg-[#1C1C1E] rounded-xl overflow-hidden">
                {playlists.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 border-b border-white/5 active:bg-white/10" onClick={() => { setActivePlaylistId(p.id); setShowPlaylist(true); }}>
                    <ListMusic className="w-6 h-6 text-[#FC3C44]" />
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold">{p.name}</span>
                      <span className="text-xs text-white/50">{p.songs.length} songs</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {showPlaylist && playlists.find(p => p.id === activePlaylistId) && (
                <div className="flex flex-col gap-2 mt-4">
                  <h2 className="text-xl font-bold mb-2">{playlists.find(p => p.id === activePlaylistId)?.name}</h2>
                  {playlists.find(p => p.id === activePlaylistId)?.songs.map((song, i) => (
                    <div key={song.id} className="flex items-center gap-3 active:bg-white/10 p-2 rounded-lg" onClick={(e) => playSong(song, true, "playlist", undefined, e)}>
                      <img src={song.image} className="w-12 h-12 rounded-md object-cover" />
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-base font-semibold truncate">{song.title}</span>
                        <span className="text-sm text-white/50 truncate">{song.artist}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mini Player */}
        {currentSong && (
          <div className="absolute bottom-[88px] left-2 right-2 bg-[#2C2C2E]/90 backdrop-blur-2xl rounded-xl p-2 flex items-center gap-3 shadow-lg z-40 border border-white/5" onClick={() => setShowMobilePlayer(true)}>
            <img src={currentSong.image} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-semibold truncate">{currentSong.title}</span>
              <span className="text-xs text-white/60 truncate">{currentSong.artist}</span>
            </div>
            <div className="flex items-center gap-4 pr-2" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => togglePlay()}>
                {isPlaying ? <Pause className="w-6 h-6 fill-white text-white" /> : <Play className="w-6 h-6 fill-white text-white" />}
              </button>
              <button onClick={() => playNextSong()}>
                <SkipForward className="w-6 h-6 fill-white text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Tab Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[84px] bg-[#1C1C1E]/80 backdrop-blur-3xl border-t border-white/10 flex justify-around items-start pt-3 pb-8 z-30">
          <button onClick={() => setMobileTab("home")} className={`flex flex-col items-center gap-1 w-20 ${mobileTab === "home" ? "text-[#FC3C44]" : "text-white/50"}`}>
            <Home className={`w-6 h-6 ${mobileTab === "home" ? "fill-[#FC3C44]" : ""}`} />
            <span className="text-[10px] font-medium">Listen Now</span>
          </button>
          <button onClick={() => setMobileTab("search")} className={`flex flex-col items-center gap-1 w-20 ${mobileTab === "search" ? "text-[#FC3C44]" : "text-white/50"}`}>
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-medium">Search</span>
          </button>
          <button onClick={() => setMobileTab("library")} className={`flex flex-col items-center gap-1 w-20 ${mobileTab === "library" ? "text-[#FC3C44]" : "text-white/50"}`}>
            <ListMusic className={`w-6 h-6 ${mobileTab === "library" ? "fill-[#FC3C44]" : ""}`} />
            <span className="text-[10px] font-medium">Library</span>
          </button>
        </div>

        {/* Full Screen Player Modal */}
        <AnimatePresence>
          {showMobilePlayer && currentSong && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden"
            >
              {/* Animated Blurred Background matching current song */}
              <div className="absolute inset-0 z-0">
                <img src={currentSong.image} className="w-full h-full object-cover opacity-60 blur-3xl scale-125 saturate-150" />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-3xl" />
              </div>
              
              <div className="relative z-10 flex flex-col h-full px-6 pt-4 pb-12">
                <div className="flex justify-center mb-6">
                  <div className="w-10 h-1.5 bg-white/30 rounded-full cursor-pointer" onClick={() => setShowMobilePlayer(false)} />
                </div>
                
                <div className="w-full aspect-square rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] mb-8 mt-2 transition-transform duration-500 ease-out">
                  <img src={currentSong.image} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex justify-between items-end mb-6">
                  <div className="flex flex-col flex-1 overflow-hidden pr-4">
                    <span className="text-2xl font-bold truncate text-white">{currentSong.title}</span>
                    <span className="text-lg text-white/70 truncate">{currentSong.artist}</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <button onClick={(e) => togglePlaylistSong(currentSong, e)}>
                       <Heart className={`w-7 h-7 ${playlists.some(p => p.songs.some(s => s.id === currentSong.id)) ? 'fill-[#FC3C44] text-[#FC3C44]' : 'text-white'}`} />
                     </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="flex flex-col gap-2 mb-8 mt-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.01"
                    value={progress || 0}
                    onChange={(e) => {
                      if (!currentSong || duration === 0) return;
                      const newProgress = parseFloat(e.target.value);
                      setProgress(newProgress);
                      const newTime = (newProgress / 100) * duration;
                      const player = (window as any).ytPlayer as YouTubePlayer;
                      if (player && typeof player.seekTo === 'function') {
                        player.seekTo(newTime, true);
                      }
                    }}
                    className="w-full h-1.5 rounded-full appearance-none outline-none bg-white/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    style={{
                      background: `linear-gradient(to right, rgba(255,255,255,0.8) ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-white/50 font-medium">
                    <span>{Math.floor((progress / 100 * duration) / 60)}:{(Math.floor(progress / 100 * duration) % 60).toString().padStart(2, '0')}</span>
                    <span>-{Math.floor((duration - (progress / 100 * duration)) / 60)}:{(Math.floor(duration - (progress / 100 * duration)) % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex justify-between items-center px-2 mb-8">
                  <button className="text-white/50"><ListMusic className="w-5 h-5" /></button>
                  <div className="flex items-center gap-8">
                    <button onClick={() => playPreviousSong()}><SkipBack className="w-10 h-10 fill-white text-white" /></button>
                    <button onClick={() => togglePlay()}>
                      {isPlaying ? <Pause className="w-14 h-14 fill-white text-white" /> : <Play className="w-14 h-14 fill-white text-white ml-2" />}
                    </button>
                    <button onClick={() => playNextSong()}><SkipForward className="w-10 h-10 fill-white text-white" /></button>
                  </div>
                  <button onClick={() => setIsLyricsExpanded(!isLyricsExpanded)} className={isLyricsExpanded ? 'text-[#FC3C44]' : 'text-white/50'}>
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Volume slider mock */}
                <div className="flex items-center gap-3 w-full px-2">
                  <Minimize2 className="w-3 h-3 text-white/50" />
                  <div className="flex-1 h-1 bg-white/20 rounded-full">
                    <div className="h-full w-2/3 bg-white/80 rounded-full" />
                  </div>
                  <Maximize2 className="w-4 h-4 text-white/50" />
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
