import YTMusic from "ytmusic-api";

async function run() {
  const ytm = new YTMusic();
  await ytm.initialize();
  const res = await ytm.searchSongs("Despacito");
  console.log(res[0].thumbnails);
}
run();
