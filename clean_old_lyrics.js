const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// We need to import LiveLyrics at the top
code = code.replace(
  'import { ProfileSelector } from "./ProfileSelector";',
  'import { ProfileSelector } from "./ProfileSelector";\nimport { LiveLyrics } from "./components/LiveLyrics";'
);

// We need to remove lines 516-528 approx (handleUserInteraction scroll logic)
// Actually we can just remove `lyricsContainerRef` and everything relying on it.
code = code.replace(/const lyricsContainerRef = useRef<HTMLDivElement>\(null\);/, '');

// Delete the first auto-scroll effect (lines 532-552)
const autoScrollRegex1 = /\/\/ Auto-scroll lyrics[\s\S]*?\}, \[progress, lyrics\]\);/;
code = code.replace(autoScrollRegex1, '');

// Delete the second auto-scroll effect (lines 859-873)
const autoScrollRegex2 = /if \(isLyricsExpanded\) \{[\s\S]*?if \(lyricsContainerRef\.current[\s\S]*?\}[\s\S]*?\}, \[isLyricsExpanded\]\);/;
code = code.replace(autoScrollRegex2, '  }, [isLyricsExpanded]);');

fs.writeFileSync('src/app/page.tsx', code);
