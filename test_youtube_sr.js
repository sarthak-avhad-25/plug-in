const YouTubeSR = require('youtube-sr').default;
async function test() {
  const res = await YouTubeSR.search("Jaymes Young Infinity lyric video", { limit: 1, type: "video" });
  console.log(res[0].id, res[0].title);
}
test();
