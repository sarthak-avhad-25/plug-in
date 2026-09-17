async function proxyStream() {
  const videoId = 'dQw4w9WgXcQ';
  let url = `https://invidious.tiekoetter.com/latest_version?id=${videoId}&itag=140`;
  
  const res1 = await fetch(url, { redirect: 'manual' });
  if (res1.status === 302 || res1.status === 307) {
    const loc = res1.headers.get('location');
    const cookie = res1.headers.get('set-cookie');
    console.log("Redirecting to:", loc);
    console.log("With Cookie:", cookie);
    
    if (loc) {
      const res2 = await fetch(loc, {
        headers: { 'Cookie': cookie, 'User-Agent': 'Mozilla/5.0' }
      });
      console.log("Final status:", res2.status);
    }
  } else {
    console.log("Direct status:", res1.status);
  }
}
proxyStream();
