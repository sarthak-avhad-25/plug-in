const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// The tricky part: there are multiple <SongBox calls. Let's find and replace them all globally by adding the extra props.
// We can use a regex to match the end of <SongBox ... /> props and insert our props.
code = code.replace(/<SongBox\s+([^>]+)onOpenMenu=\{\(e\) => openPlaylistMenu\(song, e\)\}\s*\/>/g, (match, p1) => {
  return `<SongBox 
      ${p1}onOpenMenu={(e) => openPlaylistMenu(song, e)}
      isDownloaded={downloads.some(d => d.id === song.id)}
      downloadProgress={downloadProgress[song.id]}
      onDownload={(e) => handleDownload(song, e)}
      onRemoveDownload={(e) => handleRemoveDownload(song.id, e)}
    />`;
});

fs.writeFileSync('src/app/page.tsx', code);
