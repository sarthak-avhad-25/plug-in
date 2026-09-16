const fs = require('fs');

let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Update mobileTab state
code = code.replace(
  /useState<"home" \| "search" \| "library">\("home"\);/,
  'useState<"home" | "discover" | "search" | "library">("home");'
);

// Find the start of the mobile block
const mobileStartMarker = '{/* MOBILE VIEW (Apple Music Style) */}';
const mobileStartIndex = code.indexOf(mobileStartMarker);

if (mobileStartIndex === -1) {
  console.error("Could not find mobile view block");
  process.exit(1);
}

// Slice off the old mobile view
let newCode = code.substring(0, mobileStartIndex);

// Construct new Mobile View
const mobileView = `      {/* MOBILE VIEW (Plug-In Custom Design) */}
      <div className="flex md:hidden w-full h-[100dvh] flex-col bg-[#050505] text-[#F5F5F5] relative overflow-hidden font-sans">
        
        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pb-[140px] px-6 scrollbar-hide pt-12 transition-opacity duration-300" style={{ WebkitOverflowScrolling: 'touch' }}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-white">
              {mobileTab === 'home' && "Plug-In"}
              {mobileTab === 'discover' && "Discover"}
              {mobileTab === 'search' && "Search"}
              {mobileTab === 'library' && "Library"}
            </h1>
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-xl shadow-lg border border-white/10 text-white cursor-pointer" onClick={() => setShowProfileModal(true)}>
              {activeProfile ? activeProfile.emoji : '👤'}
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
                  <h3 className="text-lg font-bold uppercase tracking-widest text-[#D4FF00]">Recently Played</h3>
                  <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                    {[...playbackHistory].reverse().slice(0, 10).map((song, i) => (
                      <div key={i} className="min-w-[140px] max-w-[140px] flex flex-col gap-3 snap-start" onClick={() => playSong(song)}>
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
                <h3 className="text-lg font-bold uppercase tracking-widest text-white/80">Recommended For You</h3>
                <div className="flex flex-col gap-3">
                  {trendingWorldwide.slice(0, 5).map((song, i) => (
                    <div key={song.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 active:bg-white/10 transition-colors" onClick={() => playSong(song)}>
                      <img src={song.image} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-base font-bold text-white truncate">{song.title}</span>
                        <span className="text-sm text-white/50 truncate">{song.artist}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); togglePlaylistSong(song, e); }}
                        className="p-2"
                      >
                        <Heart className={\`w-5 h-5 \${playlists.some(p => p.songs.some(s => s.id === song.id)) ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-white/40'}\`} />
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
                <h3 className="text-lg font-bold uppercase tracking-widest text-[#D4FF00]">Trending Worldwide</h3>
                <div className="grid grid-cols-2 gap-4">
                  {trendingWorldwide.map(song => (
                    <div key={song.id} className="flex flex-col gap-2" onClick={() => playSong(song)}>
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
                      executeFullSearch(songQuery, "song");
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
                      onClick={() => { setSongQuery(sug); setSongSuggestions([]); executeFullSearch(sug, "song"); }}
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
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Results</h3>
                  {searchResults.map((song, i) => (
                    <div key={song.id} className="flex items-center gap-4 p-2 rounded-xl active:bg-white/5" onClick={() => playSong(song)}>
                      <img src={song.image} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-base font-bold text-white truncate">{song.title}</span>
                        <span className="text-sm text-white/50 truncate">{song.artist}</span>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10">
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
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
                <h3 className="text-lg font-bold uppercase tracking-widest text-white/80">Your Playlists</h3>
                <div className="grid grid-cols-2 gap-4">
                  {playlists.map(playlist => (
                    <div 
                      key={playlist.id} 
                      className="bg-white/5 rounded-2xl p-4 flex flex-col gap-4 active:bg-white/10"
                      onClick={() => { setActivePlaylistId(playlist.id); setMobileTab("home"); /* temp hack to just show it somewhere, ideally a sub-page */ }}
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

        </div>

        {/* BOTTOM HUD (Mini Player + Nav) */}
        <div className="absolute bottom-6 left-4 right-4 flex flex-col gap-3 z-50">
          
          {/* Mini Player */}
          {currentSong && (
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
                  onClick={(e) => togglePlaylistSong(currentSong, e)}
                  className="p-2"
                >
                  <Heart className={\`w-5 h-5 \${playlists.some(p => p.songs.some(s => s.id === currentSong.id)) ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-white/40'}\`} />
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-black text-black" /> : <Play className="w-5 h-5 fill-black text-black ml-1" />}
                </button>
              </div>
              {/* Mini Progress Bar */}
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#D4FF00] transition-all duration-200"
                  style={{ width: \`\${duration ? (progress / duration) * 100 : 0}%\` }}
                />
              </div>
            </div>
          )}

          {/* Pill Navigation */}
          <div className="w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            <button 
              onClick={() => setMobileTab("home")}
              className={\`flex flex-col items-center gap-1 transition-colors \${mobileTab === "home" ? "text-[#D4FF00]" : "text-white/50"}\`}
            >
              <Home className={\`w-6 h-6 \${mobileTab === "home" ? "fill-[#D4FF00]" : ""}\`} />
              <span className="text-[9px] font-bold tracking-widest uppercase">Home</span>
            </button>
            <button 
              onClick={() => setMobileTab("discover")}
              className={\`flex flex-col items-center gap-1 transition-colors \${mobileTab === "discover" ? "text-[#D4FF00]" : "text-white/50"}\`}
            >
              <Compass className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-widest uppercase">Discover</span>
            </button>
            <button 
              onClick={() => setMobileTab("search")}
              className={\`flex flex-col items-center gap-1 transition-colors \${mobileTab === "search" ? "text-[#D4FF00]" : "text-white/50"}\`}
            >
              <Search className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-widest uppercase">Search</span>
            </button>
            <button 
              onClick={() => setMobileTab("library")}
              className={\`flex flex-col items-center gap-1 transition-colors \${mobileTab === "library" ? "text-[#D4FF00]" : "text-white/50"}\`}
            >
              <Library className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-widest uppercase">Library</span>
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
              className="fixed inset-0 z-[100] bg-[#050505] flex flex-col"
            >
              {/* Blurred Ambient Background */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <img src={currentSong.image} className="w-full h-full object-cover blur-[100px] opacity-40 scale-150" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#050505]/80 to-[#050505]" />
              </div>

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between p-6 pt-12">
                <button onClick={() => setShowMobilePlayer(false)} className="p-2 -ml-2 text-white/70 active:text-white">
                  <ChevronDown className="w-8 h-8" />
                </button>
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">Now Playing</span>
                <button className="p-2 -mr-2 text-white/70 active:text-white">
                  <ListMusic className="w-6 h-6" />
                </button>
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
              <div className="relative z-10 flex flex-col gap-6 p-8 pb-12">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col min-w-0 flex-1 pr-4">
                    <span className="text-2xl font-black text-white truncate">{currentSong.title}</span>
                    <span className="text-lg text-[#D4FF00] truncate">{currentSong.artist}</span>
                  </div>
                  <button 
                    onClick={(e) => togglePlaylistSong(currentSong, e)}
                    className="p-2 shrink-0"
                  >
                    <Heart className={\`w-7 h-7 \${playlists.some(p => p.songs.some(s => s.id === currentSong.id)) ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-white'}\`} />
                  </button>
                </div>

                {/* Timeline */}
                <div className="flex flex-col gap-2">
                  <div 
                    className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percentage = clickX / rect.width;
                      const newTime = percentage * duration;
                      if (useNativeAudio && audioRef.current) audioRef.current.currentTime = newTime;
                      if (playerRef.current) playerRef.current.seekTo(newTime, true);
                      setProgress(newTime);
                    }}
                  >
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#D4FF00]"
                      style={{ width: \`\${duration ? (progress / duration) * 100 : 0}%\` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-medium text-white/50 tabular-nums">
                    <span>{Math.floor(progress / 60)}:{(Math.floor(progress % 60)).toString().padStart(2, "0")}</span>
                    <span>-{Math.floor((duration - progress) / 60)}:{(Math.floor((duration - progress) % 60)).toString().padStart(2, "0")}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-between w-full">
                  <button onClick={() => setIsShuffleOn(!isShuffleOn)} className={\`p-2 \${isShuffleOn ? 'text-[#D4FF00]' : 'text-white/40'}\`}>
                    <Shuffle className="w-6 h-6" />
                  </button>
                  <button onClick={playPreviousSong} className="p-2 text-white active:scale-90 transition-transform">
                    <SkipBack className="w-10 h-10 fill-current" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 transition-transform"
                  >
                    {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
                  </button>
                  <button onClick={playNextSong} className="p-2 text-white active:scale-90 transition-transform">
                    <SkipForward className="w-10 h-10 fill-current" />
                  </button>
                  <button className="p-2 text-white/40">
                    <Repeat className="w-6 h-6" />
                  </button>
                </div>

                {/* Lyrics Toggle */}
                <button 
                  onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
                  className={\`mt-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-colors \${isLyricsExpanded ? 'bg-[#D4FF00] text-black' : 'bg-white/10 text-white active:bg-white/20'}\`}
                >
                  <Quote className="w-4 h-4" />
                  {isLyricsExpanded ? "Hide Lyrics" : "Show Lyrics"}
                </button>
              </div>

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
                      <h3 className="text-lg font-black uppercase tracking-widest text-white">Lyrics</h3>
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
                              className={\`text-2xl md:text-3xl font-black tracking-tight transition-all duration-300 cursor-pointer \${isActive ? 'text-white scale-[1.02] origin-left drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : isPast ? 'text-white/30' : 'text-white/50'}\`}
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
    </div>
  );
}
`;

newCode += mobileView;

// Write it back
fs.writeFileSync('src/app/page.tsx', newCode);
console.log("Replaced mobile view!");
