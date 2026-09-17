const url = 'https://invidious.tiekoetter.com/latest_version?id=dQw4w9WgXcQ&itag=140';
fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
  }
}).then(res => {
  console.log(res.status, res.headers);
}).catch(console.error);
