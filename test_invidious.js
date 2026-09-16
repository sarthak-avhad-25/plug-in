async function test() {
  const res = await fetch('https://api.invidious.io/instances.json');
  const data = await res.json();
  const valid = data.filter(i => i[1].type === 'https' && i[1].api === true).map(i => i[1].uri);
  console.log(valid.slice(0, 5));
}
test();
