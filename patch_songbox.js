const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetSignature = `const SongBox = ({ song, index, onPlay, isFavorite, onToggleFavorite, onOpenMenu }: { song: Song, index: number, onPlay: (e: React.MouseEvent) => void, isFavorite: boolean, onToggleFavorite: (e: React.MouseEvent) => void, onOpenMenu?: (e: React.MouseEvent) => void }) => (`;
const replaceSignature = `const SongBox = ({ song, index, onPlay, isFavorite, onToggleFavorite, onOpenMenu, isDownloaded, downloadProgress, onDownload, onRemoveDownload }: { song: Song, index: number, onPlay: (e: React.MouseEvent) => void, isFavorite: boolean, onToggleFavorite: (e: React.MouseEvent) => void, onOpenMenu?: (e: React.MouseEvent) => void, isDownloaded?: boolean, downloadProgress?: number | 'indeterminate', onDownload?: (e: React.MouseEvent) => void, onRemoveDownload?: (e: React.MouseEvent) => void }) => (`;

code = code.replace(targetSignature, replaceSignature);

const targetMenu = `    <div className="flex items-center gap-1 shrink-0 ml-2">
      <button 
        onClick={onToggleFavorite}
        className="p-2.5 rounded-full hover:bg-white/10 active:scale-90 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <Heart className={\`w-4 h-4 \${isFavorite ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-gray-400 hover:text-white'}\`} />
      </button>
      {onOpenMenu && (
        <button 
          onClick={onOpenMenu}
          className="p-2.5 rounded-full hover:bg-white/10 active:scale-90 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-white"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )}
    </div>`;
const replaceMenu = `    <div className="flex items-center gap-1 shrink-0 ml-2">
      {onDownload && (
        <button 
          onClick={isDownloaded ? onRemoveDownload : (downloadProgress === undefined ? onDownload : undefined)}
          className="p-2.5 rounded-full hover:bg-white/10 active:scale-90 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
        >
          {isDownloaded ? (
            <CheckCircle2 className="w-4 h-4 text-[#D4FF00]" />
          ) : downloadProgress !== undefined ? (
            <div className="relative flex items-center justify-center w-4 h-4">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
              {typeof downloadProgress === 'number' && <span className="absolute text-[8px] font-bold text-white leading-none">{downloadProgress}</span>}
            </div>
          ) : (
            <ArrowDownToLine className="w-4 h-4 text-gray-400 hover:text-white" />
          )}
        </button>
      )}
      <button 
        onClick={onToggleFavorite}
        className="p-2.5 rounded-full hover:bg-white/10 active:scale-90 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <Heart className={\`w-4 h-4 \${isFavorite ? 'fill-[#D4FF00] text-[#D4FF00]' : 'text-gray-400 hover:text-white'}\`} />
      </button>
      {onOpenMenu && (
        <button 
          onClick={onOpenMenu}
          className="p-2.5 rounded-full hover:bg-white/10 active:scale-90 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-white"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )}
    </div>`;

code = code.replace(targetMenu, replaceMenu);

fs.writeFileSync('src/app/page.tsx', code);
