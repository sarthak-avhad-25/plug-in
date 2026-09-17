const fs = require('fs');
let code = fs.readFileSync('src/app/components/LiveLyrics.tsx', 'utf-8');

const targetScroll = `        // Smoothly center the active lyric in the container
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });`;

const replaceScroll = `        // Smoothly center the active lyric in the container using math to strictly prevent window jumping
        const containerHeight = containerRef.current.clientHeight;
        const scrollPos = activeEl.offsetTop - (containerHeight / 2) + (activeEl.clientHeight / 2);
        containerRef.current.scrollTo({ top: Math.max(0, scrollPos), behavior: 'smooth' });`;

code = code.replace(targetScroll, replaceScroll);
fs.writeFileSync('src/app/components/LiveLyrics.tsx', code);
