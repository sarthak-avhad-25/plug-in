const YTMusic = require('ytmusic-api');
async function test() {
  const ytm = new YTMusic();
  await ytm.initialize();
  const songs = await ytm.searchSongs('Arijit Singh');
  console.log(songs.slice(0, 3).map(s => s.name + ' - ' + s.artist.name));
}
test();
