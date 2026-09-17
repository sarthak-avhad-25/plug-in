const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetStr = `    {/* Favorite */}
    <button 
      onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}
      className={\`p-2 shrink-0 transition-all duration-200 hover:scale-110 \${isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}
    >
      <Heart className={\`w-4 h-4 \${isFavorite ? 'fill-[#1ED760] text-[#1ED760]' : 'text-gray-400 hover:text-white'}\`} />
    </button>
    
    {/* More Menu */}
    {onOpenMenu && (
      <button 
        onClick={(e) => { e.stopPropagation(); onOpenMenu(e); }}
        className="p-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-white" />
      </button>
    )}
  </div>`;

const replaceStr = `    {/* Download Button */}
    {onDownload && (
      <button 
        onClick={(e) => { e.stopPropagation(); isDownloaded ? (onRemoveDownload && onRemoveDownload(e)) : (downloadProgress === undefined ? onDownload(e) : null); }}
        className="p-2 shrink-0 transition-all duration-200 hover:scale-110 opacity-100 md:opacity-0 md:group-hover:opacity-100"
        aria-label="Download"
      >
        {isDownloaded ? (
          <CheckCircle2 className="w-4 h-4 text-[#D4FF00]" />
        ) : downloadProgress !== undefined ? (
          <div className="relative flex items-center justify-center w-4 h-4">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            {typeof downloadProgress === 'number' && <span className="absolute text-[7px] font-bold text-white leading-none">{downloadProgress}</span>}
          </div>
        ) : (
          <ArrowDownToLine className="w-4 h-4 text-gray-400 hover:text-white" />
        )}
      </button>
    )}

    {/* Favorite */}
    <button 
      onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}
      className={\`p-2 shrink-0 transition-all duration-200 hover:scale-110 \${isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}
    >
      <Heart className={\`w-4 h-4 \${isFavorite ? 'fill-[#1ED760] text-[#1ED760]' : 'text-gray-400 hover:text-white'}\`} />
    </button>
    
    {/* More Menu */}
    {onOpenMenu && (
      <button 
        onClick={(e) => { e.stopPropagation(); onOpenMenu(e); }}
        className="p-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-white" />
      </button>
    )}
  </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/app/page.tsx', code);
