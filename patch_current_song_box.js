const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `<SongBox song={currentSong} index={0} onPlay={() => {}} />`;
const replaceStr = `<SongBox song={currentSong} index={0} onPlay={() => {}} isFavorite={playlists.find(p => p.id === 'liked-songs')?.songs.some(s => s.id === currentSong.id) ?? false} onToggleFavorite={(e) => toggleLike(currentSong, e)} onOpenMenu={(e) => openPlaylistMenu(currentSong, e)} isDownloaded={downloads.some(d => d.id === currentSong.id)} downloadProgress={downloadProgress[currentSong.id]} onDownload={(e) => handleDownload(currentSong, e)} onRemoveDownload={(e) => handleRemoveDownload(currentSong.id, e)} />`;

code = code.split(targetStr).join(replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
