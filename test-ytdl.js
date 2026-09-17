const ytdl = require('@distube/ytdl-core');
ytdl.getInfo('dQw4w9WgXcQ').then(info => {
  const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });
  console.log("Format URL:", format.url);
}).catch(console.error);
