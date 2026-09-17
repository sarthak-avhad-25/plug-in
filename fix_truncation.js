const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetSongBox = `    {/* Title & Artist */}
    <div className="flex flex-col flex-1 overflow-hidden min-w-0">
      <span className="text-white text-sm font-semibold truncate leading-tight">
        {song.title}
      </span>
      <span className="text-gray-400 text-xs truncate mt-0.5 group-hover:text-white transition-colors duration-200">
        {song.artist}
      </span>
    </div>`;
const replaceSongBox = `    {/* Title & Artist */}
    <div className="flex flex-col flex-1 overflow-hidden min-w-0">
      <span className="text-white text-sm font-semibold whitespace-normal break-words leading-tight">
        {song.title}
      </span>
      <span className="text-gray-400 text-xs whitespace-normal break-words mt-0.5 group-hover:text-white transition-colors duration-200">
        {song.artist}
      </span>
    </div>`;

code = code.replace(targetSongBox, replaceSongBox);

fs.writeFileSync('src/app/page.tsx', code);
