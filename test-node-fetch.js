fetch('https://invidious.tiekoetter.com/latest_version?id=dQw4w9WgXcQ&itag=140', { redirect: 'follow' })
  .then(res => { console.log(res.status, res.headers); })
  .catch(console.error);
