const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const fixSongBox = (str) => {
  return str.replace(/<SongBox (key=\{[^}]+\} )?song=\{([^}]+)\} index=\{([^}]+)\} onPlay=\{([^}]+)\} \/>/g, 
  "<SongBox $1song={$2} index={$3} onPlay={$4} isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === $2.id) ?? false} onToggleFavorite={(e) => toggleLike($2, e)} onOpenMenu={(e) => openPlaylistMenu($2, e)} isDownloaded={downloads.some(d => d.id === $2.id)} downloadProgress={downloadProgress[$2.id]} onDownload={(e) => handleDownload($2, e)} onRemoveDownload={(e) => handleRemoveDownload($2.id, e)} />");
};

code = fixSongBox(code);

fs.writeFileSync('src/app/page.tsx', code);
