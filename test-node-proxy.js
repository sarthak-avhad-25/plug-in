const https = require('https');
const http = require('http');

function fetchProxy(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log("Redirecting to", res.headers.location);
        fetchProxy(res.headers.location).then(resolve).catch(reject);
      } else {
        console.log("Status:", res.statusCode);
        resolve(res);
      }
    }).on('error', reject);
  });
}

fetchProxy('https://invidious.tiekoetter.com/latest_version?id=dQw4w9WgXcQ&itag=140').then(res => {
  console.log("Final status:", res.statusCode);
});
