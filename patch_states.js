const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);`;
const replaceStr = `  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [isQueueExpanded, setIsQueueExpanded] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
