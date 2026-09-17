const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [isQueueExpanded, setIsQueueExpanded] = useState(false);`;
const replaceStr = `  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [isQueueExpanded, setIsQueueExpanded] = useState(false);
  const [playerTab, setPlayerTab] = useState<"queue" | "lyrics" | "related" | null>(null);`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
