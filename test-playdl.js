const play = require('play-dl');
play.stream('dQw4w9WgXcQ').then(stream => {
  console.log("Stream URL:", stream.url);
}).catch(console.error);
