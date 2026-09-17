const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `import { Play, Pause, Search, Loader2, ArrowRight, SkipBack, SkipForward, Heart, GripVertical, Headphones, Maximize2, Minimize2, Trash2, Info, Home, Library, Compass, ChevronDown, MoreHorizontal, ListMusic, Quote, Check, Plus , Shuffle, Repeat, Volume2, Share, Power, ArrowDownToLine, CheckCircle2, XCircle, WifiOff } from "lucide-react";`;
const replaceStr = `import { Play, Pause, Search, Loader2, ArrowRight, SkipBack, SkipForward, Heart, GripVertical, Headphones, Maximize2, Minimize2, Trash2, Info, Home, Library, Compass, ChevronDown, MoreHorizontal, ListMusic, Quote, Check, Plus , Shuffle, Repeat, Volume2, Volume1, VolumeX, Share, Power, ArrowDownToLine, CheckCircle2, XCircle, WifiOff } from "lucide-react";`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
