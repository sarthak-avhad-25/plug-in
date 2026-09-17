const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `  const toggleLike = (song: Song, e: React.MouseEvent) => {`;
const replaceStr = `  const handleShare = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!song) return;
    const url = window.location.origin + '?v=' + song.id;
    if (navigator.share) {
      try {
        await navigator.share({
          title: song.title,
          text: \`Check out \${song.title} by \${song.artist}\`,
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

  const toggleLike = (song: Song, e: React.MouseEvent) => {`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
