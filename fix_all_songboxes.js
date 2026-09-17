const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = 'onOpenMenu={(e) => openPlaylistMenu(song, e)} \n                        />';
// wait, the whitespace varies. Let's use a standard replace with a regex string.

const regex = /onOpenMenu=\{\(e\) => openPlaylistMenu\(song, e\)\}\s*\/>/g;
const replacement = 'onOpenMenu={(e) => openPlaylistMenu(song, e)}\n  isDownloaded={downloads.some(d => d.id === song.id)}\n  downloadProgress={downloadProgress[song.id]}\n  onDownload={(e) => handleDownload(song, e)}\n  onRemoveDownload={(e) => handleRemoveDownload(song.id, e)}\n/>';

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/page.tsx', code);
