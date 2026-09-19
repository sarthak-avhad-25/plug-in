import { getRelatedSongs, getSyncedLyrics } from '../src/app/actions';
async function test() {
  const songs = await getRelatedSongs('kJQP7kiw5Fk'); // Despacito
  console.log('Related Songs:', songs.length);
  const lyrics = await getSyncedLyrics('Despacito', 'Luis Fonsi');
  console.log('Lyrics:', lyrics.length);
}
test();
