const play = require('play-dl');
async function test() {
  const stream = await play.stream('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  console.log(stream.type, typeof stream.stream.on);
}
test();
