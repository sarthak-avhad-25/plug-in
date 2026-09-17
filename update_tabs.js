const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Add showDownloads state
code = code.replace(
  `  const [showPlaylist, setShowPlaylist] = useState(false);`,
  `  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);`
);

// 2. Clear it when clicking LISTEN WITH (home)
code = code.replace(
  `onClick={() => { setHasSearched(false); setShowPlaylist(false); setArtistQuery(""); setSongQuery(""); setSearchResults([]); }}`,
  `onClick={() => { setHasSearched(false); setShowPlaylist(false); setShowDownloads(false); setArtistQuery(""); setSongQuery(""); setSearchResults([]); }}`
);

// 3. Clear it when clicking a playlist
code = code.replace(
  `onClick={() => { setActivePlaylistId(p.id); setShowPlaylist(true); setHasSearched(false); setIsEditingPlaylist(false); }}`,
  `onClick={() => { setActivePlaylistId(p.id); setShowPlaylist(true); setShowDownloads(false); setHasSearched(false); setIsEditingPlaylist(false); }}`
);

fs.writeFileSync('src/app/page.tsx', code);
