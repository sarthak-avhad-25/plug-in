const https = require('https');
const url = 'https://lrclib.net/api/search?track_name=Despacito&artist_name=Luis%20Fonsi';
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const result = json.find(d => d.syncedLyrics);
    console.log(result ? 'Found lyrics' : 'No lyrics');
    if(result) {
       const lines = result.syncedLyrics.split('\n');
       console.log('Lines:', lines.length);
       const match = lines[0].match(/^\[(\d+):(\d+\.\d+)\](.*)/);
       console.log('Match:', match);
    }
  });
});
