const https = require('https');
https.get('https://lrclib.net/api/search?track_name=Despacito&artist_name=Luis%20Fonsi', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Data length:', data.length));
});
