import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { SyncedLyric } from '../actions';

interface LiveLyricsProps {
  lyrics: SyncedLyric[];
  isLoading: boolean;
  progress: number;
  onSeek: (time: number) => void;
  isExpanded?: boolean;
}

export function LiveLyrics({ lyrics, isLoading, progress, onSeek, isExpanded = false }: LiveLyricsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derive active lyric based on actual playback time
  const activeIndex = lyrics.length > 0 
    ? lyrics.reduce((acc, l, idx) => (progress >= l.time ? idx : acc), 0)
    : -1;

  const handleUserScroll = () => {
    setUserScrolled(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    
    // Automatically resume auto-following after 4 seconds of inactivity
    resumeTimeoutRef.current = setTimeout(() => {
      setUserScrolled(false);
    }, 4000);
  };

  useEffect(() => {
    if (!userScrolled && containerRef.current && activeIndex >= 0) {
      const activeEl = containerRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        // Smoothly center the active lyric in the container using math to strictly prevent window jumping
        const containerHeight = containerRef.current.clientHeight;
        const scrollPos = activeEl.offsetTop - (containerHeight / 2) + (activeEl.clientHeight / 2);
        containerRef.current.scrollTo({ top: Math.max(0, scrollPos), behavior: 'smooth' });
      }
    }
  }, [activeIndex, userScrolled]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center opacity-50 relative z-10">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4FF00] mb-3" />
        <span className="text-xs font-bold tracking-widest text-[#D4FF00]">SYNCING LYRICS</span>
      </div>
    );
  }

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center opacity-30 relative z-10">
        <span className="text-sm font-bold tracking-widest text-white/50 uppercase">Lyrics unavailable for this track</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full flex flex-col border border-white/5 bg-black/40 rounded-3xl overflow-hidden shadow-inner my-4 ${isExpanded ? 'h-full flex-1 border-none bg-transparent my-0 rounded-none' : 'h-[350px] md:h-[450px]'}`}>
      
      {/* Top/Bottom gradient masks for fade effect */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />

      {/* Jump to live lyric button */}
      {userScrolled && (
        <div className="absolute bottom-6 right-6 z-20">
          <button 
            onClick={() => setUserScrolled(false)}
            className="bg-[#D4FF00] text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(212,255,0,0.5)] hover:scale-105 transition-transform"
          >
            Jump to Live
          </button>
        </div>
      )}

      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        onWheel={handleUserScroll}
        onTouchMove={handleUserScroll}
        onMouseDown={handleUserScroll}
        className="w-full h-full overflow-y-auto scrollbar-hide py-[50%] px-6 md:px-12 scroll-smooth flex flex-col gap-6 md:gap-8 relative z-0"
      >
        {lyrics.map((line, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;

          return (
            <div 
              key={i} 
              onClick={() => {
                onSeek(line.time);
                setUserScrolled(false);
              }}
              className="cursor-pointer transition-all duration-500 ease-out flex flex-wrap items-center justify-start origin-left"
              style={{
                opacity: isActive ? 1 : (isPast ? 0.3 : 0.4),
                transform: isActive ? 'scale(1.05)' : 'scale(0.95)',
                filter: isActive ? 'blur(0px)' : 'blur(0.5px)',
              }}
            >
              {/* Highlight word-by-word if supported, otherwise line-by-line */}
              {line.words ? line.words.map((w, wIdx) => {
                const isWordActive = isActive && progress >= w.time;
                return (
                  <span 
                    key={wIdx} 
                    className="inline-block mr-2 md:mr-3 transition-all duration-300 ease-out"
                    style={{
                      color: isWordActive ? '#D4FF00' : (isActive ? '#ffffff' : '#a3a3a3'),
                      textShadow: isWordActive 
                        ? '0px 0px 15px rgba(212,255,0,0.4), 0px 0px 30px rgba(212,255,0,0.2)' 
                        : (isActive ? '0px 0px 10px rgba(255,255,255,0.2)' : 'none'),
                      transform: isWordActive ? 'translateY(-2px)' : 'translateY(0px)',
                    }}
                  >
                    {w.text}
                  </span>
                )
              }) : (
                <span 
                  className="inline-block transition-all duration-500 ease-out text-2xl md:text-4xl font-black tracking-tight leading-tight"
                  style={{ 
                    color: isActive ? '#D4FF00' : (isActive ? '#ffffff' : '#a3a3a3'),
                    textShadow: isActive ? '0px 0px 20px rgba(212,255,0,0.3)' : 'none'
                  }}
                >
                  {line.text}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}
