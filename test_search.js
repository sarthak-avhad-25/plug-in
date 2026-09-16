const YTMusic = require('ytmusic-api');
async function test() {
  const ytm = new YTMusic();
  await ytm.initialize();
  const songs = await ytm.searchSongs('Infinity');
  console.log(songs.slice(0, 3));
}
test();
