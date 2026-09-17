"use client";

import { useState, useRef, useEffect } from "react";
import { NeonBackground } from "./NeonBackground";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Play, Pause, Search, Loader2, ArrowRight, SkipBack, SkipForward, Heart, GripVertical, Headphones, Maximize2, Minimize2, Trash2, Info, Home, Library, Compass, ChevronDown, MoreHorizontal, ListMusic, Quote, Check, Plus , Shuffle, Repeat, Volume2, Volume1, VolumeX, Share, Power, ArrowDownToLine, CheckCircle2, XCircle, WifiOff } from "lucide-react";
import { saveDownload, getDownload, removeDownload, getAllDownloads, type DownloadedSong } from "./offlineDb";
import YouTube, { YouTubePlayer } from "react-youtube";
import { searchYouTube, getArtistBackground, getSearchSuggestions, getSyncedLyrics, getTrendingWorldwide, getTrendingIndia, getRelatedSongs, getAlternativeSourceId } from "./actions";
import type { SyncedLyric } from "./actions";
import { loadProfiles, saveProfilesServer, loadActiveProfile, saveActiveProfileServer, loadPlaylistsServer, savePlaylistsServer, deletePlaylistsServer } from "./storage";
import { Onboarding } from "./Onboarding";
import { ProfileSelector } from "./ProfileSelector";

type Profile = {
  id: string;
  name: string;
  color: string;
  emoji: string;
  avatar?: string;
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


const SongBox = ({ song, index, onPlay, isFavorite, onToggleFavorite, onOpenMenu, isDownloaded, downloadProgress, onDownload, onRemoveDownload }: { song: Song, index: number, onPlay: (e: React.MouseEvent) => void, isFavorite: boolean, onToggleFavorite: (e: React.MouseEvent) => void, onOpenMenu?: (e: React.MouseEvent) => void, isDownloaded?: boolean, downloadProgress?: number | 'indeterminate', onDownload?: (e: React.MouseEvent) => void, onRemoveDownload?: (e: React.MouseEvent) => void }) => (
  <div 
    onClick={(e) => onPlay(e)}
    className="flex items-center px-3 py-2.5 hover:bg-white/10 rounded-xl cursor-pointer group gap-4 transition-all duration-200 w-full"
  >
    {/* Index / Play toggle */}
    <div className="w-6 flex justify-center items-center text-gray-500 shrink-0 text-sm">
      <span className="group-hover:hidden">{index + 1}</span>
      <Play className="w-3.5 h-3.5 fill-white hidden group-hover:block" />
    </div>

    {/* Album Art Poster */}
    <div className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <img
        src={song.image}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        alt={song.title}
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <Play className="w-4 h-4 fill-white" />
      </div>
    </div>

    {/* Title & Artist */}
    <div className="flex flex-col flex-1 overflow-hidden min-w-0">
      <span className="text-white text-sm font-semibold truncate leading-tight">
        {song.title}
      </span>
      <span className="text-gray-400 text-xs truncate mt-0.5 group-hover:text-white transition-colors duration-200">
        {song.artist}
      </span>
    </div>

    {/* Download Button */}
    {onDownload && (
      <button 
        onClick={(e) => { e.stopPropagation(); isDownloaded ? (onRemoveDownload && onRemoveDownload(e)) : (downloadProgress === undefined ? onDownload(e) : null); }}
        className="p-2 shrink-0 transition-all duration-200 hover:scale-110 opacity-100 md:opacity-0 md:group-hover:opacity-100"
        aria-label="Download"
      >
        {isDownloaded ? (
          <CheckCircle2 className="w-4 h-4 text-[#D4FF00]" />
        ) : downloadProgress !== undefined ? (
          <div className="relative flex items-center justify-center w-4 h-4">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            {typeof downloadProgress === 'number' && <span className="absolute text-[7px] font-bold text-white leading-none">{downloadProgress}</span>}
          </div>
        ) : (
          <ArrowDownToLine className="w-4 h-4 text-gray-400 hover:text-white" />
        )}
      </button>
    )}

    {/* Favorite */}
    <button 
      onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}
      className={`p-2 shrink-0 transition-all duration-200 hover:scale-110 ${isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
    >
      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#1ED760] text-[#1ED760]' : 'text-gray-400 hover:text-white'}`} />
    </button>
    
    {/* More Menu */}
    {onOpenMenu && (
      <button 
        onClick={(e) => { e.stopPropagation(); onOpenMenu(e); }}
        className="p-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-white" />
      </button>
    )}
  </div>
);

export default function FransHalsMusicApp() {
  const dragControls = useDragControls();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<SyncedLyric[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  
  const [isScreenOff, setIsScreenOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScreenOffText, setShowScreenOffText] = useState(false);
  const [showFullscreenError, setShowFullscreenError] = useState(false);
  const hasShownErrorRef = useRef(false);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleAppMode = async () => {
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
  };

  const [isClient, setIsClient] = useState(false);
  
  // STEP 11 - Temporary Debug Mode
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const logDebug = (msg: string, audio?: HTMLAudioElement | null) => {
    let audioState = "";
    if (audio) {
      audioState = `\n  paused: ${audio.paused}\n  readyState: ${audio.readyState}\n  networkState: ${audio.networkState}\n  currentSrc: ${audio.currentSrc}\n  src: ${audio.src}\n  error: ${audio.error ? audio.error.message : 'null'}`;
    }
    const fullMsg = `[${new Date().toLocaleTimeString()}] ${msg}${audioState}`;
    console.log(fullMsg);
    setDebugLogs(prev => [...prev, fullMsg]);
  };
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isProfileChecking, setIsProfileChecking] = useState(true);
  const [showProfileCreator, setShowProfileCreator] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("music_active_profile");
    if (saved) {
      try {
        setActiveProfile(JSON.parse(saved));
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 4000);
      } catch (e) {
        console.error("Failed to parse saved profile");
      }
    }
    setIsProfileChecking(false);
  }, []);

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
  const [showDownloads, setShowDownloads] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([ { id: 'default', name: 'My Playlist', songs: [] } ]);
  const [downloads, setDownloads] = useState<DownloadedSong[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number | 'indeterminate'>>({});
  const [downloadErrors, setDownloadErrors] = useState<Record<string, string>>({});
  const [isOffline, setIsOffline] = useState(false);
  const currentObjectUrlRef = useRef<string | null>(null);
  const [activePlaylistId, setActivePlaylistId] = useState<string>('default');
  const [playlistMenu, setPlaylistMenu] = useState<{song: Song, x: number, y: number} | null>(null);
  const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isInactive, setIsInactive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isLightBg, setIsLightBg] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [showInlineSearch, setShowInlineSearch] = useState(false);
  const [inlineSearchQuery, setInlineSearchQuery] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const [inlineSearchResults, setInlineSearchResults] = useState<Song[]>([]);
  const [isInlineSearching, setIsInlineSearching] = useState(false);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [isQueueExpanded, setIsQueueExpanded] = useState(false);
  const [playerTab, setPlayerTab] = useState<"queue" | "lyrics" | "related" | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasHeadphones, setHasHeadphones] = useState(false);

  // Mobile specific state
  const [mobileTab, setMobileTab] = useState<"home" | "discover" | "search" | "library" | "playlistView" | "downloads">("home");
  const [showMobilePlayer, setShowMobilePlayer] = useState(false);
  const [useNativeAudio, setUseNativeAudio] = useState(false);

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

    const ensureLikedSongs = (pls: Playlist[]) => {
      if (!pls.find(p => p.id === 'liked-songs')) {
        return [{ id: 'liked-songs', name: 'Liked Songs', songs: [] }, ...pls];
      }
      return pls;
    };

    if (saved) {
      try {
        const parsed = ensureLikedSongs(JSON.parse(saved));
        setPlaylists(parsed);
        // Also push to Redis to keep it in sync
        savePlaylistsServer(activeProfile.id, parsed);
      } catch (e) {
        setPlaylists(ensureLikedSongs([]));
      }
    } else {
      // No local data — try loading from Redis (cloud backup)
      loadPlaylistsServer(activeProfile.id).then(serverPlaylists => {
        if (serverPlaylists && serverPlaylists.length > 0) {
          const parsed = ensureLikedSongs(serverPlaylists);
          setPlaylists(parsed);
          // Cache in localStorage for faster subsequent loads
          localStorage.setItem(profileKey, JSON.stringify(parsed));
        } else {
          const parsed = ensureLikedSongs([]);
          setPlaylists(parsed);
          localStorage.setItem(profileKey, JSON.stringify(parsed));
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
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    getAllDownloads().then(setDownloads).catch(console.error);
    
    // Auto-enable native audio on mobile to bypass strict iframe autoplay policies
    if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      setUseNativeAudio(true);
    }
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

  const handleShare = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!song) return;
    const url = window.location.origin + '?v=' + song.id;
    if (navigator.share) {
      try {
        await navigator.share({
          title: song.title,
          text: `Check out ${song.title} by ${song.artist}`,
          url: url
        });
      } catch (err) {
        console.log('Share cancelled', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const toggleLike = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    const likedPlaylist = playlists.find(p => p.id === 'liked-songs');
    if (!likedPlaylist) return;
    
    const exists = likedPlaylist.songs.find(s => s.id === song.id) ?? false;
    const newPlaylists = playlists.map(pl => 
      pl.id === 'liked-songs' 
        ? { ...pl, songs: exists ? pl.songs.filter(s => s.id !== song.id) : [...pl.songs, song] } 
        : pl
    );
    savePlaylists(newPlaylists);
  };
  
  const openPlaylistMenu = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaylistMenu({ song, x: e.clientX, y: e.clientY });
  };
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const shouldPlayRef = useRef(false);


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
    // Stop the dummy video if no song is selected yet
    if (!currentSong) {
      playerRef.current.stopVideo();
    }
  };

  const onStateChange = (event: any) => {
    if (useNativeAudio) {
      if (event.data === 1 && !duration && playerRef.current) {
        setDuration(playerRef.current.getDuration());
      }
      return;
    }

    if (event.data === -1) { // unstarted
      setPlaybackState("loading");
    } else if (event.data === 3) { // buffering
      setPlaybackState("buffering");
    } else if (event.data === 1) { // playing
      setIsPlaying(true);
      setPlaybackState("playing");
      setDuration(playerRef.current.getDuration());
      if (progressInterval.current) clearInterval(progressInterval.current);
      progressInterval.current = setInterval(() => {
        if (playerRef.current) {
          setProgress(playerRef.current.getCurrentTime());
        }
      }, 150);
    } else if (event.data === 2) { // paused
      setIsPlaying(false);
      setPlaybackState("paused");
      if (progressInterval.current) clearInterval(progressInterval.current);
    } else if (event.data === 0) { // ended
      setIsPlaying(false);
      setPlaybackState("idle");
      if (progressInterval.current) clearInterval(progressInterval.current);
      playNextSong();
    }
  };

  const onYouTubeError = async (event: any) => {
    logDebug(`YouTube IFrame Error: \${event.data}`);
    // Error 150/101 means embed is blocked by copyright owner. 100 means video removed/private.
    if ((event.data === 150 || event.data === 101 || event.data === 100) && currentSong) {
      logDebug(`Embed blocked (\${event.data}). Resolving alternative source...`);
      setPlaybackState("loading");
      const altId = await getAlternativeSourceId(currentSong.title, currentSong.artist);
      if (altId && playerRef.current) {
        logDebug(`Found alternative ID: \${altId}. Resuming playback...`);
        playerRef.current.loadVideoById(altId);
        playerRef.current.playVideo();
      } else {
        logDebug(`No alternative source found. Playback failed.`);
        setPlaybackState("error");
      }
    } else {
      setPlaybackState("error");
    }
  };

  const handleDownload = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloads.some(d => d.id === song.id)) return;
    if (downloadProgress[song.id] !== undefined) return;

    setDownloadProgress(prev => ({ ...prev, [song.id]: 'indeterminate' }));
    setDownloadErrors(prev => { const n = {...prev}; delete n[song.id]; return n; });

    try {
      let targetId = song.id;
      let res = await fetch(`/api/download?v=${song.id}`, { method: 'GET' });
      
      if (!res.ok) {
        const altId = await getAlternativeSourceId(song.title, song.artist);
        if (altId) {
          targetId = altId;
          res = await fetch(`/api/download?v=${targetId}`, { method: 'GET' });
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
      console.warn("Download error:", err.message || err);
      setDownloadErrors(prev => ({ ...prev, [song.id]: "Failed" }));
      setDownloadProgress(prev => { const n = {...prev}; delete n[song.id]; return n; });
      if (err.name === 'QuotaExceededError' || (err.message && err.message.includes('Quota'))) {
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

  const togglePlay = () => {
    if (useNativeAudio && audioRef.current) {
      if (isPlaying) {
        shouldPlayRef.current = false;
        console.log(`[CALLING_AUDIO_PAUSE] from togglePlay`);
        logDebug(`[CALLING_AUDIO_PAUSE] from togglePlay`);
        audioRef.current.pause();
        // UI updates via onPause event
      } else {
        shouldPlayRef.current = true;
        console.log(`[CALLING_AUDIO_PLAY] from togglePlay`);
        logDebug(`[AUDIO_STATE_BEFORE] (togglePlay)`, audioRef.current);
        logDebug(`[CALLING_AUDIO_PLAY] from togglePlay`);
        audioRef.current.play().then(() => {
          logDebug(`[PLAY_PROMISE_RESOLVED] from togglePlay`);
        }).catch((err: any) => {
          logDebug(`[PLAY_PROMISE_REJECTED] from togglePlay\n  error.name: ${err.name}\n  error.message: ${err.message}`);
          setIsPlaying(false);
          setPlaybackState("paused");
        });
        // UI updates via onPlay event
      }
    } else {
      if (!playerRef.current) return;
      if (isPlaying) {
        shouldPlayRef.current = false;
        setIsPlaying(false);
        setPlaybackState("paused");
        playerRef.current.pauseVideo();
      } else {
        shouldPlayRef.current = true;
        setPlaybackState("buffering"); // Optimistic until yt updates
        playerRef.current.playVideo();
      }
    }
  };

  const searchRequestIdRef = useRef(0);

  const executeFullSearch = async (queryToSearch: string, searchType: "artist" | "song" | "any" = "any") => {
    if (!queryToSearch.trim()) return;
    const currentId = ++searchRequestIdRef.current;
    
    setHasSearched(true);
    setIsSearching(true);
    setArtistSuggestions([]);
    setSongSuggestions([]);
    
    const results = await searchYouTube(queryToSearch, searchType);
    
    if (searchRequestIdRef.current !== currentId) {
      logDebug(`Search aborted by newer request.`);
      return;
    }
    
    setSearchResults(results);
    setIsSearching(false);
  };

  useEffect(() => {
    if (!songQuery.trim()) {
      setHasSearched(false);
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      setSongSuggestions([]);
      executeFullSearch(songQuery, "any");
    }, 400); // 400ms debounce
    return () => clearTimeout(timeout);
  }, [songQuery]);

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

  const playRequestIdRef = useRef(0);
  const activePlayRequestIdRef = useRef(0);
  const [playbackState, setPlaybackState] = useState<"idle" | "loading" | "playing" | "paused" | "buffering" | "error">("idle");
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const playSong = async (song: Song, addToHistory: boolean = true, context: "radio" | "playlist" = "radio", overridePlaylistSongs?: Song[], e?: React.MouseEvent) => {
    const currentId = ++playRequestIdRef.current;
    console.log(`[TAP] trackId=${song.id}`);
    logDebug(`[TAP] trackId=${song.id}`);
    console.log(`[SELECT_TRACK] trackId=${song.id}`);
    logDebug(`[SELECT_TRACK] trackId=${song.id}`);
    
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

    if (addToHistory && currentSong?.id !== song.id) {
      setPlaybackHistory((prev) => [...prev, song]);
    }
    
    shouldPlayRef.current = true;
    setCurrentSong(song);
    setPlaybackState("loading");
    setIsPlaying(false); // Legacy sync

    logDebug(`playSong: ${song.title}`, audioRef.current);

    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const isDownloaded = downloads.some(d => d.id === song.id);
    let finalSrc = `/api/audio?v=${song.id}`;
    
    if (isDownloaded) {
      try {
        const localRecord = await getDownload(song.id);
        if (localRecord) {
          if (currentObjectUrlRef.current) {
            URL.revokeObjectURL(currentObjectUrlRef.current);
          }
          finalSrc = URL.createObjectURL(localRecord.blob);
          currentObjectUrlRef.current = finalSrc;
        }
      } catch (err) {
        console.error("Failed to read from IndexedDB", err);
      }
    } else if (isOffline) {
       if (playRequestIdRef.current === currentId) {
         activePlayRequestIdRef.current = currentId;
         setIsPlaying(false);
         setPlaybackState("error");
       }
       return; // Cannot play non-downloaded song offline
    }

    // STEP 3: INSTANT GESTURE PRIMING (DESKTOP ONLY)
    if (!isMobile && playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.unMute?.();
      playerRef.current.setVolume(100);
      playerRef.current.loadVideoById(song.id);
      playerRef.current.playVideo();
      playerRef.current.pauseVideo(); 
      logDebug(`YouTube iframe primed instantly.`);
    }
    
    if (isMobile) {
      logDebug(`Mobile fast-path: setting src instantly to retain user gesture.`);
      setUseNativeAudio(true);
      if (audioRef.current) {
        audioRef.current.src = finalSrc;
        
        console.log(`[PLAY_CALL] paused=${audioRef.current.paused} readyState=${audioRef.current.readyState} networkState=${audioRef.current.networkState}`);
        logDebug(`[PLAY_CALL] paused=${audioRef.current.paused} readyState=${audioRef.current.readyState} networkState=${audioRef.current.networkState}`);
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
           playPromise.then(() => {
              console.log(`[PLAY_PROMISE_RESOLVED] from playSong`);
              logDebug(`[PLAY_PROMISE_RESOLVED] from playSong`);
           }).catch((err) => {
             console.log(`[PLAY_PROMISE_REJECTED] name=${err.name} message=${err.message}`);
             logDebug(`[PLAY_PROMISE_REJECTED] name=${err.name} message=${err.message}`);
             logDebug(`Native play rejected: ${err.message}`);
             if (playRequestIdRef.current === currentId) {
               activePlayRequestIdRef.current = currentId; // Transition definitively failed
               setIsPlaying(false);
               setPlaybackState("paused");
             }
           });
        }
      }
    } else {
      try {
        let targetId = song.id;
        let isNativeValid = false;

        if (isDownloaded) {
          isNativeValid = true; // Local Blob is valid
        } else {
          console.log(`[RESOLVE_SOURCE_START] trackId=${song.id}`);
          let res = await fetch(`/api/audio?v=${song.id}`, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
          if (!res.ok) {
            const altId = await getAlternativeSourceId(song.title, song.artist);
            if (altId) {
              targetId = altId;
              res = await fetch(`/api/audio?v=${targetId}`, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
              if (res.ok) {
                finalSrc = `/api/audio?v=${targetId}`;
                isNativeValid = true;
              }
            }
          } else {
            isNativeValid = true;
          }
        }

        if (playRequestIdRef.current !== currentId) {
          logDebug(`playSong aborted by newer request.`);
          return; 
        }

        if (isNativeValid) {
          logDebug(`Using native audio (valid source)`);
          setUseNativeAudio(true);
          if (audioRef.current) {
            audioRef.current.src = finalSrc;
            audioRef.current.load();
            logDebug(`[AUDIO_STATE_BEFORE] (Desktop playSong)`, audioRef.current);
            logDebug(`[CALLING_AUDIO_PLAY] from Desktop playSong`);
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.then(() => {
                if (shouldPlayRef.current) {
                  // We ONLY do optimistic updates for desktop since YouTube fallback relies on it, 
                  // but for Native Audio let's still just rely on events where possible.
                  // Desktop works with it though, so leaving as is.
                  setPlaybackState("playing");
                  setIsPlaying(true);
                  if (playerRef.current) playerRef.current.pauseVideo();
                } else {
                  logDebug(`[CALLING_AUDIO_PAUSE] from Desktop playPromise resolve`);
                  audioRef.current?.pause();
                }
              }).catch((err: any) => {
                logDebug(`[PLAY_PROMISE_REJECTED] from Desktop playSong\n  error.name: ${err.name}\n  error.message: ${err.message}`);
                setPlaybackState("error");
                setIsPlaying(false);
              });
            }
          }
        } else {
          logDebug(`Native source failed on Desktop. Invoking YouTube fallback.`);
          setUseNativeAudio(false);
          if (shouldPlayRef.current && playerRef.current) {
            playerRef.current.playVideo();
          }
        }
      } catch (err: any) {
        if (playRequestIdRef.current !== currentId) return;
        
        logDebug(`Validation failed/timed out (${err.message}). Invoking YouTube fallback.`);
        setUseNativeAudio(false);
        if (shouldPlayRef.current && playerRef.current) {
          playerRef.current.playVideo();
        }
      }
    }
    
    setLyrics([]);
    setLyricsLoading(true);
    lastScrolledIndex.current = -1;
    
    // Fetch related songs in the background
    getRelatedSongs(song.id).then(setRelatedSongs);
    
    getSyncedLyrics(song.title, song.artist).then(fetchedLyrics => {
      setLyrics(fetchedLyrics);
      setLyricsLoading(false);
    });
  };

  const playNextSong = () => {
    console.log(`[NEXT_TRACK] triggered`);
    logDebug(`[NEXT_TRACK] triggered`);
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
    // Restart current song if past 3 seconds
    const currentAudioTime = useNativeAudio && audioRef.current ? audioRef.current.currentTime : progress;
    if (currentAudioTime > 3) {
      if (useNativeAudio && audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(0, true);
      }
      setProgress(0);
      return;
    }

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



  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        artwork: [{ src: currentSong.image, sizes: '512x512', type: 'image/jpeg' }]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        shouldPlayRef.current = true;
        if (useNativeAudio && audioRef.current) {
          audioRef.current.play().catch((err: any) => {
            logDebug(`MediaSession play rejected: ${err.message}`);
          });
        } else if (playerRef.current) {
          playerRef.current.playVideo();
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        shouldPlayRef.current = false;
        if (useNativeAudio && audioRef.current) {
          logDebug(`[CALLING_AUDIO_PAUSE] from mediaSession`);
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

  if (isProfileChecking) return <div className="fixed inset-0 bg-[#020005]" />;
  
  if (showProfileSelector || (!activeProfile && profiles.length > 0 && !showProfileCreator)) {
    return (
      <ProfileSelector 
        profiles={profiles}
        activeProfileId={activeProfile ? activeProfile.id : undefined}
        onSelect={(p) => {
          setActiveProfile(p);
          localStorage.setItem("music_active_profile", JSON.stringify(p));
          setShowGreeting(true);
          setTimeout(() => setShowGreeting(false), 4000);
          setShowProfileSelector(false);
        }}
        onAdd={() => {
          setShowProfileCreator(true);
          setShowProfileSelector(false);
        }}
        onEdit={(p, newName) => {
          const updated = profiles.map(prof => prof.id === p.id ? { ...prof, name: newName } : prof);
          saveProfiles(updated);
          if (activeProfile && activeProfile.id === p.id) {
             const updatedActive = { ...p, name: newName };
             setActiveProfile(updatedActive);
             localStorage.setItem("music_active_profile", JSON.stringify(updatedActive));
          }
        }}
        onDelete={(p) => {
          const updated = profiles.filter(prof => prof.id !== p.id);
          saveProfiles(updated);
          localStorage.removeItem(`frans_hals_playlists_${p.id}`);
          if (activeProfile && activeProfile.id === p.id) {
             setActiveProfile(null);
             localStorage.removeItem("music_active_profile");
          }
        }}
      />
    );
  }

  if (!activeProfile || showProfileCreator) {
    return (
      <Onboarding onComplete={(profile) => {
        const updated = [...profiles, profile];
        saveProfiles(updated);
        setActiveProfile(profile);
        localStorage.setItem("music_active_profile", JSON.stringify(profile));
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 4000);
        setShowProfileCreator(false);
      }} />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#000000] text-white font-sans selection:bg-[#D4FF00] selection:text-white">
      {playlistMenu && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setPlaylistMenu(null)} />
          {/* Desktop Context Menu */}
          <div 
            className="hidden md:flex fixed z-[101] bg-[#000000]/90 shadow-xl border-[#222222] text-white backdrop-blur-xl border border-white/20 rounded-none shadow-[0_16px_48px_rgba(0,0,0,0.8)] p-3 flex-col gap-2 min-w-[180px] origin-top"
            style={{ 
              top: Math.min(playlistMenu.y, (typeof window !== 'undefined' ? window.innerHeight : 800) - (playlists.length * 40 + 50)), 
              left: Math.max(10, playlistMenu.x - 180) 
            }}
          >
            <div className="text-[10px] font-medium tracking-wide  text-white/50 px-2 pb-1 border-b border-white/10 tracking-widest">Add to Playlist</div>
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
                  className="flex items-center justify-between px-3 py-2 text-white hover:bg-black/5 rounded-[2rem] text-sm font-bold transition-all hover:scale-105 active:scale-95"
                >
                  <span className="truncate pr-4">{p.name}</span>
                  {hasSong ? <Heart className="w-4 h-4 shrink-0 fill-[#D4FF00] text-[#D4FF00]" /> : <Heart className="w-4 h-4 shrink-0 text-white/30" />}
                </button>
              );
            })}
            <button
              onClick={() => {
                setShowCreatePlaylist(true);
              }}
              className="mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-white text-black hover:bg-gray-200 rounded-[2rem] text-sm font-bold transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" /> New Playlist
            </button>
          </div>

          {/* Mobile Action Menu Overlay */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[101] bg-[#111111] rounded-t-3xl p-6 pb-12 flex flex-col gap-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
              <img src={playlistMenu.song.image} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-lg font-bold text-white truncate">{playlistMenu.song.title}</span>
                <span className="text-sm text-white/50 truncate">{playlistMenu.song.artist}</span>
              </div>
            </div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-white/40 px-2 mb-2">Add to Playlist</div>
            <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto">
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
                    className="flex items-center justify-between px-4 py-4 bg-white/5 rounded-2xl text-base font-bold transition-all active:scale-95 active:bg-white/10"
                  >
                    <span className="truncate pr-4">{p.name}</span>
                    {hasSong ? <Check className="w-5 h-5 shrink-0 text-[#D4FF00]" /> : <Plus className="w-5 h-5 shrink-0 text-white/30" />}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setShowCreatePlaylist(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-4 mt-2 bg-[#D4FF00] text-black rounded-2xl text-base font-bold transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" /> Create New Playlist
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Playlist Modal */}
      {showCreatePlaylist && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreatePlaylist(false)} />
          <div className="relative z-10 w-full max-w-sm bg-[#111] border border-white/10 p-6 rounded-3xl shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white text-center">New Playlist</h2>
            <input
              type="text"
              autoFocus
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-medium outline-none focus:border-[#D4FF00] transition-colors placeholder:text-white/30"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPlaylistName.trim()) {
                  const newPl = { id: Date.now().toString(), name: newPlaylistName.trim(), songs: playlistMenu?.song ? [playlistMenu.song] : [] };
                  savePlaylists([...playlists, newPl]);
                  setNewPlaylistName("");
                  setShowCreatePlaylist(false);
                  setPlaylistMenu(null);
                }
              }}
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreatePlaylist(false)}
                className="flex-1 py-4 rounded-xl font-bold text-white/50 bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={!newPlaylistName.trim()}
                onClick={() => {
                  if (newPlaylistName.trim()) {
                    const newPl = { id: Date.now().toString(), name: newPlaylistName.trim(), songs: playlistMenu?.song ? [playlistMenu.song] : [] };
                    savePlaylists([...playlists, newPl]);
                    setNewPlaylistName("");
                    setShowCreatePlaylist(false);
                    setPlaylistMenu(null);
                  }
                }}
                className={`flex-1 py-4 rounded-xl font-bold text-black transition-all active:scale-95 ${newPlaylistName.trim() ? 'bg-[#D4FF00]' : 'bg-white/20 text-white/30 cursor-not-allowed'}`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Hidden YouTube Player */}
      <div className="absolute opacity-0 pointer-events-none w-[1px] h-[1px] overflow-hidden -z-50" style={{ left: '-9999px' }}>
        <YouTube
          videoId={currentSong ? currentSong.id : "dQw4w9WgXcQ"}
          opts={{ height: "100", width: "100", playerVars: { autoplay: 1, controls: 0, playsinline: 1 } }}
          onReady={onReady}
          onStateChange={onStateChange}
          onError={onYouTubeError}
        />
      </div>
      {/* Native audio element for background/lock-screen playback */}
      <audio 
        ref={audioRef} 
        playsInline 
        preload="auto" 
        style={{display:"none"}} 
        onError={(e) => {
          const err = e.currentTarget.error;
          console.log(`[AUDIO_ERROR_EVENT]`);
          logDebug(`[AUDIO_ERROR_EVENT]`);
          logDebug(`Native audio error event! Code: ${err?.code} Msg: ${err?.message}`, e.currentTarget);
          setPlaybackState("error");
          setUseNativeAudio(false);
          if (shouldPlayRef.current && playerRef.current && currentSong) {
            logDebug(`Fallback to YouTube inside onError`);
            playerRef.current.playVideo();
          }
        }}
        onCanPlay={(e) => {
          logDebug(`Native onCanPlay fired.`, e.currentTarget);
        }}
        onCanPlayThrough={(e) => {
          logDebug(`Native onCanPlayThrough fired.`, e.currentTarget);
          setUseNativeAudio(true);
          // Only one source plays at a time. If native audio is ready, pause YouTube fallback
          if (playerRef.current) {
            playerRef.current.pauseVideo();
          }
        }}
        onPlay={(e) => {
          console.log(`[AUDIO_PLAY_EVENT]`);
          logDebug(`[AUDIO_PLAY_EVENT]`);
          logDebug(`Native onPlay fired!`, e.currentTarget);
          activePlayRequestIdRef.current = playRequestIdRef.current; // Transition succeeded
          setIsPlaying(true);
          setPlaybackState("playing");
          if (useNativeAudio) {
            playerRef.current?.pauseVideo(); // Ensure YouTube is paused while native is playing
          }
        }}
        onWaiting={(e) => {
          console.log(`[AUDIO_WAITING_EVENT]`);
          logDebug(`[AUDIO_WAITING_EVENT]`);
          logDebug(`Native onWaiting (buffering) fired!`, e.currentTarget);
          setPlaybackState("buffering");
        }}
        onStalled={(e) => {
          logDebug(`Native onStalled fired!`, e.currentTarget);
          setPlaybackState("buffering");
        }}
        onPlaying={(e) => {
          console.log(`[AUDIO_PLAYING_EVENT]`);
          logDebug(`[AUDIO_PLAYING_EVENT]`);
          logDebug(`Native onPlaying fired!`, e.currentTarget);
          activePlayRequestIdRef.current = playRequestIdRef.current; // Transition succeeded
          setPlaybackState("playing");
        }}
        onTimeUpdate={(e) => {
          if (useNativeAudio) {
            setProgress(e.currentTarget.currentTime);
          }
        }}
        onPause={(e) => {
          console.log(`[AUDIO_PAUSE_EVENT]`);
          logDebug(`[AUDIO_PAUSE_EVENT]`);
          logDebug(`Native onPause fired!`, e.currentTarget);
          
          // CRITICAL FIX: When audio.src is changed, the browser asynchronously fires a 'pause' event 
          // for the PREVIOUS track. This overrides the "loading" state of the NEW track.
          // If playRequestIdRef > activePlayRequestIdRef, it means we are actively transitioning 
          // to a NEW request that hasn't successfully reached onPlay/onPlaying yet.
          // If shouldPlayRef is true, we want it to play. We MUST ignore this stale pause.
          if (playRequestIdRef.current !== activePlayRequestIdRef.current && shouldPlayRef.current) {
            logDebug(`Ignoring stale onPause (transitioning to request ID ${playRequestIdRef.current}, active is ${activePlayRequestIdRef.current})`);
            return;
          }
          
          setIsPlaying(false);
          setPlaybackState("paused");
        }}
/* Native ended listener attached via useEffect */
        onLoadedMetadata={(e) => {
          if (useNativeAudio && e.currentTarget.duration) {
            setDuration(e.currentTarget.duration);
          }
        }}
      />

      {/* LEFT COLUMN - SEARCH & UI */}
      <div id="left-column" className="hidden md:flex w-full md:w-[50%] lg:w-[40%] flex-col border-t-4 md:border-t-0 md:border-l-4 border-[#222222] relative z-20 bg-black text-white overflow-visible drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
        
        {/* Subtle Welcome Greeting */}
        <AnimatePresence>
          {showGreeting && activeProfile && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse" />
              <span className="text-white font-medium">Welcome back, {activeProfile.name.split(' ')[0]}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="relative z-10 w-full h-full flex flex-col justify-start overflow-y-auto p-6 md:p-12 scroll-smooth bg-black">
          <header className="mb-6">
          <div className="flex justify-start items-center gap-4 border-b-4 border-white/30 pb-4">
            <h1 
              onClick={() => { setHasSearched(false); setShowPlaylist(false); setShowDownloads(false); setArtistQuery(""); setSongQuery(""); setSearchResults([]); }}
              className={`text-2xl font-medium tracking-wide  tracking-[0.2em] leading-none cursor-pointer transition-colors ${isLightBg ? 'text-white drop-shadow-md hover:text-[#D4FF00]' : 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] hover:text-[#D4FF00]'}`}
            >
              LISTEN WITH {activeProfile.name}
            </h1>
            <div className="relative group/profile flex items-center">
              <button 
                onClick={() => setShowProfileSelector(true)}
                className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform flex-shrink-0 border-2 border-white/20 ${!activeProfile.avatar ? `bg-gradient-to-br ${activeProfile.color}` : ''}`}
                title={activeProfile.name}
              >
                {activeProfile.avatar ? (
                  <img src={activeProfile.avatar} alt={activeProfile.name} className="w-full h-full object-cover" />
                ) : (
                  activeProfile.emoji
                )}
              </button>
              
              <div className="absolute top-full right-0 mt-2 opacity-0 pointer-events-none group-hover/profile:opacity-100 group-hover/profile:pointer-events-auto transition-all duration-200 z-50">
                <button 
                  onClick={() => {
                    localStorage.removeItem("music_active_profile");
                    setActiveProfile(null);
                  }}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 px-4 py-2 rounded-xl text-sm font-bold shadow-xl backdrop-blur-md transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <Power className="w-4 h-4" /> Switch Profile
                </button>
              </div>
            </div>
          </div>
        </header>

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
               <div className="relative overflow-hidden rounded-[32px] bg-[#020202] p-8 md:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.9)] border border-white/5 flex flex-col gap-10 transition-all duration-700 group/player">
                 
                 {/* Cinematic Gradient Base */}
                 <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                 
                 {/* Extremely subtle artwork glow */}
                 <div className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] z-0 opacity-10 mix-blend-screen pointer-events-none">
                   <img src={currentSong.image} className="w-full h-full object-cover blur-[150px] opacity-60" alt="" />
                 </div>
                 
                 <div className="relative z-10 flex flex-col w-full h-full">
                   
                   {/* Massive Cinematic Artwork */}
                   <motion.div 
                     className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,1)] border border-white/10 mb-8"
                     layoutId="album-art-desktop"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                   >
                     <img src={currentSong.image} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[2s] ease-out" alt="album art" />
                     
                     {/* Artwork Inner Shadow */}
                     <div className="absolute inset-0 rounded-2xl border border-white/10 mix-blend-overlay pointer-events-none" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
                   </motion.div>
                   
                   {/* Info Section (Left-aligned for a modern magazine feel) */}
                   <div className="flex items-end justify-between w-full mb-8">
                     <div className="flex flex-col flex-1 pr-6 min-w-0">
                       <motion.span 
                         key={`title-${currentSong.id}`}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5, delay: 0.1 }}
                         className="text-3xl md:text-4xl font-black tracking-tight text-white mb-1 truncate"
                       >
                         {currentSong.title}
                       </motion.span>
                       <motion.span 
                         key={`artist-${currentSong.id}`}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5, delay: 0.2 }}
                         className="text-lg md:text-xl font-medium text-white/50 truncate tracking-wide"
                       >
                         {currentSong.artist}
                       </motion.span>
                     </div>
                     <button 
                       onClick={(e) => toggleLike(currentSong, e)}
                       className="shrink-0 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                     >
                       <Heart className={`w-6 h-6 transition-colors ${playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong?.id) ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-white'}`} />
                     </button>
                   </div>
                   
                   {/* Futuristic Timeline */}
                   <div className="w-full flex flex-col gap-4 cursor-pointer mb-10 px-1 group/timeline" onClick={handleProgressClick}>
                     <div className="h-1.5 w-full rounded-full bg-white/5 relative overflow-hidden transition-all duration-300 hover:h-2 hover:bg-white/10">
                       <motion.div 
                         className="absolute top-0 left-0 h-full bg-[#D4FF00] rounded-full transition-all ease-linear"
                         style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                       />
                       {/* Glowing thumb (only visible on hover for minimalism) */}
                       <div 
                         className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_#D4FF00] opacity-0 group-hover/timeline:opacity-100 transition-opacity"
                         style={{ left: `calc(${duration ? (progress / duration) * 100 : 0}% - 8px)` }}
                       />
                     </div>
                     <div className="flex justify-between text-[11px] font-bold text-white/40 tracking-widest tabular-nums">
                       <span>{Math.floor(progress / 60)}:{(Math.floor(progress % 60)).toString().padStart(2, "0")}</span>
                       <span>-{Math.floor((duration - progress) / 60)}:{(Math.floor((duration - progress) % 60)).toString().padStart(2, "0")}</span>
                     </div>
                   </div>
                   
                   {/* Playback Controls */}
                   <div className="flex items-center justify-between w-full mb-8">
                     <button aria-label="Shuffle" onClick={() => setIsShuffleOn(!isShuffleOn)} className={`transition-colors p-2 rounded-full hover:bg-white/5 ${isShuffleOn ? 'text-[#D4FF00]' : 'text-white/30 hover:text-white'}`}>
                       <Shuffle className="w-5 h-5" />
                     </button>
                     
                     <div className="flex items-center gap-6 md:gap-8">
                       <button 
                         aria-label="Previous song"
                         onClick={playPreviousSong}
                         className={`text-white hover:text-white/80 transition-transform active:scale-90 ${playbackHistory.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                         disabled={playbackHistory.length === 0}
                       >
                         <SkipBack className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                       </button>
                       
                       <button 
                         aria-label={isPlaying ? "Pause" : "Play"}
                         onClick={togglePlay}
                         className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full bg-[#D4FF00] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_10px_30px_rgba(212,255,0,0.2)]"
                       >
                         {playbackState === "loading" || playbackState === "buffering" ? (
                           <Loader2 className="w-10 h-10 animate-spin" />
                         ) : isPlaying ? (
                           <Pause className="w-10 h-10 md:w-12 md:h-12 fill-current" />
                         ) : (
                           <Play className="w-10 h-10 md:w-12 md:h-12 fill-current ml-2" />
                         )}
                       </button>
                       
                       <button 
                         aria-label="Next song"
                         onClick={playNextSong}
                         className={`text-white hover:text-white/80 transition-transform active:scale-90 ${relatedSongs.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                         disabled={relatedSongs.length === 0}
                       >
                         <SkipForward className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                       </button>
                     </div>

                     <button aria-label="Repeat" className="text-white/30 hover:text-white hover:bg-white/5 p-2 rounded-full transition-colors">
                       <Repeat className="w-5 h-5" />
                     </button>
                   </div>
                   
                   {/* Clean Navigation Section */}
                   <div className="flex items-center justify-between w-full border-t border-white/10 pt-6">
                     <div className="flex items-center gap-6">
                       <button onClick={() => setPlayerTab(playerTab === 'queue' ? null : 'queue')} className={`text-xs font-bold uppercase tracking-widest transition-colors ${playerTab === 'queue' ? 'text-[#D4FF00]' : 'text-white/50 hover:text-white'}`}>Up Next</button>
                       <button onClick={() => setPlayerTab(playerTab === 'lyrics' ? null : 'lyrics')} className={`text-xs font-bold uppercase tracking-widest transition-colors ${playerTab === 'lyrics' ? 'text-[#D4FF00]' : 'text-white/50 hover:text-white'}`}>Lyrics</button>
                       <button onClick={() => setPlayerTab(playerTab === 'related' ? null : 'related')} className={`text-xs font-bold uppercase tracking-widest transition-colors ${playerTab === 'related' ? 'text-[#D4FF00]' : 'text-white/50 hover:text-white'}`}>Related</button>
                     </div>
                     <div className="flex items-center gap-6">
                       <div className="relative" onMouseLeave={() => setShowVolumeSlider(false)}>
                         <button onMouseEnter={() => setShowVolumeSlider(true)} onClick={() => setIsMuted(!isMuted)} className="text-white/40 hover:text-white transition-colors" title="Volume" aria-label="Volume">
                           {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : volume < 0.5 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                         </button>
                         <AnimatePresence>
                           {showVolumeSlider && (
                             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 shadow-xl z-50 flex items-center justify-center h-32 w-10">
                               <div className="relative w-full h-full flex items-center justify-center">
                                 <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={(e) => { setIsMuted(false); setVolume(parseFloat(e.target.value)); }} className="appearance-none bg-white/20 h-1 w-24 rounded-full outline-none transform -rotate-90 origin-center cursor-pointer absolute" style={{ WebkitAppearance: 'none', background: `linear-gradient(to right, #D4FF00 0%, #D4FF00 ${(isMuted ? 0 : volume)*100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume)*100}%, rgba(255,255,255,0.2) 100%)` }} />
                               </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                       </div>
                       <div className="relative">
                         <button onClick={(e) => handleShare(currentSong, e)} className="text-white/40 hover:text-white transition-colors" aria-label="Share">
                           <Share className="w-5 h-5" />
                         </button>
                         {copiedLink && (
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#D4FF00] text-black text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2">
                             Copied
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                   {/* Hidden Old Secondary Controls Wrapper to avoid regex breakage */}
                   <div className="hidden flex items-center justify-between w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/5">
                     <div className="relative" onMouseLeave={() => setShowVolumeSlider(false)}>
                       <button 
                         onMouseEnter={() => setShowVolumeSlider(true)}
                         onClick={() => setIsMuted(!isMuted)} 
                         className="text-white/40 hover:text-white transition-colors"
                         title="Volume"
                         aria-label="Volume"
                       >
                         {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : volume < 0.5 ? <Volume1 className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                       </button>
                       <AnimatePresence>
                         {showVolumeSlider && (
                           <motion.div 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: 10 }}
                             className="absolute bottom-full left-0 mb-4 bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-xl z-50 flex items-center justify-center h-32 w-12"
                           >
                             <div className="relative w-full h-full flex items-center justify-center">
                               <input 
                                 type="range" min="0" max="1" step="0.01" 
                                 value={isMuted ? 0 : volume} 
                                 onChange={(e) => { setIsMuted(false); setVolume(parseFloat(e.target.value)); }} 
                                 className="appearance-none bg-white/20 h-1 w-24 rounded-full outline-none transform -rotate-90 origin-center cursor-pointer absolute"
                                 style={{ WebkitAppearance: 'none', background: `linear-gradient(to right, #D4FF00 0%, #D4FF00 ${(isMuted ? 0 : volume)*100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume)*100}%, rgba(255,255,255,0.2) 100%)` }}
                               />
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                     <div className="flex items-center gap-8 relative">
                       <button 
                         onClick={(e) => toggleLike(currentSong, e)}
                         className="text-white/40 hover:text-white transition-transform active:scale-90"
                       >
                         <Heart className={`w-6 h-6 transition-colors ${playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong?.id) ? 'fill-[#1ED760] text-[#1ED760]' : 'hover:text-white'}`} />
                       </button>
                       <div className="relative">
                         <button onClick={(e) => handleShare(currentSong, e)} className="text-white/40 hover:text-white transition-transform active:scale-90" title="Share" aria-label="Share">
                           <Share className="w-6 h-6" />
                         </button>
                         {copiedLink && (
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#D4FF00] text-black text-xs font-bold px-2 py-1 rounded whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2">
                             Link copied
                           </div>
                         )}
                       </div>
                       {hasHeadphones && <Headphones className="w-6 h-6 text-white/40" />}
                     </div>
                     <div className="flex items-center gap-4">
                       <button onClick={() => { setIsQueueExpanded(!isQueueExpanded); setIsLyricsExpanded(false); }} className={`transition-colors ${isQueueExpanded ? 'text-white' : 'text-white/40 hover:text-white'}`} title="Queue" aria-label="Queue">
                         <ListMusic className="w-6 h-6" />
                       </button>
                       <button onClick={() => { setIsLyricsExpanded(!isLyricsExpanded); setIsQueueExpanded(false); }} className={`transition-colors ${isLyricsExpanded ? 'text-white' : 'text-white/40 hover:text-white'}`} title="Lyrics" aria-label="Lyrics">
                         <Quote className="w-6 h-6" />
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
                 {/* TAB CONTENT BOX */}
                 <AnimatePresence mode="wait">
                   {playerTab && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0, y: -20 }}
                       animate={{ opacity: 1, height: "60vh", y: 0 }}
                       exit={{ opacity: 0, height: 0, y: -20 }}
                       transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                       className="w-full mt-2 relative overflow-hidden bg-white/[0.02] rounded-2xl border border-white/5"
                     >
                       <div 
                         ref={lyricsContainerRef}
                         onWheel={handleUserInteraction}
                         onTouchMove={handleUserInteraction}
                         onMouseDown={handleUserInteraction}
                         className="w-full h-full overflow-y-auto overflow-x-hidden relative scrollbar-hide scroll-smooth"
                       >
                         {playerTab === 'queue' ? (
                     <div className="flex flex-col gap-4 w-full px-4 pb-8">
                       {playbackHistory.length > 0 && (
                         <div className="flex flex-col gap-2">
                           <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest">Previously Played</h3>
                           {playbackHistory.map((song, i) => (
                             <div key={i} className="opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                               <SongBox song={song} index={i} onPlay={() => playSong(song)} isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === song.id) ?? false} onToggleFavorite={(e) => toggleLike(song, e)} onOpenMenu={(e) => openPlaylistMenu(song, e)} isDownloaded={downloads.some(d => d.id === song.id)} downloadProgress={downloadProgress[song.id]} onDownload={(e) => handleDownload(song, e)} onRemoveDownload={(e) => handleRemoveDownload(song.id, e)} />
                             </div>
                           ))}
                         </div>
                       )}
                       <div className="flex flex-col gap-2 relative">
                         <h3 className="text-sm font-bold text-[#D4FF00] uppercase tracking-widest">Now Playing</h3>
                         <div className="ring-2 ring-[#D4FF00] rounded-xl">
                           <SongBox song={currentSong} index={0} onPlay={() => {}} isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong.id) ?? false} onToggleFavorite={(e) => toggleLike(currentSong, e)} onOpenMenu={(e) => openPlaylistMenu(currentSong, e)} isDownloaded={downloads.some(d => d.id === currentSong.id)} downloadProgress={downloadProgress[currentSong.id]} onDownload={(e) => handleDownload(currentSong, e)} onRemoveDownload={(e) => handleRemoveDownload(currentSong.id, e)} />
                         </div>
                       </div>
                       {relatedSongs.filter(s => s.id !== currentSong.id).length > 0 && (
                         <div className="flex flex-col gap-2">
                           <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest">Up Next</h3>
                           {relatedSongs.filter(s => s.id !== currentSong.id).map((song, i) => (
                             <SongBox key={song.id} song={song} index={i} onPlay={() => playSong(song)} isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === song.id) ?? false} onToggleFavorite={(e) => toggleLike(song, e)} onOpenMenu={(e) => openPlaylistMenu(song, e)} isDownloaded={downloads.some(d => d.id === song.id)} downloadProgress={downloadProgress[song.id]} onDownload={(e) => handleDownload(song, e)} onRemoveDownload={(e) => handleRemoveDownload(song.id, e)} />
                           ))}
                         </div>
                       )}
                     </div>
                   ) : playerTab === 'lyrics' ? (
                     <>
                    {lyricsLoading ? (
                       <div className="w-full h-full flex flex-col items-center justify-center opacity-50">
                         <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
                         <span className="text-xs font-bold  tracking-widest text-gray-400">Loading Lyrics</span>
                       </div>
                    ) : lyrics.length === 0 ? (
                       <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                         <span className="text-xs font-bold  tracking-widest text-gray-400">No Lyrics Found</span>
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
                                className="cursor-pointer font-medium tracking-wide  origin-left transition-colors hover:opacity-100 flex flex-wrap text-xl md:text-3xl mb-4"
                              >
                                {line.words ? line.words.map((w, wIdx) => {
                                  const isWordActive = isActive && progress >= w.time;
                                  return (
                                    <span 
                                      key={wIdx} 
                                      className="inline-block mr-2 md:mr-3 transition-all duration-150"
                                      style={{
                                        color: isWordActive ? '#D4FF00' : (isActive ? '#fff' : (isLyricsExpanded ? '#ccc' : '#999')),
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
                                      color: isActive ? '#D4FF00' : (isLyricsExpanded ? '#ccc' : '#999'),
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
                     </>
                   ) : playerTab === 'related' ? (
                     <div className="flex flex-col gap-4 w-full px-4 py-8">
                       <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest px-2">Related Songs</h3>
                       {relatedSongs.map((song, i) => (
                         <SongBox key={song.id} song={song} index={i} onPlay={() => playSong(song)} isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === song.id) ?? false} onToggleFavorite={(e) => toggleLike(song, e)} onOpenMenu={(e) => openPlaylistMenu(song, e)} isDownloaded={downloads.some(d => d.id === song.id)} downloadProgress={downloadProgress[song.id]} onDownload={(e) => handleDownload(song, e)} onRemoveDownload={(e) => handleRemoveDownload(song.id, e)} />
                       ))}
                     </div>
                   ) : null}
                   </div>
                 </motion.div>
                 )}
                 </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col mt-4">
<div className="w-full flex flex-col gap-4">
            <div className="mb-2 flex items-center justify-start px-2">
              <h2 className="text-xl font-medium tracking-wide tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">Playlists</h2>
            </div>
            {playlists.map(p => (
              <button 
                key={p.id}
                onClick={() => { setActivePlaylistId(p.id); setShowPlaylist(true); setShowDownloads(false); setHasSearched(false); setIsEditingPlaylist(false); }}
                className={`w-full border-2 border-white/40 p-4 text-2xl font-medium tracking-wide tracking-tight transition-all flex justify-between items-center ${showPlaylist && activePlaylistId === p.id ? 'bg-[#D4FF00] text-[#000000] shadow-none translate-y-1 translate-x-1' : 'bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white shadow-sm hover:translate-y-1 hover:translate-x-1 hover:shadow-sm'}`}
              >
                <span className="truncate pr-4 text-left">{p.name}</span>
                <span className="bg-[#1d1d1f] text-white px-3 py-1 rounded-full text-sm shrink-0">{p.songs.length}</span>
              </button>
            ))}
            <button 
              onClick={() => { setShowDownloads(true); setShowPlaylist(false); setHasSearched(false); }}
              className={`w-full border-2 border-white/40 p-4 text-2xl font-medium tracking-wide tracking-tight transition-all flex justify-between items-center ${showDownloads ? 'bg-[#D4FF00] text-[#000000] shadow-none translate-y-1 translate-x-1' : 'bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white shadow-sm hover:translate-y-1 hover:translate-x-1 hover:shadow-sm'}`}
            >
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5" />
                <span className="truncate text-left">Downloads</span>
              </div>
              <span className="bg-[#1d1d1f] text-white px-3 py-1 rounded-full text-sm shrink-0">{downloads.length}</span>
            </button>
            <button 
              onClick={() => {
                const name = prompt("Enter playlist name:");
                if (name) {
                  const newP = { id: Date.now().toString(), name, songs: [] };
                  savePlaylists([...playlists, newP]);
                }
              }}
              className="w-full border-2 border-white/20 border-dashed p-4 text-xl font-medium tracking-wide tracking-tight bg-[#000000]/70 backdrop-blur-xl text-white hover:border-[#D4FF00] hover:text-[#D4FF00] transition-colors"
            >
              + New Playlist
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* RIGHT COLUMN - RESULTS & PLAYER */}
      <div className="hidden md:flex w-full md:w-[50%] lg:w-[60%] relative bg-[#000000]/80 backdrop-blur-md border-l border-[#222222] text-[#F5F5F5] overflow-hidden flex-col min-h-[50vh] md:min-h-screen">
        


        {/* Heavily Animated Neon Background */}
        <NeonBackground />

        {/* Content Area */}
        <div 
          className={`relative z-10 flex-1 p-6 md:p-12 overflow-y-auto scroll-smooth will-change-transform transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isInactive ? '-translate-y-16 scale-[1.02]' : 'translate-y-0 scale-100'}`}
        >

              <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-2 mb-8 z-[60] search-container">
                {/* Song Box */}
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if(songQuery.trim()) { setSongSuggestions([]); executeFullSearch(songQuery, "any"); }
              }} 
              className="relative w-full group"
            >
              <div className="border-2 border-white/60 bg-[#111111]/80 backdrop-blur-xl text-white shadow-[4px_4px_0_0_rgba(255,255,255,0.4)] group-focus-within:translate-y-px group-focus-within:translate-x-px group-focus-within:shadow-[0px_0px_0_0_rgba(255,255,255,0.8)] transition-all duration-200">
                <div className="bg-black/80 text-white px-3 py-1 inline-block text-xs font-bold tracking-widest border-r-2 border-b-2 border-white/60 backdrop-blur-xl">
                  TRACK
                </div>
                <input
                  type="text"
                  placeholder="What is the song name?"
                  value={songQuery}
                  onChange={(e) => setSongQuery(e.target.value)}
                  className="w-full bg-transparent text-lg md:text-xl font-bold px-4 py-3 outline-none placeholder:text-white/50 text-white"
                />
              </div>

              <AnimatePresence>
                {songSuggestions.length > 0 && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="md:absolute md:top-full md:left-0 w-full mt-2 md:mt-4 bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white border-2 border-white/30 shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] z-50 flex flex-col divide-y-2 divide-white/20"
                  >
                    {songSuggestions.map((sug, i) => (
                      <li 
                        key={i} 
                        onClick={() => { setSongQuery(sug); setSongSuggestions([]); executeFullSearch(sug, "any"); }}
                        className="px-6 py-4 cursor-pointer text-2xl font-black uppercase tracking-tighter  tracking-tight text-white hover:bg-[#000000] hover:text-white transition-colors flex justify-between items-center group/item"
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


          {showDownloads && (
            <div className="w-full flex flex-col pt-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <ArrowDownToLine className="w-8 h-8 text-[#D4FF00]" />
                  <h2 className="text-4xl font-black tracking-tight text-white">Downloads</h2>
                </div>
                <div className="text-white/40 text-sm font-medium">
                  {downloads.length} songs • {(downloads.reduce((acc, d) => acc + d.size, 0) / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>
              <div className="flex flex-col gap-2 relative">
                {downloads.length === 0 ? (
                  <div className="py-20 text-center text-white/40">No downloaded songs yet.</div>
                ) : (
                  downloads.map((d, index) => (
                    <div className="flex items-center group/box transition-all duration-200" key={d.id}>
                      <div className="flex-1 pointer-events-auto">
                        <SongBox 
                          song={d.metadata} 
                          index={index} 
                          onPlay={(e) => playSong(d.metadata, true, "playlist", downloads.map(d=>d.metadata), e)} 
                          isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === d.id) ?? false} 
                          onToggleFavorite={(e) => toggleLike(d.metadata, e)} onOpenMenu={(e) => openPlaylistMenu(d.metadata, e)} 
                          isDownloaded={true}
                          onRemoveDownload={(e) => handleRemoveDownload(d.id, e)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {showPlaylist ? (() => {
            const activePlaylist = playlists.find(p => p.id === activePlaylistId);
            if (!activePlaylist) return null;
            return (
            <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto pb-32">
              <div className="flex flex-col gap-4 border-b-4 border-[#222222] pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-white truncate leading-none pb-2">{activePlaylist.name}</h2>
                  <div className="flex flex-wrap gap-4 shrink-0 mt-4 md:mt-0">
                    <button 
                      onClick={() => {
                        const newName = prompt("Rename playlist:", activePlaylist.name);
                        if (newName) {
                          savePlaylists(playlists.map(p => p.id === activePlaylistId ? { ...p, name: newName } : p));
                        }
                      }}
                      className="px-4 py-2 border-2 border-white/20 hover:border-[#D4FF00] hover:text-[#D4FF00] uppercase font-black text-xs tracking-widest transition-all"
                    >Rename</button>
                    <button 
                      onClick={() => setIsShuffleOn(!isShuffleOn)}
                      className={`px-4 py-2 border-2 uppercase font-black text-xs tracking-widest transition-all ${isShuffleOn ? 'border-[#D4FF00] bg-[#D4FF00] text-black shadow-[4px_4px_0_0_#FFF]' : 'border-white/20 hover:border-[#D4FF00] hover:text-[#D4FF00]'}`}
                    >Shuffle: {isShuffleOn ? 'ON' : 'OFF'}</button>
                    <button 
                      onClick={() => setIsEditingPlaylist(!isEditingPlaylist)}
                      className={`px-4 py-2 border-2 uppercase font-black text-xs tracking-widest transition-all ${isEditingPlaylist ? 'border-[#D4FF00] bg-[#D4FF00] text-black shadow-[4px_4px_0_0_#FFF]' : 'border-white/20 hover:border-[#D4FF00] hover:text-[#D4FF00]'}`}
                    >{isEditingPlaylist ? 'Done' : 'Edit'}</button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete the playlist "${activePlaylist.name}"?`)) {
                          savePlaylists(playlists.filter(p => p.id !== activePlaylistId));
                          setShowPlaylist(false);
                          setActivePlaylistId('default');
                        }
                      }}
                      className="px-4 py-2 border-2 border-transparent hover:border-red-500 hover:text-red-500 uppercase font-black text-xs tracking-widest transition-all"
                    >Delete</button>
                  </div>
                </div>
              </div>
              
              {activePlaylist.songs.length === 0 ? (
                <p className="text-3xl font-black uppercase tracking-tighter  opacity-50">This playlist is empty. Add songs by clicking the heart icon!</p>
              ) : (
                <div className="flex flex-col bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
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
                            onToggleFavorite={(e) => toggleLike(song, e)} onOpenMenu={(e) => openPlaylistMenu(song, e)}
  isDownloaded={downloads.some(d => d.id === song.id)}
  downloadProgress={downloadProgress[song.id]}
  onDownload={(e) => handleDownload(song, e)}
  onRemoveDownload={(e) => handleRemoveDownload(song.id, e)}
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
                  className="flex items-center gap-2 self-start hover:text-[#D4FF00] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#000000]/20 group-hover:bg-[#D4FF00] text-[#000000] flex items-center justify-center transition-colors">
                    <span className="text-2xl font-black uppercase tracking-tighter mb-1">+</span>
                  </div>
                  <span className="text-lg font-medium tracking-wide  tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] text-white group-hover:text-[#D4FF00]">Add more songs</span>
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
                        <div className="border-2 border-white/40 bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white shadow-[2px_2px_0_0_rgba(255,255,255,0.3)] group-focus-within:translate-y-px group-focus-within:translate-x-px group-focus-within:shadow-[0px_0px_0_0_#024230] transition-all duration-200">
                           <div className="bg-black/50 text-white px-2 py-0.5 inline-block text-[10px] font-medium tracking-wide  tracking-widest border-r-2 border-b-2 border-white/40 backdrop-blur-xl">Search</div>
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
                        <div className="flex flex-col bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
                          <div className="flex flex-col divide-y divide-white/10 p-2">
                            {inlineSearchResults.map((song, i) => {
                              const alreadyInPlaylist = activePlaylist.songs.some(s => s.id === song.id) ?? false;
                              return (
                                <div className="flex items-center group/box transition-all duration-200" key={song.id}>
                                  <div className="flex-1 pointer-events-auto">
                                    <SongBox 
                                      song={song} 
                                      index={i} 
                                      onPlay={(e) => playSong(song, true, "radio", undefined, e)} 
                                      isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === song.id) ?? false} 
                                      onToggleFavorite={(e) => toggleLike(song, e)} onOpenMenu={(e) => openPlaylistMenu(song, e)}
  isDownloaded={downloads.some(d => d.id === song.id)}
  downloadProgress={downloadProgress[song.id]}
  onDownload={(e) => handleDownload(song, e)}
  onRemoveDownload={(e) => handleRemoveDownload(song.id, e)}
/>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      if (alreadyInPlaylist) return;
                                      savePlaylists(playlists.map(p => p.id === activePlaylistId ? { ...p, songs: [...p.songs, song] } : p));
                                    }}
                                    className={`shrink-0 mx-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${alreadyInPlaylist ? 'bg-[#D4FF00]/20 text-[#D4FF00] cursor-not-allowed' : 'bg-[#000000]/20 hover:bg-[#D4FF00] text-[#000000] hover:scale-110 shadow-md'}`}
                                  >
                                    <span className="text-2xl font-black uppercase tracking-tighter mb-1">{alreadyInPlaylist ? '✓' : '+'}</span>
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
                <div className="flex items-center justify-between border-b-4 border-[#222222] pb-4 overflow-hidden">
                  <motion.h2 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                    className="text-3xl font-medium tracking-wide tracking-tight text-white drop-shadow-xl"
                  >
                    Trending Worldwide
                  </motion.h2>
                </div>
                
                {trendingWorldwide.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin opacity-50" />
                  </div>
                ) : (
                  <div className="flex flex-col bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
                    <div className="flex flex-col divide-y divide-white/10 p-2">
                      {trendingWorldwide.slice(0, 10).map((song, index) => (
                      <SongBox 
                        key={song.id} 
                        song={song} 
                        index={index} 
                        onPlay={() => playSong(song)} 
                        isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === song.id) ?? false} 
                        onToggleFavorite={(e) => toggleLike(song, e)} onOpenMenu={(e) => openPlaylistMenu(song, e)}
  isDownloaded={downloads.some(d => d.id === song.id)}
  downloadProgress={downloadProgress[song.id]}
  onDownload={(e) => handleDownload(song, e)}
  onRemoveDownload={(e) => handleRemoveDownload(song.id, e)}
/>
                    ))}
                    </div>
                  </div>
                )}
              </div>

              {/* India Section */}
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between border-b-4 border-[#222222] pb-4 overflow-hidden">
                  <motion.h2 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="text-3xl font-medium tracking-wide tracking-tight text-white drop-shadow-xl"
                  >
                    Trending in India
                  </motion.h2>
                </div>
                
                {trendingIndia.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin opacity-50" />
                  </div>
                ) : (
                  <div className="flex flex-col bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
                    <div className="flex flex-col divide-y divide-white/10 p-2">
                      {trendingIndia.slice(0, 10).map((song, index) => (
                      <SongBox 
                        key={song.id} 
                        song={song} 
                        index={index} 
                        onPlay={() => playSong(song)} 
                        isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === song.id) ?? false} 
                        onToggleFavorite={(e) => toggleLike(song, e)} onOpenMenu={(e) => openPlaylistMenu(song, e)}
  isDownloaded={downloads.some(d => d.id === song.id)}
  downloadProgress={downloadProgress[song.id]}
  onDownload={(e) => handleDownload(song, e)}
  onRemoveDownload={(e) => handleRemoveDownload(song.id, e)}
/>
                    ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto pb-32">
              <div className="flex items-center justify-between border-b-4 border-[#222222] pb-4">
                <h2 className="text-3xl font-medium tracking-wide tracking-tight">Results</h2>
                {isSearching && <Loader2 className="w-8 h-8 animate-spin" />}
              </div>
              
              {!isSearching && searchResults.length === 0 && (
                <p className="text-3xl font-black uppercase tracking-tighter  opacity-50">No matches found.</p>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="flex flex-col bg-[#000000]/70 backdrop-blur-xl border border-[#222222] text-white border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden mb-6">
                  <div className="flex flex-col divide-y divide-white/10 p-2">
                    {searchResults.map((song, index) => (
                      <SongBox 
                        key={song.id} 
                        song={song} 
                        index={index} 
                        onPlay={(e) => playSong(song, true, "radio", undefined, e)}
                        isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === song.id) ?? false} 
                        onToggleFavorite={(e) => toggleLike(song, e)} onOpenMenu={(e) => openPlaylistMenu(song, e)}
  isDownloaded={downloads.some(d => d.id === song.id)}
  downloadProgress={downloadProgress[song.id]}
  onDownload={(e) => handleDownload(song, e)}
  onRemoveDownload={(e) => handleRemoveDownload(song.id, e)}
/>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Custom Ambient Video to Fill Bottom Space */}
          <div className="w-full max-w-2xl mx-auto mt-12 mb-8 overflow-hidden rounded-[2rem] border border-[#222222] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
            <video 
              src="/video.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"
            />
          </div>

          <div className="w-full flex justify-center pt-4 pb-24 mt-auto opacity-30 hover:opacity-100 transition-opacity">
            <span className="text-xs font-medium tracking-wide tracking-[0.4em]  text-white drop-shadow-md">
              Developed by Sarthak Avhad
            </span>
          </div>
        </div>


      </div>

            {/* MOBILE VIEW (Plug-In Custom Design) */}
      <div className="flex md:hidden w-full h-[100dvh] flex-col bg-[#050505] text-[#F5F5F5] relative overflow-hidden font-sans pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
        
        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pb-[200px] px-6 scrollbar-hide pt-12 transition-opacity duration-300" style={{ WebkitOverflowScrolling: 'touch' }}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
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
          </div>

          {/* HOME TAB */}
          {mobileTab === "home" && (
            <div className="flex flex-col gap-10 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-white/90 tracking-tight">
                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}, {activeProfile?.name || 'Guest'}.
              </h2>

              {/* Recently Played */}
              {playbackHistory.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-[#D4FF00]">Recently Played</h2>
                  <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                    {[...playbackHistory].reverse().slice(0, 10).map((song, i) => (
                      <div key={i} className="min-w-[140px] max-w-[140px] flex flex-col gap-3 snap-start relative group" onClick={() => playSong(song)}>
                        <div className="absolute top-2 right-2 z-10">
                          <button 
                            onClick={(e) => { e.stopPropagation(); downloads.some(d => d.id === song.id) ? handleRemoveDownload(song.id, e) : (downloadProgress[song.id] === undefined ? handleDownload(song, e) : null); }}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md active:bg-black/70 text-white"
                          >
                            {downloads.some(d => d.id === song.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-[#D4FF00]" />
                            ) : downloadProgress[song.id] !== undefined ? (
                              <div className="relative flex items-center justify-center w-4 h-4">
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                                {typeof downloadProgress[song.id] === 'number' && <span className="absolute text-[6px] font-bold text-white leading-none">{downloadProgress[song.id]}</span>}
                              </div>
                            ) : (
                              <ArrowDownToLine className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="w-[140px] h-[140px] relative rounded-2xl overflow-hidden shadow-lg shadow-black/50">
                          <img src={song.image} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 active:opacity-100 transition-opacity">
                            <Play className="w-10 h-10 fill-white text-white" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white truncate">{song.title}</span>
                          <span className="text-xs text-white/50 truncate">{song.artist}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended / Trending */}
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold uppercase tracking-widest text-white/80">Recommended For You</h2>
                <div className="flex flex-col gap-3">
                  {trendingWorldwide.slice(0, 5).map((song, i) => (
                    <div key={song.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 active:bg-white/10 transition-colors" onClick={() => playSong(song)}>
                      <img src={song.image} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-base font-bold text-white truncate">{song.title}</span>
                        <span className="text-sm text-white/50 truncate">{song.artist}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleLike(song, e); }}
                        className="p-2"
                      >
                        <Heart className={`w-5 h-5 ${playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === song.id) ?? false ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-white/40'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DISCOVER TAB */}
          {mobileTab === "discover" && (
            <div className="flex flex-col gap-10 animate-in fade-in duration-500">
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold uppercase tracking-widest text-[#D4FF00]">Trending Worldwide</h2>
                <div className="grid grid-cols-2 gap-4">
                  {trendingWorldwide.map(song => (
                    <div key={song.id} className="flex flex-col gap-2 relative group" onClick={() => playSong(song)}>
                      <div className="absolute top-2 right-2 z-10">
                        <button 
                          onClick={(e) => { e.stopPropagation(); downloads.some(d => d.id === song.id) ? handleRemoveDownload(song.id, e) : (downloadProgress[song.id] === undefined ? handleDownload(song, e) : null); }}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md active:bg-black/70 text-white"
                        >
                          {downloads.some(d => d.id === song.id) ? (
                            <CheckCircle2 className="w-4 h-4 text-[#D4FF00]" />
                          ) : downloadProgress[song.id] !== undefined ? (
                            <div className="relative flex items-center justify-center w-4 h-4">
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                              {typeof downloadProgress[song.id] === 'number' && <span className="absolute text-[6px] font-bold text-white leading-none">{downloadProgress[song.id]}</span>}
                            </div>
                          ) : (
                            <ArrowDownToLine className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="aspect-square relative rounded-2xl overflow-hidden">
                        <img src={song.image} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-bold text-white truncate">{song.title}</span>
                      <span className="text-xs text-white/50 truncate">{song.artist}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DOWNLOADS TAB */}
          {mobileTab === "downloads" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <ArrowDownToLine className="w-6 h-6 text-[#D4FF00]" />
                  <h2 className="text-2xl font-black tracking-tight text-white">Downloads</h2>
                </div>
                <div className="text-white/40 text-xs font-medium">
                  {downloads.length} songs • {(downloads.reduce((acc, d) => acc + d.size, 0) / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {downloads.length === 0 ? (
                  <div className="py-20 text-center text-white/40">No downloaded songs yet.</div>
                ) : (
                  downloads.map((d, index) => (
                    <div className="flex items-center group/box transition-all duration-200" key={d.id}>
                      <div className="flex-1 pointer-events-auto">
                        <SongBox 
                          song={d.metadata} 
                          index={index} 
                          onPlay={(e) => playSong(d.metadata, true, "playlist", downloads.map(d=>d.metadata), e)} 
                          isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === d.id) ?? false} 
                          onToggleFavorite={(e) => toggleLike(d.metadata, e)} onOpenMenu={(e) => openPlaylistMenu(d.metadata, e)} 
                          isDownloaded={true}
                          onRemoveDownload={(e) => handleRemoveDownload(d.id, e)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SEARCH TAB */}
          {mobileTab === "search" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <div className="relative sticky top-0 z-10 pt-2 pb-4 bg-[#050505]">
                <Search className="absolute left-4 top-5 w-5 h-5 text-white/50" />
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
                      setSongSuggestions([]);
                      executeFullSearch(songQuery, "any");
                    }
                  }}
                  className="w-full bg-white/10 text-white rounded-2xl py-4 pl-12 pr-4 font-medium outline-none focus:bg-white/15 transition-colors border border-white/5 placeholder:text-white/40"
                />
              </div>

              {songSuggestions.length > 0 && !hasSearched && (
                <div className="flex flex-col gap-1">
                  {songSuggestions.map((sug, i) => (
                    <div 
                      key={i} 
                      onClick={() => { setSongQuery(sug); setSongSuggestions([]); executeFullSearch(sug, "any"); }}
                      className="py-3 text-lg font-medium text-white/80 active:text-[#D4FF00] border-b border-white/5 flex items-center gap-3"
                    >
                      <Search className="w-4 h-4 text-white/30" />
                      {sug}
                    </div>
                  ))}
                </div>
              )}

              {isSearching ? (
                 <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#D4FF00]" /></div>
              ) : hasSearched && searchResults.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Results</h2>
                  {searchResults.map((song, i) => (
                    <div key={song.id} className="flex items-center gap-4 p-2 rounded-xl active:bg-white/5" onClick={() => playSong(song)}>
                      <img src={song.image} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-base font-bold text-white truncate">{song.title}</span>
                        <span className="text-sm text-white/50 truncate">{song.artist}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); downloads.some(d => d.id === song.id) ? handleRemoveDownload(song.id, e) : (downloadProgress[song.id] === undefined ? handleDownload(song, e) : null); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 shrink-0"
                      >
                        {downloads.some(d => d.id === song.id) ? (
                          <CheckCircle2 className="w-4 h-4 text-[#D4FF00]" />
                        ) : downloadProgress[song.id] !== undefined ? (
                          <div className="relative flex items-center justify-center w-4 h-4">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                            {typeof downloadProgress[song.id] === 'number' && <span className="absolute text-[6px] font-bold text-white leading-none">{downloadProgress[song.id]}</span>}
                          </div>
                        ) : (
                          <ArrowDownToLine className="w-4 h-4 text-white/50" />
                        )}
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 shrink-0">
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openPlaylistMenu(song, e); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 shrink-0"
                      >
                        <MoreHorizontal className="w-5 h-5 text-white/50" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LIBRARY TAB */}
          {mobileTab === "library" && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-500">
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold uppercase tracking-widest text-white/80">Your Playlists</h2>
                <div className="grid grid-cols-2 gap-4">
                  {playlists.map(playlist => (
                    <div 
                      key={playlist.id} 
                      className="bg-white/5 rounded-2xl p-4 flex flex-col gap-4 active:bg-white/10"
                      onClick={() => { setActivePlaylistId(playlist.id); setMobileTab("playlistView"); }}
                    >
                      <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shadow-inner overflow-hidden">
                        {playlist.songs.length > 0 ? (
                           <img src={playlist.songs[0].image} className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                        ) : (
                           <ListMusic className="w-8 h-8 text-white/20" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white truncate">{playlist.name}</span>
                        <span className="text-xs text-white/50">{playlist.songs.length} songs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PLAYLIST VIEW TAB */}
          {mobileTab === "playlistView" && (() => {
            const activePlaylist = playlists.find(p => p.id === activePlaylistId);
            if (!activePlaylist) return null;
            return (
              <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-32">
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <button onClick={() => setMobileTab("library")} className="p-2 -ml-2 text-white/70 active:text-white">
                    <ChevronDown className="w-8 h-8 rotate-90" />
                  </button>
                  <h2 className="text-2xl font-black uppercase tracking-widest text-white truncate">{activePlaylist.name}</h2>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white/50">{activePlaylist.songs.length} songs</span>
                  <button 
                    onClick={() => {
                      if (activePlaylist.songs.length > 0) {
                        playSong(activePlaylist.songs[0], true, "playlist", activePlaylist.songs);
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D4FF00] text-black rounded-full font-bold active:scale-95 transition-transform"
                  >
                    <Play className="w-5 h-5 fill-current" /> Play All
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {activePlaylist.songs.map((song, i) => (
                    <div key={song.id} className="flex items-center gap-4 p-2 rounded-xl active:bg-white/5">
                      <div className="flex-1 min-w-0" onClick={() => playSong(song, true, "playlist", activePlaylist.songs)}>
                        <div className="flex items-center gap-4">
                          <img src={song.image} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-base font-bold text-white truncate">{song.title}</span>
                            <span className="text-sm text-white/50 truncate">{song.artist}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); downloads.some(d => d.id === song.id) ? handleRemoveDownload(song.id, e) : (downloadProgress[song.id] === undefined ? handleDownload(song, e) : null); }}
                        className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 shrink-0"
                      >
                        {downloads.some(d => d.id === song.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-[#D4FF00]" />
                        ) : downloadProgress[song.id] !== undefined ? (
                          <div className="relative flex items-center justify-center w-5 h-5">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                            {typeof downloadProgress[song.id] === 'number' && <span className="absolute text-[8px] font-bold text-white leading-none">{downloadProgress[song.id]}</span>}
                          </div>
                        ) : (
                          <ArrowDownToLine className="w-5 h-5 text-white/50" />
                        )}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openPlaylistMenu(song, e); }}
                        className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 shrink-0"
                      >
                        <MoreHorizontal className="w-5 h-5 text-white/50" />
                      </button>
                    </div>
                  ))}
                  {activePlaylist.songs.length === 0 && (
                     <div className="py-20 text-center flex flex-col items-center opacity-50">
                       <ListMusic className="w-12 h-12 mb-4" />
                       <span className="font-bold">Playlist is empty</span>
                     </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>

        {/* BOTTOM HUD (Mini Player + Nav) */}
        <div className="fixed bottom-0 left-0 right-0 flex flex-col z-50 pointer-events-none">
          
          {/* Mini Player */}
          {currentSong && (
            <div className="px-4 pb-3 pointer-events-auto">
              <div 
                className="w-full bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setShowMobilePlayer(true)}
              >
                <div className="w-12 h-12 relative rounded-xl overflow-hidden shrink-0">
                  <img src={currentSong.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-bold text-white truncate">{currentSong.title}</span>
                  <span className="text-xs text-[#D4FF00] truncate">{currentSong.artist}</span>
                </div>
                <div className="flex items-center gap-2 pr-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => toggleLike(currentSong, e)}
                    className="p-2"
                  >
                    <Heart className={`w-5 h-5 ${playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong.id) ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-white/40'}`} />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                  >
                    {playbackState === "loading" || playbackState === "buffering" ? (
                      <Loader2 className="w-5 h-5 animate-spin text-black" />
                    ) : isPlaying ? (
                      <Pause className="w-5 h-5 fill-black text-black" />
                    ) : (
                      <Play className="w-5 h-5 fill-black text-black ml-1" />
                    )}
                  </button>
                </div>
                {/* Mini Progress Bar */}
                <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#D4FF00] transition-all duration-200"
                    style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="w-full bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] px-8 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto">
            <button 
              onClick={() => setMobileTab("home")}
              className={`flex flex-col items-center gap-1 transition-colors ${mobileTab === "home" ? "text-[#D4FF00]" : "text-white/50"}`}
            >
              <Home className={`w-6 h-6 ${mobileTab === "home" ? "fill-[#D4FF00]" : ""}`} />
              <span className="text-[9px] font-bold tracking-widest uppercase">Home</span>
            </button>
            <button 
              onClick={() => setMobileTab("discover")}
              className={`flex flex-col items-center gap-1 transition-colors ${mobileTab === "discover" ? "text-[#D4FF00]" : "text-white/50"}`}
            >
              <Compass className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-widest uppercase">Discover</span>
            </button>
            <button 
              onClick={() => setMobileTab("search")}
              className={`flex flex-col items-center gap-1 transition-colors ${mobileTab === "search" ? "text-[#D4FF00]" : "text-white/50"}`}
            >
              <Search className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-widest uppercase">Search</span>
            </button>
            <button 
              onClick={() => setMobileTab("library")}
              className={`flex flex-col items-center gap-1 transition-colors ${mobileTab === "library" ? "text-[#D4FF00]" : "text-white/50"}`}
            >
              <Library className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-widest uppercase">Library</span>
            </button>
            <button 
              onClick={() => setMobileTab("downloads")}
              className={`flex flex-col items-center gap-1 transition-colors ${mobileTab === "downloads" ? "text-[#D4FF00]" : "text-white/50"}`}
            >
              <ArrowDownToLine className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-widest uppercase">Offline</span>
            </button>
          </div>
        </div>

        {/* FULL SCREEN PLAYER OVERLAY */}
        <AnimatePresence>
          {showMobilePlayer && currentSong && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[100] bg-[#050505] flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
            >
              {/* Ambient Background */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#020005]">
                <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[120%] bg-blue-700/30 rounded-full blur-[100px] mix-blend-screen opacity-60" />
                <div className="absolute top-[20%] right-[5%] w-[80%] h-[80%] bg-fuchsia-600/30 rounded-full blur-[120px] mix-blend-screen opacity-70" />
                <div className="absolute bottom-[10%] -left-[10%] w-[60%] h-[60%] bg-[#D4FF00]/10 rounded-full blur-[100px] mix-blend-screen opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                <img src={currentSong.image} className="absolute inset-0 w-full h-full object-cover blur-[150px] opacity-30 scale-150 mix-blend-screen" />
              </div>

              {/* Header */}
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
              </div>

              {/* Artwork */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 max-h-[50vh]">
                <motion.div 
                  className="w-full aspect-square rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10"
                  layoutId="mobile-album-art"
                >
                  <img src={currentSong.image} className="w-full h-full object-cover" />
                </motion.div>
              </div>

              {/* Controls & Info */}
              <div className="relative z-10 flex flex-col gap-8 p-8 pb-12">
                <div className="flex items-end justify-between">
                  <div className="flex flex-col min-w-0 flex-1 pr-4">
                    <motion.span 
                      key={`m-title-${currentSong.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl font-black text-white truncate mb-1"
                    >
                      {currentSong.title}
                    </motion.span>
                    <motion.span 
                      key={`m-artist-${currentSong.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg font-medium text-white/50 truncate"
                    >
                      {currentSong.artist}
                    </motion.span>
                  </div>
                  <button 
                    onClick={(e) => toggleLike(currentSong, e)}
                    className="p-3 shrink-0 bg-white/5 rounded-full"
                  >
                    <Heart className={`w-6 h-6 ${playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong.id) ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-white'}`} />
                  </button>
                </div>
                {/* Timeline */}
                <div className="flex flex-col gap-2">
                  <div 
                    className="w-full py-4 -my-4 cursor-pointer flex items-center justify-center touch-none"
                    onPointerDown={(e) => {
                      setIsDraggingTimeline(true);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      setDragProgress(percentage * duration);
                    }}
                    onPointerMove={(e) => {
                      if (!isDraggingTimeline) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      setDragProgress(percentage * duration);
                    }}
                    onPointerUp={(e) => {
                      if (!isDraggingTimeline) return;
                      setIsDraggingTimeline(false);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      const newTime = percentage * duration;
                      if (useNativeAudio && audioRef.current) audioRef.current.currentTime = newTime;
                      if (playerRef.current) playerRef.current.seekTo(newTime, true);
                      setProgress(newTime);
                    }}
                    onPointerCancel={() => setIsDraggingTimeline(false)}
                  >
                    <div className="w-full h-1.5 bg-white/10 rounded-full relative pointer-events-none transition-all duration-200">
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-[#D4FF00] transition-none"
                          style={{ width: `${duration ? ((isDraggingTimeline ? dragProgress : progress) / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <div 
                        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_#D4FF00] transition-opacity ${isDraggingTimeline ? 'opacity-100' : 'opacity-0'}`}
                        style={{ left: `calc(${duration ? ((isDraggingTimeline ? dragProgress : progress) / duration) * 100 : 0}% - 8px)` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-white/40 tracking-widest tabular-nums">
                    <span>{Math.floor((isDraggingTimeline ? dragProgress : progress) / 60)}:{(Math.floor((isDraggingTimeline ? dragProgress : progress) % 60)).toString().padStart(2, "0")}</span>
                    <span>-{Math.floor((duration - (isDraggingTimeline ? dragProgress : progress)) / 60)}:{(Math.floor((duration - (isDraggingTimeline ? dragProgress : progress)) % 60)).toString().padStart(2, "0")}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-between w-full">
                  <button onClick={() => setIsShuffleOn(!isShuffleOn)} className={`p-3 rounded-full bg-white/5 active:bg-white/10 transition-colors ${isShuffleOn ? 'text-[#D4FF00]' : 'text-white/40'}`} aria-label="Shuffle">
                    <Shuffle className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-6">
                    <button onClick={playPreviousSong} className="text-white active:text-white/70 active:scale-90 transition-transform" aria-label="Previous song">
                      <SkipBack className="w-10 h-10 fill-current" />
                    </button>
                    <button 
                      onClick={togglePlay}
                      className="w-20 h-20 bg-[#D4FF00] text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,255,0,0.2)] active:scale-95 transition-transform"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {playbackState === "loading" || playbackState === "buffering" ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-10 h-10 fill-current" />
                      ) : (
                        <Play className="w-10 h-10 fill-current ml-1" />
                      )}
                    </button>
                    <button onClick={playNextSong} className="text-white active:text-white/70 active:scale-90 transition-transform" aria-label="Next song">
                      <SkipForward className="w-10 h-10 fill-current" />
                    </button>
                  </div>
                  <button className="p-3 rounded-full bg-white/5 active:bg-white/10 transition-colors text-white/40" aria-label="Repeat">
                    <Repeat className="w-5 h-5" />
                  </button>
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-between w-full px-4 mt-2">
                  <div className="relative">
                    <button onClick={(e) => handleShare(currentSong, e)} className="p-2 text-white/40 hover:text-white transition-transform active:scale-90" aria-label="Share">
                      <Share className="w-6 h-6" />
                    </button>
                    {copiedLink && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#D4FF00] text-black text-xs font-bold px-2 py-1 rounded whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2">
                        Link copied
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setShowVolumeSlider(!showVolumeSlider)} 
                      className="p-2 text-white/40 hover:text-white transition-transform active:scale-90"
                      aria-label="Volume"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : volume < 0.5 ? <Volume1 className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-xl z-[60] flex items-center justify-center h-32 w-12"
                        >
                          <div className="relative w-full h-full flex items-center justify-center">
                            <input 
                              type="range" min="0" max="1" step="0.01" 
                              value={isMuted ? 0 : volume} 
                              onChange={(e) => { setIsMuted(false); setVolume(parseFloat(e.target.value)); }} 
                              className="appearance-none bg-white/20 h-1 w-24 rounded-full outline-none transform -rotate-90 origin-center cursor-pointer absolute"
                              style={{ WebkitAppearance: 'none', background: `linear-gradient(to right, #D4FF00 0%, #D4FF00 ${(isMuted ? 0 : volume)*100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume)*100}%, rgba(255,255,255,0.2) 100%)` }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button onClick={() => { setIsQueueExpanded(!isQueueExpanded); setIsLyricsExpanded(false); }} className={`p-2 transition-transform active:scale-90 ${isQueueExpanded ? 'text-white' : 'text-white/40 hover:text-white'}`} aria-label="Queue">
                    <ListMusic className="w-6 h-6" />
                  </button>
                </div>

                {/* Lyrics Toggle */}
                <button 
                  onClick={() => { setIsLyricsExpanded(!isLyricsExpanded); setIsQueueExpanded(false); }}
                  className={`mt-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-colors ${isLyricsExpanded ? 'bg-[#D4FF00] text-black' : 'bg-white/10 text-white active:bg-white/20'}`}
                >
                  <Quote className="w-4 h-4" />
                  {isLyricsExpanded ? "Hide Lyrics" : "Show Lyrics"}
                </button>
              </div>

              {/* Expandable Queue Sheet */}
              <AnimatePresence>
                {isQueueExpanded && (
                  <motion.div 
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl flex flex-col pt-12"
                  >
                    <div className="flex items-center justify-between p-6 pb-2 border-b border-white/10">
                      <h2 className="text-lg font-black uppercase tracking-widest text-white">Queue</h2>
                      <button onClick={() => setIsQueueExpanded(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90">
                        <ChevronDown className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-32">
                      {playbackHistory.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest px-2">Previously Played</h3>
                          {playbackHistory.map((song, i) => (
                            <div key={i} className="opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                              <SongBox song={song} index={i} onPlay={() => playSong(song)} isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === song.id) ?? false} onToggleFavorite={(e) => toggleLike(song, e)} onOpenMenu={(e) => openPlaylistMenu(song, e)} isDownloaded={downloads.some(d => d.id === song.id)} downloadProgress={downloadProgress[song.id]} onDownload={(e) => handleDownload(song, e)} onRemoveDownload={(e) => handleRemoveDownload(song.id, e)} />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-col gap-2 relative">
                        <h3 className="text-sm font-bold text-[#D4FF00] uppercase tracking-widest px-2">Now Playing</h3>
                        <div className="ring-2 ring-[#D4FF00] rounded-xl overflow-hidden">
                          <SongBox song={currentSong} index={0} onPlay={() => {}} isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong.id) ?? false} onToggleFavorite={(e) => toggleLike(currentSong, e)} onOpenMenu={(e) => openPlaylistMenu(currentSong, e)} isDownloaded={downloads.some(d => d.id === currentSong.id)} downloadProgress={downloadProgress[currentSong.id]} onDownload={(e) => handleDownload(currentSong, e)} onRemoveDownload={(e) => handleRemoveDownload(currentSong.id, e)} />
                        </div>
                      </div>
                      {relatedSongs.filter(s => s.id !== currentSong.id).length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest px-2">Up Next</h3>
                          {relatedSongs.filter(s => s.id !== currentSong.id).map((song, i) => (
                            <SongBox key={song.id} song={song} index={i} onPlay={() => playSong(song)} isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === song.id) ?? false} onToggleFavorite={(e) => toggleLike(song, e)} onOpenMenu={(e) => openPlaylistMenu(song, e)} isDownloaded={downloads.some(d => d.id === song.id)} downloadProgress={downloadProgress[song.id]} onDownload={(e) => handleDownload(song, e)} onRemoveDownload={(e) => handleRemoveDownload(song.id, e)} />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expandable Lyrics Sheet */}
              <AnimatePresence>
                {isLyricsExpanded && (
                  <motion.div 
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl flex flex-col pt-12"
                  >
                    <div className="flex items-center justify-between p-6 pb-2 border-b border-white/10">
                      <h2 className="text-lg font-black uppercase tracking-widest text-white">Lyrics</h2>
                      <button onClick={() => setIsLyricsExpanded(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90">
                        <ChevronDown className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 pb-32">
                      {lyricsLoading ? (
                        <div className="flex items-center justify-center h-full text-[#D4FF00]"><Loader2 className="w-8 h-8 animate-spin" /></div>
                      ) : lyrics.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-white/30 font-bold uppercase tracking-widest">No lyrics found</div>
                      ) : (
                        lyrics.map((line, i) => {
                          const activeIndex = lyrics.reduce((acc, l, idx) => (progress >= l.time ? idx : acc), 0);
                          const isActive = i === activeIndex;
                          const isPast = i < activeIndex;
                          return (
                            <div 
                              key={i} 
                              onClick={() => {
                                if (useNativeAudio && audioRef.current) audioRef.current.currentTime = line.time;
                                if (playerRef.current) playerRef.current.seekTo(line.time, true);
                                setProgress(line.time);
                              }}
                              className={`text-2xl md:text-3xl font-black tracking-tight transition-all duration-300 cursor-pointer ${isActive ? 'text-white scale-[1.02] origin-left drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : isPast ? 'text-white/30' : 'text-white/50'}`}
                            >
                              {line.text}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* FULLSCREEN ERROR OVERLAY */}
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
      
      {/* MOBILE SCREEN OFF OVERLAY */}
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
    </div>
  );
}
